import { supabase } from "./supabase";

export interface AdminBooking {
  id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  service_duration_minutes: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export async function fetchAdminBookings(): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, service_id, service_name, service_price, service_duration_minutes, client_name, client_phone, booking_date, start_time, end_time, status, created_at",
    )
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(`Не вдалося завантажити записи: ${error.message}`);
  }

  return (data ?? []) as AdminBooking[];
}

export async function updateAdminBookingStatus(
  bookingId: string,
  newStatus: "confirmed" | "cancelled",
): Promise<void> {
  const { error } = await supabase.rpc("admin_update_booking_status", {
    p_booking_id: bookingId,
    p_new_status: newStatus,
  });

  if (error) {
    throw new Error(`Не вдалося змінити статус запису: ${error.message}`);
  }
}
