import { useState } from "react";
import SiteHeader from "../../components/layout/SiteHeader";

type HairLength = "short" | "medium" | "long" | "";
type StylePreference = "classic" | "modern" | "bold" | "";

export default function AiStylePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [hairLength, setHairLength] = useState<HairLength>("");
  const [stylePreference, setStylePreference] = useState<StylePreference>("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type)) {
      setMessage("Будь ласка, завантажте фото у форматі JPG, PNG або WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setMessage("Розмір фото не повинен перевищувати 10 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setMessage("");
  }

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);
    setMessage("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedImage) {
      setMessage("Будь ласка, завантажте своє фото.");
      return;
    }

    if (!hairLength || !stylePreference) {
      setMessage("Оберіть бажану довжину волосся та стиль.");
      return;
    }

    setMessage(
      "Дякуємо! Ваші побажання збережено. AI-підбір буде підключено на наступному етапі.",
    );
  }

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

            <form className="ai-style-form" onSubmit={handleSubmit} noValidate>
              <div className="ai-style-form__section">
                <span className="ai-style-form__number">01</span>

                <div>
                  <h2>Завантажте фото</h2>
                  <p>
                    Для найкращого результату оберіть чітке фото, де добре видно
                    обличчя та волосся.
                  </p>

                  {!imagePreview ? (
                    <label className="ai-style-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <span className="ai-style-upload__icon">＋</span>
                      <span>Обрати фото</span>
                      <small>JPG, PNG або WEBP</small>
                    </label>
                  ) : (
                    <div className="ai-style-preview">
                      <img
                        src={imagePreview}
                        alt="Попередній перегляд завантаженого фото"
                      />

                      <div className="ai-style-preview__actions">
                        <label className="ai-style-button ai-style-button--secondary">
                          Замінити фото
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>

                        <button
                          type="button"
                          className="ai-style-button ai-style-button--text"
                          onClick={removeImage}
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="ai-style-form__section">
                <span className="ai-style-form__number">02</span>

                <div>
                  <h2>Розкажіть про свій бажаний образ</h2>

                  <fieldset className="ai-style-fieldset">
                    <legend>Яка довжина волосся вам цікава?</legend>

                    <div className="ai-style-options">
                      <label>
                        <input
                          type="radio"
                          name="hairLength"
                          value="short"
                          checked={hairLength === "short"}
                          onChange={() => setHairLength("short")}
                        />
                        <span>Коротке</span>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="hairLength"
                          value="medium"
                          checked={hairLength === "medium"}
                          onChange={() => setHairLength("medium")}
                        />
                        <span>Середнє</span>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="hairLength"
                          value="long"
                          checked={hairLength === "long"}
                          onChange={() => setHairLength("long")}
                        />
                        <span>Довге</span>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="ai-style-fieldset">
                    <legend>Який стиль вам ближчий?</legend>

                    <div className="ai-style-options">
                      <label>
                        <input
                          type="radio"
                          name="stylePreference"
                          value="classic"
                          checked={stylePreference === "classic"}
                          onChange={() => setStylePreference("classic")}
                        />
                        <span>Класичний</span>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="stylePreference"
                          value="modern"
                          checked={stylePreference === "modern"}
                          onChange={() => setStylePreference("modern")}
                        />
                        <span>Сучасний</span>
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="stylePreference"
                          value="bold"
                          checked={stylePreference === "bold"}
                          onChange={() => setStylePreference("bold")}
                        />
                        <span>Сміливий</span>
                      </label>
                    </div>
                  </fieldset>

                  <label className="ai-style-notes">
                    <span>Додаткові побажання</span>

                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Наприклад: хочу змінити образ, але не надто кардинально..."
                      rows={4}
                    />
                  </label>
                </div>
              </div>

              <div className="ai-style-form__footer">
                <button
                  type="submit"
                  className="ai-style-button ai-style-button--primary"
                >
                  Підібрати мій стиль ✦
                </button>

                <p>
                  На наступному етапі ваші дані будуть передаватися до AI для
                  створення персональних варіантів зачіски.
                </p>
              </div>

              {message && (
                <p className="ai-style-message" role="status">
                  {message}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
