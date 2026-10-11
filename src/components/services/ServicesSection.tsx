import { useState } from "react";
import { services } from "../../data/services";
import { serviceCategories } from "../../data/serviceCategories";
import ServiceCard from "./ServiceCard";

function ServicesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((service) => service.category === selectedCategory);

  return (
    <section className="section" id="all-services">
      <div className="container">
        <p className="eyebrow">Наші послуги</p>

        <h2>Обери свій образ</h2>

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
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
