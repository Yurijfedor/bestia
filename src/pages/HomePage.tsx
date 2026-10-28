import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { supabase } from "../lib/supabase";

import PortfolioSection from "../components/portfolio/PortfolioSection";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user } = useAuth();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Не вдалося вийти з облікового запису:", error);
    }
  }

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
          <a
            href="/"
            className="header-brand"
            aria-label="Бестія — на головну"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="logo">
              Бестія<span>.</span>
            </span>
            <span className="header-tagline">HAIR STUDIO · ШАРГОРОД</span>
          </a>

          <button
            type="button"
            className="header-menu-toggle"
            aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? "×" : "☰"}
          </button>

          <nav
            id="main-navigation"
            className={`main-nav${isMenuOpen ? " is-open" : ""}`}
            aria-label="Головна навігація"
          >
            <a href="#services" onClick={() => setIsMenuOpen(false)}>
              Послуги
            </a>

            <a href="#portfolio" onClick={() => setIsMenuOpen(false)}>
              Роботи
            </a>

            <a href="#contacts" onClick={() => setIsMenuOpen(false)}>
              Контакти
            </a>

            {user && (
              <>
                <Link to="/account" onClick={() => setIsMenuOpen(false)}>
                  Мій кабінет
                </Link>
                <span className="header-account">{user.email}</span>
                <button
                  type="button"
                  className="header-logout"
                  onClick={() => {
                    setIsMenuOpen(false);
                    void handleLogout();
                  }}
                >
                  Вийти
                </button>
              </>
            )}

            {!user && (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                Увійти
              </Link>
            )}

            <a
              href="#booking"
              className="header-cta"
              onClick={() => setIsMenuOpen(false)}
            >
              Записатися ↗
            </a>
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
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBook={(service) => {
                      setSelectedService(service);
                      document.getElementById("booking")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                  />
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
