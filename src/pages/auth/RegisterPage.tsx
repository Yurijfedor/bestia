import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import "../../css/auth.css";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const normalizedName = fullName.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedName) {
      setError("Введи ім’я та прізвище.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: normalizedName,
            phone: normalizedPhone,
          },
        },
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Якщо реєстрація пройшла успішно, перевір свою електронну пошту для підтвердження адреси.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося зареєструватися. Спробуй ще раз.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Студія Бестія">
        <div className="auth-visual-content">
          <p className="eyebrow">Твій новий образ</p>
          <h2>Маленький крок до великої любові до себе.</h2>
          <p>
            Створи акаунт, щоб зручно керувати записами та повертатися до
            улюблених послуг.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-content">
          <Link to="/" className="auth-brand">
            Бестія<span>.</span>
          </Link>

          <p className="eyebrow">Приєднуйся до нас</p>
          <h1>Створи свій акаунт</h1>
          <p className="auth-description">
            Заповни дані нижче, щоб записуватися до майстрині та керувати своїми
            візитами.
          </p>

          <form className="auth-form" onSubmit={handleRegister}>
            <label className="auth-field">
              Ім’я та прізвище
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                maxLength={100}
                placeholder="Як до тебе звертатися"
                required
              />
            </label>

            <label className="auth-field">
              Номер телефону
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                maxLength={30}
                placeholder="+380 ..."
              />
            </label>

            <label className="auth-field">
              Електронна пошта
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="auth-field">
              Пароль
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                placeholder="Щонайменше 6 символів"
                required
              />
            </label>

            {error && (
              <p className="auth-feedback" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-feedback auth-feedback-success" role="status">
                {message}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Реєструємо..." : "Створити акаунт ↗"}
            </button>
          </form>

          <p className="auth-switch">
            Уже маєш обліковий запис? <Link to="/login">Увійти</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
