import { useEffect, useState } from "react";
import type { Service } from "../types/service";
import { fetchServices } from "../lib/servicesApi";
import { workingHours } from "../data/workingHours";
import ServiceCard from "../components/services/ServiceCard";
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

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <a href="/" className="logo">
            Бестія
          </a>

          <nav className="main-nav">
            <a href="#services">Послуги</a>
            <a href="#portfolio">Роботи</a>
            <a href="#booking">Запис</a>
            <a href="#contacts">Контакти</a>
          </nav>
        </div>
      </header>

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

        <section id="services" className="section">
          <div className="container">
            <p className="eyebrow">Послуги</p>

            <h2>Те, що підкреслює твою красу</h2>

            {isLoadingServices ? (
              <p>Завантажуємо послуги...</p>
            ) : servicesError ? (
              <p role="alert">{servicesError}</p>
            ) : services.length === 0 ? (
              <p>Наразі послуги недоступні.</p>
            ) : (
              <div className="services-grid">
                {services.slice(0, 4).map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}

            <a href="#all-services" className="button services-more">
              Усі послуги
            </a>
          </div>
        </section>

        <ServicesSection
          services={services}
          isLoading={isLoadingServices}
          error={servicesError}
          selectedService={selectedService}
          onSelectService={setSelectedService}
        />

        <section id="portfolio" className="section section-muted">
          <div className="container">
            <p className="eyebrow">Портфоліо</p>

            <h2>Мої роботи</h2>

            <div className="portfolio-placeholder">
              Тут з&apos;являться фотографії робіт
            </div>
          </div>
        </section>

        <section id="booking" className="section">
          <BookingForm selectedService={selectedService} />
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
