import { useState } from "react";
import SiteHeader from "../../components/layout/SiteHeader";

type HairLength = "short" | "medium" | "long" | "";
type StylePreference = "classic" | "modern" | "bold" | "";
type HairstyleRecommendation = {
  name: string;
  description: string;
  whyItFits: string;
  styling: string;
};

type PhotoAnalysis = {
  currentHair: string;
  observations: string[];
};

type AiHairstyleResponse = {
  photoAnalysis: PhotoAnalysis;
  recommendations: HairstyleRecommendation[];
  finalRecommendation: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Не вдалося прочитати файл зображення."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Не вдалося прочитати файл зображення."));
    };

    reader.readAsDataURL(file);
  });
}

export default function AiStylePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [hairLength, setHairLength] = useState<HairLength>("");
  const [stylePreference, setStylePreference] = useState<StylePreference>("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recommendations, setRecommendations] = useState<
    HairstyleRecommendation[]
  >([]);

  const [selectedRecommendation, setSelectedRecommendation] =
    useState<HairstyleRecommendation | null>(null);

  const [finalRecommendation, setFinalRecommendation] = useState("");
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(
    null,
  );

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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

  async function handleGeneratePreview(
    recommendation: HairstyleRecommendation,
  ) {
    if (!selectedImage) {
      setMessage("Будь ласка, спочатку завантажте своє фото.");
      return;
    }

    setSelectedRecommendation(recommendation);
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setMessage("");

    try {
      const imageDataUrl = await fileToDataUrl(selectedImage);

      const response = await fetch("/api/generate-hairstyle-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageDataUrl,
          hairstyle: recommendation,
        }),
      });

      const data = (await response.json()) as {
        image?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Не вдалося згенерувати новий образ.");
      }

      if (!data.image) {
        throw new Error("AI не повернув згенероване зображення.");
      }

      setGeneratedImage(data.image);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Сталася помилка під час генерації зображення.",
      );
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedImage) {
      setMessage("Будь ласка, завантажте своє фото.");
      return;
    }

    if (!hairLength || !stylePreference) {
      setMessage("Оберіть бажану довжину волосся та стиль.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const imageDataUrl = await fileToDataUrl(selectedImage);
      const response = await fetch("/api/generate-hairstyle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hairLength,
          stylePreference,
          notes,
          imageDataUrl,
        }),
      });

      const data = (await response.json()) as AiHairstyleResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Не вдалося виконати AI-підбір.");
      }

      setRecommendations(data.recommendations ?? []);
      setFinalRecommendation(data.finalRecommendation ?? "");
      setPhotoAnalysis(data.photoAnalysis ?? null);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Сталася помилка під час надсилання запиту.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Обробляємо..." : "Підібрати мій стиль ✦"}
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
            {isSubmitting && (
              <div className="ai-style-loader">
                <div className="ai-style-spinner" />
                <p>BESTIA AI аналізує ваше фото та підбирає зачіску...</p>
              </div>
            )}
            {photoAnalysis && (
              <section className="ai-style-photo-analysis">
                <p className="ai-style-results__eyebrow">ЩО МИ ВРАХУВАЛИ</p>

                <h2>Ваше волосся на фото</h2>

                <p className="ai-style-photo-analysis__summary">
                  {photoAnalysis.currentHair}
                </p>

                {photoAnalysis.observations.length > 0 && (
                  <ul className="ai-style-photo-analysis__list">
                    {photoAnalysis.observations.map((observation) => (
                      <li key={observation}>{observation}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}
            {recommendations.length > 0 && (
              <section className="ai-style__results">
                <div className="ai-style__results-header">
                  <span className="ai-style__section-number">03</span>

                  <div>
                    <p className="ai-style__eyebrow">AI-ПІДБІР</p>
                    <h2>Ваші персональні рекомендації</h2>
                  </div>
                </div>

                <div className="ai-style__recommendations">
                  {recommendations.map((recommendation, index) => (
                    <article
                      className="ai-style__recommendation-card"
                      key={`${recommendation.name}-${index}`}
                    >
                      <span className="ai-style__recommendation-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="ai-style__recommendation-content">
                        <h3>{recommendation.name}</h3>

                        <div className="ai-style__recommendation-details">
                          <p>
                            <strong>Опис</strong>
                            {recommendation.description}
                          </p>

                          <p>
                            <strong>Чому вам підійде</strong>
                            {recommendation.whyItFits}
                          </p>

                          <p>
                            <strong>Укладання</strong>
                            {recommendation.styling}
                          </p>
                        </div>
                        <div className="ai-style__recommendation-actions">
                          <button
                            type="button"
                            className="ai-style-button ai-style-button--primary"
                          >
                            Записатися з цим варіантом
                          </button>

                          <button
                            type="button"
                            className="ai-style-button ai-style-button--secondary"
                            onClick={() =>
                              handleGeneratePreview(recommendation)
                            }
                            disabled={isGeneratingImage}
                          >
                            {isGeneratingImage &&
                            selectedRecommendation?.name === recommendation.name
                              ? "Створюємо ваш новий образ..."
                              : "Побачити себе з цією зачіскою ✦"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {finalRecommendation && (
                  <div className="ai-style__final-recommendation">
                    <span className="ai-style__final-label">
                      РЕКОМЕНДАЦІЯ ВІД BESTIA AI
                    </span>

                    <p>{finalRecommendation}</p>
                  </div>
                )}
              </section>
            )}
            {isGeneratingImage && (
              <div className="ai-style-loader">
                <div className="ai-style-spinner" />
                <p>Створюємо ваш новий образ...</p>
              </div>
            )}
            {generatedImage && selectedRecommendation && (
              <section className="ai-style-generated">
                <p className="ai-style-results__eyebrow">ВАШ НОВИЙ ОБРАЗ</p>

                <h2>Ви з зачіскою «{selectedRecommendation.name}»</h2>

                <img
                  src={generatedImage}
                  alt={`Візуалізація зачіски ${selectedRecommendation.name}`}
                />
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
