import "./BookingCalendar.css";

interface BookingCalendarProps {
  selectedDate: string;
  minDate: string;
  month: Date;
  availableDates: Record<string, boolean>;
  isLoading: boolean;
  onDateSelect: (date: string) => void;
  onMonthChange: (month: Date) => void;
}

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function BookingCalendar({
  selectedDate,
  minDate,
  month,
  availableDates,
  isLoading,
  onDateSelect,
  onMonthChange,
}: BookingCalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const monthLabel = new Intl.DateTimeFormat("uk-UA", {
    month: "long",
    year: "numeric",
  }).format(month);

  const previousMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__header">
        <button
          type="button"
          onClick={() => onMonthChange(previousMonth)}
          disabled={
            previousMonth.getFullYear() < Number(minDate.slice(0, 4)) ||
            (previousMonth.getFullYear() === Number(minDate.slice(0, 4)) &&
              previousMonth.getMonth() < Number(minDate.slice(5, 7)) - 1)
          }
          aria-label="Попередній місяць"
        >
          ‹
        </button>

        <strong>{monthLabel}</strong>

        <button
          type="button"
          onClick={() => onMonthChange(nextMonth)}
          aria-label="Наступний місяць"
        >
          ›
        </button>
      </div>

      {isLoading && (
        <p className="booking-calendar__status">Завантажуємо доступність...</p>
      )}

      <div className="booking-calendar__grid">
        {weekDays.map((day) => (
          <span className="booking-calendar__weekday" key={day}>
            {day}
          </span>
        ))}

        {Array.from({ length: firstWeekday }, (_, index) => (
          <span className="booking-calendar__empty" key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = formatDate(year, monthIndex, day);
          const isPast = date < minDate;
          const isSunday = new Date(year, monthIndex, day).getDay() === 0;
          const isAvailable = availableDates[date] === true;
          const disabled = isPast || isSunday || isLoading || !isAvailable;

          return (
            <button
              type="button"
              key={date}
              className={`booking-calendar__day${
                selectedDate === date && !disabled ? " is-selected" : ""
              }${disabled ? " is-disabled" : ""}`}
              disabled={disabled}
              onClick={() => onDateSelect(date)}
              aria-label={`${day} ${monthLabel}`}
              aria-pressed={selectedDate === date}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
