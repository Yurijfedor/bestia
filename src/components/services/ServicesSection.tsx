import { useState } from "react";
import { serviceCategories } from "../../data/serviceCategories";
import ServiceCard from "./ServiceCard";
import type { Service } from "../../types/service";

interface ServicesSectionProps {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  selectedService: Service | null;
  onSelectService: (service: Service | null) => void;
}

function ServicesSection({
  services,
  isLoading,
  error,
  selectedService,
  onSelectService,
}: ServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((service) => service.category === selectedCategory);

  return (
    <section className="section" id="services">
      <div className="container">
        <p className="eyebrow">Наші послуги</p>

        <h2>Обери свій образ</h2>

        {isLoading ? (
          <p>Завантажуємо послуги...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : services.length === 0 ? (
          <p>Наразі послуги недоступні.</p>
        ) : (
          <>
            <div className="service-filters">
              <button
                type="button"
                className={selectedCategory === "all" ? "active" : ""}
                onClick={() => setSelectedCategory("all")}
              >
                Усі послуги
              </button>

              {serviceCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={selectedCategory === category.id ? "active" : ""}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="services-grid">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={onSelectService}
                />
              ))}
            </div>
          </>
        )}

        {selectedService && (
          <div className="booking-selection">
            <h3>Ви обрали: {selectedService.name}</h3>

            <p>
              Вартість: {selectedService.price} грн · Тривалість:{" "}
              {selectedService.durationMinutes} хв
            </p>

            <button type="button" onClick={() => onSelectService(null)}>
              Скасувати вибір
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesSection;
