import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { supabase } from "../../lib/supabase";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, role } = useAuth();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Не вдалося вийти з облікового запису:", error);
    }
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container">
        <Link
          to="/"
          className="header-brand"
          aria-label="Бестія — на головну"
          onClick={closeMenu}
        >
          <span className="logo">
            Бестія<span>.</span>
          </span>
          <span className="header-tagline">HAIR STUDIO · ШАРГОРОД</span>
        </Link>

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
          <a href="/#services" onClick={closeMenu}>
            Послуги
          </a>

          <a href="/#portfolio" onClick={closeMenu}>
            Роботи
          </a>

          <a href="/#contacts" onClick={closeMenu}>
            Контакти
          </a>

          {user && (
            <>
              <Link to="/account" onClick={closeMenu}>
                Мій кабінет
              </Link>

              {role === "admin" && (
                <Link to="/admin" onClick={closeMenu}>
                  Адмін-панель
                </Link>
              )}

              <span className="header-account">{user.email}</span>

              <button
                type="button"
                className="header-logout"
                onClick={() => {
                  closeMenu();
                  void handleLogout();
                }}
              >
                Вийти
              </button>
            </>
          )}

          {!user && (
            <Link to="/login" onClick={closeMenu}>
              Увійти
            </Link>
          )}

          <a href="/#booking" className="header-cta" onClick={closeMenu}>
            Записатися ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
