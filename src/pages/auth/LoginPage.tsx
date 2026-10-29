import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import "../../css/auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося увійти. Перевір email і пароль.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Студія Бестія">
        <div className="auth-visual-content">
          <p className="eyebrow">Твій стиль. Твоя краса.</p>
          <h2>Краса починається з турботи про себе.</h2>
          <p>
            Знайди свій образ і плануй наступний візит до майстрині у зручний
            для тебе час.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-content">
          <Link to="/" className="auth-brand">
            Бестія<span>.</span>
          </Link>

          <p className="eyebrow">Раді бачити тебе знову</p>
          <h1>З поверненням!</h1>
          <p className="auth-description">
            Увійди до свого облікового запису, щоб переглядати записи та
            планувати наступний візит.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
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
                autoComplete="current-password"
                placeholder="Введи пароль"
                required
              />
            </label>

            {error && (
              <p className="auth-feedback" role="alert">
                {error}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Входимо..." : "Увійти до акаунту ↗"}
            </button>
          </form>

          <p className="auth-switch">
            Ще не маєш облікового запису?{" "}
            <Link to="/register">Зареєструватися</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
