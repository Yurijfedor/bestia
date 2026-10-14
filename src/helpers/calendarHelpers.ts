import { getAvailableTimes, getDayKey, isSunday } from "./bookingHelpers";
import { workingHours } from "../data/workingHours";

export interface BookedSlot {
  startTime: string;
  endTime: string;
}

export function isWorkingDay(date: string): boolean {
  if (!date || isSunday(date)) {
    return false;
  }

  const dayKey = getDayKey(date);
  const schedule = workingHours.find((day) => day.day === dayKey);

  return Boolean(schedule?.isWorking);
}

export function hasAvailableStartTime(
  date: string,
  durationMinutes: number,
  bookedSlots: BookedSlot[],
): boolean {
  if (!isWorkingDay(date)) {
    return false;
  }

  const possibleTimes = getAvailableTimes(date, durationMinutes);

  return possibleTimes.some((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const start = hours * 60 + minutes;
    const end = start + durationMinutes;

    return !bookedSlots.some((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);

      const bookedStart = startHour * 60 + startMinute;
      const bookedEnd = endHour * 60 + endMinute;

      return start < bookedEnd && end > bookedStart;
    });
  });
}
