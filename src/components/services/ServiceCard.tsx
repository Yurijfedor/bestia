import type { Service } from "../../types/service";
import { serviceImages } from "../../data/serviceImages";

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
}

function ServiceCard({ service, onBook }: ServiceCardProps) {
  const image = serviceImages[service.id as keyof typeof serviceImages];

  return (
    <article
      className="service-card"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(20, 16, 18, 0.95) 0%, rgba(20, 16, 18, 0.35) 55%, rgba(20, 16, 18, 0.05) 100%), url("${image}")`,
      }}
    >
      <h3>{service.name}</h3>

      <p>{service.description}</p>

      <div className="service-card-details">
        <span>{service.price} грн</span>
        <span>{service.durationMinutes} хв</span>
      </div>

      {onBook && (
        <button
          className="service-card-book"
          type="button"
          onClick={() => onBook(service)}
        >
          Записатися
        </button>
      )}
    </article>
  );
}

export default ServiceCard;
