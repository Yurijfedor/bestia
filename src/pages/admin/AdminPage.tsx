import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchAdminBookings,
  updateAdminBookingStatus,
  type AdminBooking,
} from "../../lib/adminApi";
import { serviceImages } from "../../data/serviceImages";

type BookingFilter = "all" | AdminBooking["status"];

const statusLabels: Record<AdminBooking["status"], string> = {
  pending: "Очікує підтвердження",
  confirmed: "Підтверджено",
  cancelled: "Скасовано",
};

const filterLabels: Record<BookingFilter, string> = {
  all: "Усі записи",
  pending: "Очікують",
  confirmed: "Підтверджені",
  cancelled: "Скасовані",
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchAdminBookings();
      setBookings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не вдалося завантажити записи.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBookings]);

  const stats = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending")
        .length,
      confirmed: bookings.filter((booking) => booking.status === "confirmed")
        .length,
      cancelled: bookings.filter((booking) => booking.status === "cancelled")
        .length,
    }),
    [bookings],
  );

  const filteredBookings = useMemo(
    () =>
      filter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === filter),
    [bookings, filter],
  );

  async function handleStatusChange(
    booking: AdminBooking,
    newStatus: "confirmed" | "cancelled",
  ) {
    const action = newStatus === "confirmed" ? "підтвердити" : "скасувати";

    if (
      !window.confirm(
        `Ви впевнені, що хочете ${action} запис клієнта ${booking.client_name}?`,
      )
    ) {
      return;
    }

    setUpdatingId(booking.id);
    setError("");
    setSuccess("");

    try {
      await updateAdminBookingStatus(booking.id, newStatus);

      setSuccess(
        newStatus === "confirmed"
          ? "Запис успішно підтверджено."
          : "Запис успішно скасовано.",
      );

      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося змінити статус запису.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page__container">
        <header className="admin-page__header">
          <div>
            <h1>Панель адміністратора</h1>
            <p>Керування записами клієнтів салону «Бестія»</p>
          </div>

          <div className="admin-page__header-actions">
            <Link to="/" className="admin-page__home">
              ← На головну
            </Link>

            <button
              className="admin-page__refresh"
              type="button"
              onClick={() => void loadBookings()}
              disabled={isLoading}
            >
              {isLoading ? "Оновлення..." : "↻ Оновити список"}
            </button>
          </div>
        </header>

        {error && (
          <p className="admin-message admin-message--error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="admin-message admin-message--success" role="status">
            {success}
          </p>
        )}

        <section aria-label="Керування записами">
          <div className="admin-filters">
            {(Object.keys(filterLabels) as BookingFilter[]).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                className={`admin-filter ${
                  filter === filterKey ? "admin-filter--active" : ""
                }`}
                onClick={() => setFilter(filterKey)}
                aria-pressed={filter === filterKey}
              >
                {filterLabels[filterKey]}
                {filterKey !== "all" && ` (${stats[filterKey]})`}
                {filterKey === "all" && ` (${stats.all})`}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="admin-empty">Завантаження записів...</div>
          )}

          {!isLoading && !error && filteredBookings.length === 0 && (
            <div className="admin-empty">
              {bookings.length === 0
                ? "Записів поки немає."
                : "За обраним фільтром записів немає."}
            </div>
          )}

          {!isLoading && filteredBookings.length > 0 && (
            <div className="admin-bookings">
              {filteredBookings.map((booking) => {
                const image = serviceImages[booking.service_id];

                return (
                  <article className="admin-booking" key={booking.id}>
                    {image && (
                      <img
                        className="admin-booking__image"
                        src={image}
                        alt={booking.service_name}
                        loading="lazy"
                      />
                    )}

                    <div className="admin-booking__main">
                      <h3>{booking.service_name}</h3>

                      <span
                        className={`admin-status admin-status--${booking.status}`}
                      >
                        {statusLabels[booking.status]}
                      </span>

                      <div className="admin-booking__details">
                        <span>📅 {formatDate(booking.booking_date)}</span>
                        <span>
                          🕒 {booking.start_time.slice(0, 5)}–
                          {booking.end_time.slice(0, 5)}
                        </span>
                        <span>⏱ {booking.service_duration_minutes} хв</span>
                      </div>

                      <div className="admin-booking__client">
                        <strong>{booking.client_name}</strong>
                        <span> · {booking.client_phone}</span>
                      </div>
                    </div>

                    <div className="admin-booking__actions">
                      <strong className="admin-booking__price">
                        {booking.service_price} грн
                      </strong>

                      <div className="admin-booking__buttons">
                        {booking.status === "pending" && (
                          <button
                            className="admin-button admin-button--confirm"
                            type="button"
                            disabled={updatingId !== null}
                            onClick={() =>
                              void handleStatusChange(booking, "confirmed")
                            }
                          >
                            {updatingId === booking.id
                              ? "Зачекайте..."
                              : "Підтвердити"}
                          </button>
                        )}

                        {(booking.status === "pending" ||
                          booking.status === "confirmed") && (
                          <button
                            className="admin-button admin-button--cancel"
                            type="button"
                            disabled={updatingId !== null}
                            onClick={() =>
                              void handleStatusChange(booking, "cancelled")
                            }
                          >
                            Скасувати
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
