"use client";

import { useState } from "react";
import { useCurrency, CURRENCY_META } from "@/lib/currencyStore";
import type { Currency } from "@/lib/types";
import clsx from "clsx";

export default function CurrencySwitcher() {
  const { display, setDisplay } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold text-brand-textMuted hover:text-white transition-colors"
      >
        <span>{CURRENCY_META[display].flag}</span>
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
                <span>{CURRENCY_META[c].flag}</span>
                <span>{CURRENCY_META[c].label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
