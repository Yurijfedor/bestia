import { supabase } from "./supabase";
import type { Service, ServiceCategory } from "../types/service";

interface ServiceRow {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: ServiceCategory;
  is_active: boolean;
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, name, description, price, duration_minutes, category, is_active",
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(`Не вдалося завантажити послуги: ${error.message}`);
  }

  return ((data ?? []) as ServiceRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    durationMinutes: row.duration_minutes,
    category: row.category,
  }));
}
