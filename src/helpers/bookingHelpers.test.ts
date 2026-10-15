import { describe, expect, it } from "vitest";
import { getAvailableTimesWithBookings } from "./bookingHelpers";

describe("getAvailableTimesWithBookings", () => {
  const bookings = [
    { startTime: "09:00:00", endTime: "11:00:00" },
    { startTime: "11:00:00", endTime: "11:40:00" },
    { startTime: "13:00:00", endTime: "13:40:00" },
    { startTime: "15:00:00", endTime: "18:00:00" },
  ];

  it("додає початок одразу після завершення попереднього запису", () => {
    const times = getAvailableTimesWithBookings("2026-10-22", 40, bookings);

    expect(times).toContain("11:40");
    expect(times).toContain("13:40");
  });

  it("додає наступний початок через 30 хвилин", () => {
    const times = getAvailableTimesWithBookings("2026-10-22", 40, bookings);

    expect(times).toContain("12:10");
    expect(times).toContain("14:10");
  });

  it("дозволяє початок о 17:20 після завершення попереднього запису", () => {
    const times = getAvailableTimesWithBookings("2026-10-22", 40, [
      { startTime: "16:40:00", endTime: "17:20:00" },
    ]);

    expect(times).toContain("17:20");
  });

  it("не пропонує час, який перетинається з наступним записом", () => {
    const times = getAvailableTimesWithBookings("2026-10-22", 40, bookings);

    expect(times).not.toContain("12:40");
    expect(times).not.toContain("14:40");
    expect(times).not.toContain("13:00");
    expect(times).not.toContain("15:00");
  });

  it("не пропонує початок, якщо послуга завершиться після закриття", () => {
    const times = getAvailableTimesWithBookings("2026-10-22", 40, []);

    expect(times).toContain("17:00");
    expect(times).not.toContain("17:20");
    expect(times).not.toContain("17:30");
    expect(times).not.toContain("18:00");
  });

  it("повертає порожній список у неділю", () => {
    const times = getAvailableTimesWithBookings("2026-10-25", 40, []);

    expect(times).toEqual([]);
  });
});
