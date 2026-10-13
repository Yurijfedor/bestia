import type { Booking } from "../types/booking";

export function hasBookingConflict(
  newStart: string,
  newEnd: string,
  date: string,
  bookings: Booking[],
): boolean {
  const newStartMinutes = toMinutes(newStart);
  const newEndMinutes = toMinutes(newEnd);

  return bookings.some((booking) => {
    if (booking.date !== date || booking.status === "cancelled") {
      return false;
    }

    const existingStart = toMinutes(booking.startTime);
    const existingEnd = toMinutes(booking.endTime);

    return newStartMinutes < existingEnd && newEndMinutes > existingStart;
  });
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
