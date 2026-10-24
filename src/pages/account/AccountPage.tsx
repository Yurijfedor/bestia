import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { supabase } from "../../lib/supabase";

interface Booking {
  id: string;
  service_name: string;
  service_price: number | string;
  service_duration_minutes: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "Очікує підтвердження",
  confirmed: "Підтверджено",
  cancelled: "Скасовано",
  completed: "Завершено",
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function formatPrice(price: number | string) {
  return `${Number(price).toLocaleString("uk-UA")} грн`;
}

function isCancellationAllowed(booking: Booking) {
  if (!["pending", "confirmed"].includes(booking.status)) {
    return false;
  }

  // Перетворюємо час салону Europe/Kyiv на UTC,
  // враховуючи літній і зимовий час.
  const [year, month, day] = booking.booking_date.split("-").map(Number);
  const [hour, minute] = booking.start_time.split(":").map(Number);

  const target = Date.UTC(year, month - 1, day, hour, minute);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  // Початкове наближення, після чого уточнюємо зсув
  // за фактичним часом у Europe/Kyiv.
  const parts = formatter.formatToParts(new Date(target));
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  const displayedAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
  );

  const offset = displayedAsUtc - target;
  const appointmentUtc = target - offset;

  return appointmentUtc - Date.now() > 24 * 60 * 60 * 1000;
}

function cancellationErrorMessage(message: string) {
  if (message.includes("24 години")) {
    return "Скасувати запис можна лише більш ніж за 24 години до візиту.";
  }

  if (message.includes("не належить") || message.includes("не знайдено")) {
    return "Не вдалося знайти ваш запис. Оновіть сторінку.";
  }

  if (message.includes("уже не можна скасувати")) {
    return "Цей запис уже не можна скасувати.";
  }

  return "Не вдалося скасувати запис. Спробуйте ще раз.";
}

export default function AccountPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [cancellationMessage, setCancellationMessage] = useState("");
  const [cancellationError, setCancellationError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!user) {
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      setProfileError("");
      setProfileMessage("");

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!isActive) return;

      if (fetchError) {
        console.error("Помилка завантаження профілю:", fetchError);
        setProfileError("Не вдалося завантажити особисті дані.");
      } else {
        const profile = data as Profile | null;
        setFullName(profile?.full_name ?? "");
        setPhone(profile?.phone ?? "");
      }

      setIsProfileLoading(false);
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    let isActive = true;

    async function loadBookings() {
      if (!user) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(
          "id, service_name, service_price, service_duration_minutes, booking_date, start_time, end_time, status",
        )
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (!isActive) return;

      if (fetchError) {
        console.error("Помилка завантаження записів:", fetchError);
        setError("Не вдалося завантажити записи. Спробуйте оновити сторінку.");
      } else {
        setBookings((data ?? []) as Booking[]);
      }

      setIsLoading(false);
    }

    void loadBookings();

    return () => {
      isActive = false;
    };
  }, [user]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    const normalizedName = fullName.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedName) {
      setProfileError("Будь ласка, введіть ім’я.");
      setProfileMessage("");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: normalizedName,
        phone: normalizedPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setIsSavingProfile(false);

    if (updateError) {
      console.error("Помилка збереження профілю:", updateError);
      setProfileError("Не вдалося зберегти зміни. Спробуйте ще раз.");
      return;
    }

    setFullName(normalizedName);
    setPhone(normalizedPhone);
    setProfileMessage("Особисті дані успішно збережено.");
  }

  async function handleCancelBooking(booking: Booking) {
    const confirmed = window.confirm(
      `Скасувати запис «${booking.service_name}» на ${formatDate(
        booking.booking_date,
      )} о ${formatTime(booking.start_time)}?`,
    );

    if (!confirmed) return;

    setCancellingBookingId(booking.id);
    setCancellationMessage("");
    setCancellationError("");

    const { error: rpcError } = await supabase.rpc("cancel_own_booking", {
      p_booking_id: booking.id,
    });

    setCancellingBookingId(null);

    if (rpcError) {
      console.error("Помилка скасування запису:", rpcError);
      setCancellationError(cancellationErrorMessage(rpcError.message));
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.map((item) =>
        item.id === booking.id ? { ...item, status: "cancelled" } : item,
      ),
    );

    setCancellationMessage("Запис успішно скасовано.");
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Kyiv",
  });

  const visibleBookings = bookings.filter(
    (booking) => booking.status !== "cancelled",
  );

  const upcomingBookings = visibleBookings.filter(
    (booking) =>
      booking.booking_date >= today && booking.status !== "completed",
  );

  const pastBookings = visibleBookings.filter(
    (booking) => booking.booking_date < today || booking.status === "completed",
  );

  function renderBooking(booking: Booking) {
    const canCancel = isCancellationAllowed(booking);

    return (
      <article key={booking.id} className="booking-card">
        <h3>{booking.service_name}</h3>

        <p>
          <strong>Дата:</strong> {formatDate(booking.booking_date)}
        </p>

        <p>
          <strong>Час:</strong> {formatTime(booking.start_time)}–
          {formatTime(booking.end_time)}
        </p>

        <p>
          <strong>Тривалість:</strong> {booking.service_duration_minutes} хв
        </p>

        <p>
          <strong>Вартість:</strong> {formatPrice(booking.service_price)}
        </p>

        <p>
          <strong>Статус:</strong>{" "}
          {statusLabels[booking.status] ?? booking.status}
        </p>

        {canCancel && (
          <button
            type="button"
            onClick={() => void handleCancelBooking(booking)}
            disabled={cancellingBookingId !== null}
          >
            {cancellingBookingId === booking.id
              ? "Скасовуємо..."
              : "Скасувати запис"}
          </button>
        )}
      </article>
    );
  }

  return (
    <main className="container">
      <h1>Мій кабінет</h1>

      <p>Вітаємо в особистому кабінеті!</p>

      <section>
        <h2>Мої дані</h2>

        <p>
          <strong>Електронна пошта:</strong> {user?.email}
        </p>

        {isProfileLoading ? (
          <p>Завантажуємо особисті дані...</p>
        ) : (
          <form onSubmit={handleProfileSubmit}>
            <div>
              <label htmlFor="profile-full-name">Ім’я та прізвище</label>
              <input
                id="profile-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="profile-phone">Номер телефону</label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={30}
              />
            </div>

            {profileError && <p role="alert">{profileError}</p>}
            {profileMessage && <p role="status">{profileMessage}</p>}

            <button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? "Зберігаємо..." : "Зберегти зміни"}
            </button>
          </form>
        )}

        {!isProfileLoading && profileError && (
          <p role="alert">{profileError}</p>
        )}
      </section>

      <section>
        <h2>Мої записи</h2>

        {cancellationMessage && <p role="status">{cancellationMessage}</p>}

        {cancellationError && <p role="alert">{cancellationError}</p>}

        {isLoading && <p>Завантажуємо записи...</p>}
        {!isLoading && error && <p role="alert">{error}</p>}

        {!isLoading && !error && bookings.length === 0 && (
          <p>У вас поки немає записів.</p>
        )}

        {!isLoading && !error && bookings.length > 0 && (
          <>
            <h3>Майбутні записи</h3>

            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(renderBooking)
            ) : (
              <p>Майбутніх записів немає.</p>
            )}

            <h3>Минулі записи</h3>

            {pastBookings.length > 0 ? (
              pastBookings.map(renderBooking)
            ) : (
              <p>Минулі записи відсутні.</p>
            )}
          </>
        )}
      </section>

      <Link to="/">Повернутися на головну</Link>
    </main>
  );
}
