import type { Service } from "../../types/service";

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="service-card">
      <h3>{service.name}</h3>

      <p>{service.description}</p>

      <div className="service-card-details">
        <span>{service.price} грн</span>
        <span>{service.durationMinutes} хв</span>
      </div>
    </article>
  );
}

export default ServiceCard;
