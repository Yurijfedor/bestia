import { workingHours } from "../data/workingHours";

export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isSunday(date: string) {
  if (!date) return false;

  const [year, month, day] = date.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);

  return selectedDate.getDay() === 0;
}

export function getDayKey(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;

  return days[selectedDate.getDay()];
}

export function getAvailableTimes(date: string, durationMinutes: number) {
  if (!date || isSunday(date)) return [];

  const dayKey = getDayKey(date);
  const daySchedule = workingHours.find((hours) => hours.day === dayKey);

  if (!daySchedule || !daySchedule.isWorking) return [];

  const [startHour, startMinute] = daySchedule.start.split(":").map(Number);
  const [endHour, endMinute] = daySchedule.end.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const times: string[] = [];

  for (let time = start; time + durationMinutes <= end; time += 30) {
    const hour = String(Math.floor(time / 60)).padStart(2, "0");
    const minute = String(time % 60).padStart(2, "0");

    times.push(`${hour}:${minute}`);
  }

  return times;
}

export function getAvailableTimesWithBookings(
  date: string,
  durationMinutes: number,
  bookedSlots: { startTime: string; endTime: string }[],
): string[] {
  const regularTimes = getAvailableTimes(date, durationMinutes);

  const exactTimes = bookedSlots.map((slot) => slot.endTime.slice(0, 5));

  const candidates = [...new Set([...regularTimes, ...exactTimes])].sort();

  return candidates.filter((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const start = hours * 60 + minutes;
    const end = start + durationMinutes;

    if (end > 18 * 60) return false;

    const overlaps = bookedSlots.some((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);

      const bookedStart = startHour * 60 + startMinute;
      const bookedEnd = endHour * 60 + endMinute;

      return start < bookedEnd && end > bookedStart;
    });

    return !overlaps;
  });
}
