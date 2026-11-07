import SiteHeader from "../../components/layout/SiteHeader";

export default function AiStylePage() {
  return (
    <div className="app">
      <SiteHeader />

      <main className="ai-style-page">
        <section className="ai-style-hero">
          <div className="container">
            <p className="eyebrow">AI-ПІДБІР ЗАЧІСКИ</p>

            <h1>
              Знайди свій
              <br />
              новий образ
            </h1>

            <p className="ai-style-page__intro">
              Завантаж своє фото, розкажи про свої побажання — і ми допоможемо
              візуалізувати можливий новий стиль.
            </p>

            <div className="ai-style-page__notice">
              <span>✦</span>
              <p>
                На цьому етапі ми готуємо підбір стилю. Незабаром тут можна буде
                отримати персональні варіанти зачісок за допомогою AI.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
