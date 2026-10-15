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
  if (!date || isSunday(date) || durationMinutes <= 0) {
    return [];
  }

  const daySchedule = workingHours.find(
    (hours) => hours.day === getDayKey(date),
  );

  if (!daySchedule || !daySchedule.isWorking) {
    return [];
  }

  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const toTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60,
    ).padStart(2, "0")}`;

  const workStart = toMinutes(daySchedule.start);
  const workEnd = toMinutes(daySchedule.end);

  const sortedBookings = bookedSlots
    .map((slot) => ({
      start: toMinutes(slot.startTime),
      end: toMinutes(slot.endTime),
    }))
    .sort((a, b) => a.start - b.start);

  const available = new Set<number>();
  let gapStart = workStart;

  for (const booking of sortedBookings) {
    // Generate starts in the free gap before this booking.
    for (
      let start = gapStart;
      start + durationMinutes <= booking.start;
      start += 30
    ) {
      available.add(start);
    }

    // The next gap begins at this booking's end.
    gapStart = Math.max(gapStart, booking.end);
  }

  // Generate starts in the final gap before closing.
  for (let start = gapStart; start + durationMinutes <= workEnd; start += 30) {
    available.add(start);
  }

  return [...available].map(toTime).sort();
}
