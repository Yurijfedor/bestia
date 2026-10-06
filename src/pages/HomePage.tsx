function HomePage() {
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

            <div className="services-grid">
              <article className="service-card">
                <span>01</span>
                <h3>Стрижки</h3>
                <p>Жіночі, чоловічі та дитячі стрижки.</p>
              </article>

              <article className="service-card">
                <span>02</span>
                <h3>Фарбування</h3>
                <p>Однотонне фарбування, тонування та складні техніки.</p>
              </article>

              <article className="service-card">
                <span>03</span>
                <h3>Укладки</h3>
                <p>Щоденні та святкові укладки для особливих моментів.</p>
              </article>

              <article className="service-card">
                <span>04</span>
                <h3>Зачіски</h3>
                <p>Вечірні, святкові та особливі зачіски.</p>
              </article>
            </div>
          </div>
        </section>

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
          <div className="container booking-intro">
            <p className="eyebrow">Онлайн-запис</p>

            <h2>Обери зручний час для себе</h2>

            <p>
              У найближчих етапах тут з&apos;явиться інтерактивний календар із
              доступними датами та часом.
            </p>

            <button className="button" type="button">
              Скоро буде доступно
            </button>
          </div>
        </section>

        <section id="contacts" className="section section-dark">
          <div className="container">
            <p className="eyebrow">Контакти</p>

            <h2>Буду рада зустрічі</h2>

            <div className="contact-info">
              <p>📍 Шаргород, вул. Героїв Майдану, 250</p>
              <p>💬 Telegram: +380 98 273 35 27</p>
              <p>💬 Viber: +380 98 273 35 27</p>
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
