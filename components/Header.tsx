"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import CartBadge from "./CartBadge";
import Logo from "./Logo";
import LoginModal from "./LoginModal";
import CurrencySwitcher from "./CurrencySwitcher";
import SearchBar from "./SearchBar";
import { useAuth } from "@/lib/authStore";

const MOBILE_NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/soporte", label: "Soporte" },
];

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0];

  return (
    // will-change-transform: sticky + backdrop-blur es una combinación
    // clásica de jank en scroll — sin esto, el navegador tiene que volver a
    // muestrear el blur del contenido que pasa por detrás en cada frame.
    // Esto lo promueve a su propia capa de composición desde el principio
    // en vez de decidirlo tarde, mid-scroll.
    <header className="bg-brand-surface/95 backdrop-blur border-b border-brand-border sticky top-0 z-40 will-change-transform">
      {/* Fila móvil: hamburguesa a la izquierda, logo centrado, carrito a la
          derecha — igual a como se ve en la mayoría de tiendas en el celular. */}
      <div className="sm:hidden grid grid-cols-3 items-center px-4 py-1">
        <div className="justify-self-start">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Abrir menú"
            className="w-8 h-8 flex items-center justify-center text-brand-textMuted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <Link href="/" className="justify-self-center">
          <Logo size="md" />
        </Link>
        <div className="justify-self-end flex items-center gap-3">
          <CurrencySwitcher />
          <CartBadge />
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="sm:hidden overflow-hidden border-t border-brand-border"
          >
            <div className="flex flex-col px-4 py-2">
              {MOBILE_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/mi-cuenta"
                    onClick={() => setMenuOpen(false)}
                    className="py-2.5 text-left text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
                  >
                    Mi cuenta{firstName ? ` (${firstName})` : ""}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="py-2.5 text-left text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setLoginOpen(true);
                  }}
                  className="py-2.5 text-left text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="sm:hidden px-4 pb-2">
        <SearchBar />
      </div>

      {/* Fila desktop */}
      <div className="hidden sm:flex max-w-7xl mx-auto px-6 py-3 items-center gap-6">
        <Link href="/" className="shrink-0">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-brand-textMuted">
          <Link href="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <Link href="/#catalogo" className="hover:text-white transition-colors">
            Catálogo
          </Link>
          <Link href="/soporte" className="hover:text-white transition-colors">
            Soporte
          </Link>
        </nav>

        <div className="flex-1">
          <SearchBar className="max-w-md ml-auto" />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <CurrencySwitcher />
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/mi-cuenta"
                className="flex items-center gap-2 text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {firstName ? `Hola, ${firstName}` : "Mi cuenta"}
              </Link>
              <button
                onClick={signOut}
                className="text-xs text-brand-textMuted hover:text-white underline transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Iniciar sesión
            </button>
          )}
          <CartBadge />
        </div>
      </div>
      <ProgressBar />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
