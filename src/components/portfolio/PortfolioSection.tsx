import { useEffect, useState } from "react";

type PortfolioCategory = "all" | "color" | "cuts" | "hairstyles";

interface PortfolioItem {
  id: string;
  title: string;
  category: Exclude<PortfolioCategory, "all">;
  image: string;
  alt: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: "balayage",
    title: "Карамельний балаяж",
    category: "color",
    image: "/images/portfolio/balayage-waves.jpg",
    alt: "Довге волосся з карамельними переходами кольору",
  },
  {
    id: "updo",
    title: "Елегантна зачіска",
    category: "hairstyles",
    image: "/images/portfolio/elegant-updo.jpg",
    alt: "Елегантна вечірня зачіска з декоративною прикрасою",
  },
  {
    id: "lob",
    title: "Сучасна форма",
    category: "cuts",
    image: "/images/portfolio/blonde-lob.jpg",
    alt: "Середня стрижка з м'якими світлими пасмами",
  },
  {
    id: "bridal",
    title: "Особливий момент",
    category: "hairstyles",
    image: "/images/portfolio/bridal-hairstyle.jpg",
    alt: "Святкова зачіска з м'якими локонами",
  },
  {
    id: "copper",
    title: "Мідні відтінки",
    category: "color",
    image: "/images/portfolio/copper-waves.jpg",
    alt: "Об'ємне волосся теплого мідного відтінку",
  },
  {
    id: "child",
    title: "Дитяча стрижка",
    category: "cuts",
    image: "/images/portfolio/childrens-haircut.jpg",
    alt: "Сучасна коротка стрижка для хлопчика",
  },
  {
    id: "mens",
    title: "Чоловічий стиль",
    category: "cuts",
    image: "/images/portfolio/mens-haircut.jpg",
    alt: "Чоловіча стрижка з плавним переходом",
  },
  {
    id: "layers",
    title: "Світлі пасма",
    category: "color",
    image: "/images/portfolio/blonde-layers.jpg",
    alt: "Довге світле волосся з об'ємними шарами",
  },
];

const filters: { id: PortfolioCategory; label: string }[] = [
  { id: "all", label: "Усі образи" },
  { id: "color", label: "Фарбування" },
  { id: "cuts", label: "Стрижки" },
  { id: "hairstyles", label: "Зачіски" },
];

function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory>("all");
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(
    null,
  );

  const visibleItems =
    activeFilter === "all"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeFilter);

  useEffect(() => {
    if (!selectedImage) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  return (
    <section id="portfolio" className="section portfolio-section">
      <div className="container">
        <div className="portfolio-heading">
          <div>
            <p className="eyebrow">Світ Бестії</p>
            <h2>Краса у кожній деталі</h2>
          </div>

          <p className="portfolio-intro">
            Колір, форма та настрій. Знаходь натхнення для свого наступного
            образу.
          </p>
        </div>

        <div className="portfolio-filters" aria-label="Фільтр образів">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={activeFilter === filter.id ? "active" : ""}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {visibleItems.map((item) => (
            <button
              className="portfolio-item"
              key={item.id}
              type="button"
              onClick={() => setSelectedImage(item)}
              aria-label={`Переглянути фото: ${item.title}`}
            >
              <img src={item.image} alt={item.alt} loading="lazy" />

              <span className="portfolio-item-caption">
                <span>{item.title}</span>
                <span className="portfolio-item-arrow">↗</span>
              </span>
            </button>
          ))}
        </div>

        <p className="portfolio-note">
          Приклади образів для натхнення. Кожен стиль можна адаптувати саме для
          тебе.
        </p>

        <div className="portfolio-cta">
          <p>Час знайти свій образ?</p>
          <a href="#booking" className="button">
            Створімо його разом ↗
          </a>
        </div>
      </div>

      {selectedImage && (
        <div
          className="portfolio-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="portfolio-lightbox-close"
            aria-label="Закрити фото"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>

          <div
            className="portfolio-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={selectedImage.image} alt={selectedImage.alt} />
            <p>{selectedImage.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default PortfolioSection;
