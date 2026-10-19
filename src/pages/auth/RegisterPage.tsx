import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

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
    <main className="container">
      <h1>Створення облікового запису</h1>
      <p>Зареєструйся, щоб керувати своїми записами до майстрині.</p>

      <form onSubmit={handleRegister}>
        <label>
          Ім’я та прізвище
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            maxLength={100}
            required
          />
        </label>

        <label>
          Номер телефону
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            maxLength={30}
          />
        </label>

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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Реєструємо..." : "Зареєструватися"}
        </button>
      </form>

      <p>
        Уже маєш обліковий запис? <Link to="/login">Увійти</Link>
      </p>
    </main>
  );
}
