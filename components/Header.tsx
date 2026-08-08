"use client";

import { useState } from "react";
import Link from "next/link";
import ProgressBar from "./ProgressBar";
import CartBadge from "./CartBadge";
import Logo from "./Logo";
import LoginModal from "./LoginModal";
import CurrencySwitcher from "./CurrencySwitcher";
import SearchBar from "./SearchBar";

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="bg-brand-surface/95 backdrop-blur border-b border-brand-border sticky top-0 z-40">
      {/* Fila móvil: moneda a la izquierda, logo centrado y grande, carrito a la
          derecha — igual a como se ve en la mayoría de tiendas en el celular. */}
      <div className="sm:hidden grid grid-cols-3 items-center px-4 py-1">
        <div className="justify-self-start">
          <CurrencySwitcher />
        </div>
        <Link href="/" className="justify-self-center">
          <Logo size="md" />
        </Link>
        <div className="justify-self-end">
          <CartBadge />
        </div>
      </div>
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
          <Link
            href="/admin"
            title="Panel de administración"
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-brand-textMuted hover:text-brand-primary hover:bg-brand-surfaceLight transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
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
          <CartBadge />
        </div>
      </div>
      <ProgressBar />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
