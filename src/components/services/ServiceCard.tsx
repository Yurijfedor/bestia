import type { Service } from "../../types/service";

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
}

function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <article className="service-card">
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
