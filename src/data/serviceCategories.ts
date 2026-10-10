import type { ServiceCategory } from "../types/service";

export interface ServiceCategoryOption {
  id: ServiceCategory;
  label: string;
}

export const serviceCategories: ServiceCategoryOption[] = [
  { id: "haircut", label: "Стрижки" },
  { id: "coloring", label: "Фарбування" },
  { id: "styling", label: "Укладки" },
  { id: "hairstyle", label: "Зачіски" },
  { id: "care", label: "Догляд за волоссям" },
];
