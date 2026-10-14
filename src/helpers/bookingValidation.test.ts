import { describe, expect, it } from "vitest";
import type { Booking } from "../types/booking";
import { hasBookingConflict } from "./bookingValidation";

const existingBooking: Booking = {
  id: "booking-1",
  serviceId: "mens-haircut",
  serviceName: "Чоловіча стрижка",
  servicePrice: 500,
  serviceDurationMinutes: 30,
  clientName: "Олена",
  clientPhone: "+380991234567",
  date: "2026-10-14",
  startTime: "14:00",
  endTime: "15:30",
  status: "confirmed",
  createdAt: "2026-10-01T10:00:00.000Z",
};

describe("hasBookingConflict", () => {
  it("виявляє перетин часу на ту саму дату", () => {
    expect(
      hasBookingConflict("15:00", "16:00", "2026-10-14", [existingBooking]),
    ).toBe(true);
  });

  it("дозволяє записи, що йдуть один за одним", () => {
    expect(
      hasBookingConflict("15:30", "16:30", "2026-10-14", [existingBooking]),
    ).toBe(false);
  });

  it("не вважає запис на іншу дату конфліктом", () => {
    expect(
      hasBookingConflict("14:30", "15:00", "2026-10-15", [existingBooking]),
    ).toBe(false);
  });

  it("ігнорує скасовані записи", () => {
    const cancelledBooking: Booking = {
      ...existingBooking,
      status: "cancelled",
    };

    expect(
      hasBookingConflict("14:30", "15:00", "2026-10-14", [cancelledBooking]),
    ).toBe(false);
  });
});
