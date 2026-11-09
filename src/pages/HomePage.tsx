import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import PortfolioSection from "../components/portfolio/PortfolioSection";
import type { AiHairstyleRecommendation } from "../types/aiStyle";
import type { Service } from "../types/service";
import { fetchServices } from "../lib/servicesApi";
import { workingHours } from "../data/workingHours";
import SiteHeader from "../components/layout/SiteHeader";
import ServicesSection from "../components/services/ServicesSection";
import BookingForm from "../components/booking/BookingForm";

const dayNames = {
  monday: "Понеділок",
  tuesday: "Вівторок",
  wednesday: "Середа",
  thursday: "Четвер",
  friday: "П’ятниця",
  saturday: "Субота",
  sunday: "Неділя",
};

function HomePage() {
  const location = useLocation();

  const aiRecommendation = location.state?.aiRecommendation as
    | AiHairstyleRecommendation
    | undefined;

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      try {
        const loadedServices = await fetchServices();

        if (isMounted) {
          setServices(loadedServices);
          setServicesError(null);
        }
      } catch (error) {
        if (isMounted) {
          setServicesError(
            error instanceof Error
              ? error.message
              : "Не вдалося завантажити каталог послуг.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingServices(false);
        }
      }
    }

    void loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (aiRecommendation) {
      requestAnimationFrame(() => {
        document.getElementById("booking")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [aiRecommendation]);

  return (
    <div className="app">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="container">
            <p className="eyebrow">Перукарські послуги · Шаргород</p>

            <h1>
              Твій стиль.
              <br />
              Твоя краса.
            </h1>

            <p className="hero-text">
              Стрижки, фарбування, укладки та зачіски з індивідуальним підходом.
            </p>

            <a href="#booking" className="button">
              Записатися онлайн
            </a>
          </div>
        </section>

        <ServicesSection
          services={services}
          isLoading={isLoadingServices}
          error={servicesError}
          selectedService={selectedService}
          onSelectService={(service) => {
            setSelectedService(service);

            if (service) {
              document.getElementById("booking")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
        />

        <PortfolioSection />

        <section id="booking" className="section">
          <BookingForm
            selectedService={selectedService}
            aiRecommendation={aiRecommendation}
          />
        </section>

        <section id="contacts" className="section section-dark">
          <div className="container">
            <p className="eyebrow">Контакти</p>

            <h2>Буду рада зустрічі</h2>

            <div className="contact-info">
              <p>📍 Шаргород, вул. Героїв Майдану, 250</p>
              <p>💬 Telegram: +380 98 273 35 27</p>
              <p>💬 Viber: +380 98 273 35 27</p>

              <div className="working-hours">
                <h3>Графік роботи</h3>

                {workingHours.map((hours) => (
                  <div className="working-hours-row" key={hours.day}>
                    <span>{dayNames[hours.day]}</span>

                    <span>
                      {hours.isWorking
                        ? `${hours.start}–${hours.end}`
                        : "Вихідний"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© 2026 Бестія</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
