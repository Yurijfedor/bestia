export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
}
