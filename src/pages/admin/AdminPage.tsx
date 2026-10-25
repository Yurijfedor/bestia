import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminBookings,
  updateAdminBookingStatus,
  type AdminBooking,
} from "../../lib/adminApi";

const statusLabels: Record<AdminBooking["status"], string> = {
  pending: "Очікує підтвердження",
  confirmed: "Підтверджено",
  cancelled: "Скасовано",
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("uk-UA");
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
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
    let isActive = true;

    async function loadInitialBookings() {
      setError("");

      try {
        const data = await fetchAdminBookings();

        if (isActive) {
          setBookings(data);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Не вдалося завантажити записи.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialBookings();

    return () => {
      isActive = false;
    };
  }, []);

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
      <header className="admin-page__header">
        <h1>Панель адміністратора</h1>
        <p>Керування записами клієнтів салону «Бестія»</p>
        <button type="button" onClick={() => void loadBookings()}>
          Оновити список
        </button>
      </header>

      {isLoading && <p>Завантаження записів...</p>}
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      {!isLoading && !error && bookings.length === 0 && (
        <p>Записів поки немає.</p>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="admin-page__table-wrapper">
          <table className="admin-page__table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Час</th>
                <th>Послуга</th>
                <th>Клієнт</th>
                <th>Телефон</th>
                <th>Тривалість</th>
                <th>Ціна</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{formatDate(booking.booking_date)}</td>
                  <td>
                    {booking.start_time.slice(0, 5)}–
                    {booking.end_time.slice(0, 5)}
                  </td>
                  <td>{booking.service_name}</td>
                  <td>{booking.client_name}</td>
                  <td>{booking.client_phone}</td>
                  <td>{booking.service_duration_minutes} хв</td>
                  <td>{booking.service_price} грн</td>
                  <td>{statusLabels[booking.status]}</td>
                  <td>
                    {booking.status === "pending" && (
                      <button
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
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() =>
                          void handleStatusChange(booking, "cancelled")
                        }
                      >
                        Скасувати
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
