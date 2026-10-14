import { supabase } from "./supabase";

export interface BookedSlot {
  startTime: string;
  endTime: string;
}

interface BookedSlotRow {
  start_time: string;
  end_time: string;
}

export async function fetchBookedSlots(date: string): Promise<BookedSlot[]> {
  const { data, error } = await supabase.rpc("get_booked_slots", {
    p_booking_date: date,
  });

  if (error) {
    throw new Error(`Не вдалося завантажити зайняті години: ${error.message}`);
  }

  return ((data ?? []) as BookedSlotRow[]).map((row) => ({
    startTime: row.start_time,
    endTime: row.end_time,
  }));
}

export async function fetchBookedSlotsRange(
  startDate: string,
  endDate: string,
): Promise<Record<string, BookedSlot[]>> {
  const { data, error } = await supabase.rpc("get_booked_slots_range", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    throw new Error(`Не вдалося завантажити зайняті години: ${error.message}`);
  }

  const result: Record<string, BookedSlot[]> = {};

  for (const row of (data ?? []) as {
    booking_date: string;
    start_time: string;
    end_time: string;
  }[]) {
    const date = row.booking_date;

    if (!result[date]) {
      result[date] = [];
    }

    result[date].push({
      startTime: row.start_time,
      endTime: row.end_time,
    });
  }

  return result;
}
