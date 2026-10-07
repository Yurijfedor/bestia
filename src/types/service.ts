export type ServiceCategory =
  | "haircut"
  | "coloring"
  | "styling"
  | "hairstyle"
  | "care";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
}
