import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import "./BookingForm.css";

import BookingCalendar from "./BookingCalendar";

import { fetchBookedSlots, fetchBookedSlotsRange } from "../../lib/bookingApi";
import {
  getTodayDate,
  getAvailableTimesWithBookings,
} from "../../helpers/bookingHelpers";
import { isWorkingDay } from "../../helpers/calendarHelpers";

import type { Service } from "../../types/service";

interface BookingFormProps {
  selectedService: Service | null;
}

function BookingForm({ selectedService }: BookingFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");

  const [showSummary, setShowSummary] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [bookedSlotsByDate, setBookedSlotsByDate] = useState<
    Record<string, { startTime: string; endTime: string }[]>
  >({});

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  // const availableTimes = selectedService
  //   ? getAvailableTimes(visitDate, selectedService.durationMinutes)
  //   : [];

  useEffect(() => {
    let isMounted = true;

    async function loadBookedSlots() {
      if (!visitDate) {
        setBookedSlots([]);
        setSlotsError(null);
        setIsLoadingSlots(false);
        return;
      }

      setIsLoadingSlots(true);
      setSlotsError(null);

      try {
        const slots = await fetchBookedSlots(visitDate);

        if (isMounted) {
          setBookedSlots(slots);
        }
      } catch (error) {
        if (isMounted) {
          setSlotsError(
            error instanceof Error
              ? error.message
              : "Не вдалося перевірити доступний час.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadBookedSlots();

    return () => {
      isMounted = false;
    };
  }, [visitDate]);

  useEffect(() => {
    let isMounted = true;

    async function loadMonthSlots() {
      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();

      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        new Date(year, month + 1, 0).getDate(),
      ).padStart(2, "0")}`;

      if (isMounted) {
        setIsLoadingCalendar(true);
      }

      try {
        const slots = await fetchBookedSlotsRange(startDate, endDate);

        if (isMounted) {
          setBookedSlotsByDate(slots);
        }
      } catch (error) {
        console.error("Не вдалося завантажити зайняті години місяця:", error);
      } finally {
        if (isMounted) {
          setIsLoadingCalendar(false);
        }
      }
    }

    void loadMonthSlots();

    return () => {
      isMounted = false;
    };
  }, [calendarMonth]);

  const freeTimes = selectedService
    ? getAvailableTimesWithBookings(
        visitDate,
        selectedService.durationMinutes,
        bookedSlots,
      )
    : [];

  const availableDates: Record<string, boolean> = {};

  if (selectedService) {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = getTodayDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      if (date < today || !isWorkingDay(date)) {
        availableDates[date] = false;
        continue;
      }

      const possibleTimes = getAvailableTimesWithBookings(
        date,
        selectedService.durationMinutes,
        bookedSlotsByDate[date] ?? [],
      );

      const slots = bookedSlotsByDate[date] ?? [];

      availableDates[date] = possibleTimes.some((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const start = hours * 60 + minutes;
        const end = start + selectedService.durationMinutes;

        return !slots.some((slot) => {
          const [startHour, startMinute] = slot.startTime
            .split(":")
            .map(Number);
          const [endHour, endMinute] = slot.endTime.split(":").map(Number);

          const bookedStart = startHour * 60 + startMinute;
          const bookedEnd = endHour * 60 + endMinute;

          return start < bookedEnd && end > bookedStart;
        });
      });
    }
  }

  async function handleConfirmBooking() {
    if (!selectedService || !visitDate || !visitTime) {
      setBookingError("Перевірте обрану послугу, дату та час.");
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const { error } = await supabase.rpc("create_booking", {
        p_service_id: selectedService.id,
        p_client_name: clientName.trim(),
        p_client_phone: clientPhone.trim(),
        p_booking_date: visitDate,
        p_start_time: visitTime,
      });

      if (error) {
        throw error;
      }

      setBookingSuccess(true);
      setShowSummary(false);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "";

      if (message.includes("Цей час уже зайнятий")) {
        setBookingError(message);
      } else if (message.includes("Не можна записатися на минулий час")) {
        setBookingError("Цей час уже минув. Оберіть іншу дату або годину.");
      } else if (message.includes("Послуга не вміщується в робочий графік")) {
        setBookingError(
          "Ця послуга не вміщується в робочий графік. Оберіть інший час.",
        );
      } else {
        setBookingError(
          message || "Не вдалося створити запис. Спробуйте ще раз.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container booking-intro">
      <p className="eyebrow">Онлайн-запис</p>

      <h2>Обери зручний час для себе</h2>

      {selectedService ? (
        <>
          <div className="booking-selection">
            <h3>Обрана послуга: {selectedService.name}</h3>

            <p>
              Вартість: {selectedService.price} грн · Тривалість:{" "}
              {selectedService.durationMinutes} хв
            </p>
          </div>

          <form
            className="booking-form"
            onSubmit={(event) => {
              event.preventDefault();
              setShowSummary(true);
            }}
          >
            <label>
              Ваше ім’я
              <input
                type="text"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                required
                autoComplete="name"
                placeholder="Наприклад, Олена"
              />
            </label>

            <label>
              Номер телефону
              <input
                type="tel"
                value={clientPhone}
                onChange={(event) => {
                  const value = event.target.value;

                  if (/^[0-9+()\s-]*$/.test(value)) {
                    setClientPhone(value);
                  }
                }}
                pattern="^\+?[0-9\s()-]{7,20}$"
                title="Введи номер телефону: щонайменше 7 цифр, можна використовувати +, пробіли, дужки та дефіси."
                required
                autoComplete="tel"
                placeholder="+380 98 123 45 67"
              />
            </label>

            <label>
              Дата візиту
              <BookingCalendar
                selectedDate={visitDate}
                minDate={getTodayDate()}
                month={calendarMonth}
                availableDates={availableDates}
                isLoading={isLoadingCalendar}
                onMonthChange={setCalendarMonth}
                onDateSelect={(date) => {
                  setVisitDate(date);
                  setVisitTime("");
                }}
              />
              <input type="text" value={visitDate} required readOnly hidden />
            </label>

            <label>
              Час візиту
              <select
                value={freeTimes.includes(visitTime) ? visitTime : ""}
                onChange={(event) => setVisitTime(event.target.value)}
                required
                disabled={
                  !visitDate ||
                  isLoadingSlots ||
                  Boolean(slotsError) ||
                  freeTimes.length === 0
                }
              >
                <option value="">
                  {isLoadingSlots
                    ? "Перевіряємо доступний час..."
                    : slotsError
                      ? "Не вдалося завантажити час"
                      : !visitDate
                        ? "Спочатку обери дату"
                        : freeTimes.length === 0
                          ? "Немає вільного часу"
                          : "Обери час"}
                </option>

                {freeTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {slotsError && <span role="alert">{slotsError}</span>}
            </label>

            <button className="button" type="submit">
              Перевірити запис
            </button>
          </form>

          {showSummary && selectedService && (
            <div className="booking-summary">
              <h3>Перевір свій запис</h3>

              <p>
                <strong>Послуга:</strong> {selectedService.name}
              </p>
              <p>
                <strong>Вартість:</strong> {selectedService.price} грн
              </p>
              <p>
                <strong>Тривалість:</strong> {selectedService.durationMinutes}{" "}
                хв
              </p>
              <p>
                <strong>Ім’я:</strong> {clientName}
              </p>
              <p>
                <strong>Телефон:</strong> {clientPhone}
              </p>
              <p>
                <strong>Дата:</strong> {visitDate}
              </p>
              <p>
                <strong>Час:</strong> {visitTime}
              </p>

              <p>
                Запис буде створено після підтвердження. Після цього він матиме
                статус очікування підтвердження.
              </p>

              {bookingError && <p role="alert">{bookingError}</p>}

              <button
                className="button"
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Зберігаємо запис..." : "Підтвердити запис"}
              </button>

              <button
                className="button"
                type="button"
                onClick={() => {
                  setShowSummary(false);
                  setBookingError(null);
                }}
                disabled={isSubmitting}
              >
                Повернутися до форми
              </button>
            </div>
          )}

          {bookingSuccess && (
            <div className="booking-summary" role="status">
              <h3>Запит на запис прийнято!</h3>
              <p>Твій запис збережено. Очікуй підтвердження від майстра.</p>
            </div>
          )}
        </>
      ) : (
        <p>Спочатку обери послугу в каталозі.</p>
      )}
    </div>
  );
}

export default BookingForm;
