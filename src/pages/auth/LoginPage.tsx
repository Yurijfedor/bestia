import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

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
    <main className="container">
      <h1>Вхід до облікового запису</h1>
      <p>Увійди, щоб переглядати свої записи до майстрині.</p>

      <form onSubmit={handleLogin}>
        <label>
          Електронна пошта
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Входимо..." : "Увійти"}
        </button>
      </form>

      <p>
        Ще не маєш облікового запису?{" "}
        <Link to="/register">Зареєструватися</Link>
      </p>
    </main>
  );
}
