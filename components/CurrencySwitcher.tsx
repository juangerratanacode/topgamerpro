"use client";

import { useState } from "react";
import { useCurrency, CURRENCY_META } from "@/lib/currencyStore";
import type { Currency } from "@/lib/types";
import clsx from "clsx";

// Ícono real de PayPal (no es un país, así que no tiene bandera) — se
// dibuja en vez del emoji de respaldo definido en CURRENCY_META.
function PaypalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8.4 20.7l.6-3.8h-3l2.5-15.9h6.8c3 0 5.1 1.8 4.7 4.6-.5 3.4-3 5.2-6.2 5.2H11l-1 6.4-1.6 3.5zm4.1-9.5h1.4c1.6 0 2.7-.9 3-2.6.2-1.5-.7-2.3-2.2-2.3h-1.4l-.8 4.9z" />
    </svg>
  );
}

function CurrencyIcon({ c, className }: { c: Currency; className?: string }) {
  if (c === "PAYPAL") return <PaypalIcon className={className ?? "w-4 h-4 text-[#0070BA]"} />;
  // El dólar acá es específicamente "Dólar (USDT)" — en Venezuela eso casi
  // siempre significa Binance, así que el ícono de marca comunica mejor
  // que la bandera genérica de EE.UU.
  if (c === "USD") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/binance-icon.png" alt="" className={className ?? "w-4 h-4"} />
    );
  }
  return <span>{CURRENCY_META[c].flag}</span>;
}

export default function CurrencySwitcher() {
  const { display, setDisplay } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
      >
        <CurrencyIcon c={display} />
        <span className="hidden sm:inline">{display}</span>
        <svg className={clsx("w-3 h-3 transition-transform", open && "rotate-180")} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-xl z-50">
            {(Object.keys(CURRENCY_META) as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setDisplay(c);
                  setOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-brand-surfaceLight transition-colors",
                  display === c && "text-brand-primary font-semibold"
                )}
              >
                <CurrencyIcon c={c} />
                <span>{CURRENCY_META[c].label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
