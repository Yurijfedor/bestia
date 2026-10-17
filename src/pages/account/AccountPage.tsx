import { useEffect, useState } from "react";
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

export default function AccountPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Kyiv",
  });

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.booking_date >= today &&
      booking.status !== "cancelled" &&
      booking.status !== "completed",
  );

  const pastBookings = bookings.filter(
    (booking) =>
      booking.booking_date < today ||
      booking.status === "cancelled" ||
      booking.status === "completed",
  );

  function renderBooking(booking: Booking) {
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
      </section>

      <section>
        <h2>Мої записи</h2>

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
