"use client";

// Selector de moneda de visualización, inspirado en el plugin YayCurrency
// del sitio original: los precios se guardan siempre en USD, pero el
// cliente puede ver el equivalente en Bolívares o Pesos colombianos según
// una tasa configurable desde el panel admin. Es solo visual — el cobro
// real sigue definiéndose por el método de pago elegido en el checkout.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Currency } from "./types";

const STORAGE_KEY = "pitanga_currency_v1";

export const CURRENCY_META: Record<Currency, { label: string; symbol: string; flag: string }> = {
  USD: { label: "Dólar (USDT)", symbol: "$", flag: "🇺🇸" },
  VES: { label: "Bolívares", symbol: "Bs.", flag: "🇻🇪" },
  COP: { label: "Pesos colombianos", symbol: "$", flag: "🇨🇴" },
};

export const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  VES: 130, // Bs por USD — editable en /admin
  COP: 4100, // COP por USD — editable en /admin
};

interface CurrencyState {
  display: Currency;
  setDisplay: (c: Currency) => void;
  rates: Record<Currency, number>;
  setRate: (c: Currency, rate: number) => void;
  convert: (usd: number) => number;
  format: (usd: number) => string;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

function load(): { display: Currency; rates: Record<Currency, number> } {
  if (typeof window === "undefined") return { display: "USD", rates: DEFAULT_RATES };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { display: "USD", rates: DEFAULT_RATES };
    const parsed = JSON.parse(raw);
    return { display: parsed.display ?? "USD", rates: { ...DEFAULT_RATES, ...parsed.rates } };
  } catch {
    return { display: "USD", rates: DEFAULT_RATES };
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [display, setDisplayState] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = load();
    setDisplayState(loaded.display);
    setRates(loaded.rates);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ display, rates }));
    }
  }, [display, rates, hydrated]);

  const setDisplay = useCallback((c: Currency) => setDisplayState(c), []);
  const setRate = useCallback((c: Currency, rate: number) => {
    setRates((prev) => ({ ...prev, [c]: rate }));
  }, []);

  const convert = useCallback(
    (usd: number) => usd * (rates[display] ?? 1),
    [display, rates]
  );

  const format = useCallback(
    (usd: number) => {
      const converted = convert(usd);
      const { symbol } = CURRENCY_META[display];
      const decimals = display === "USD" ? 2 : 0;
      return `${symbol}${converted.toLocaleString("es-VE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    },
    [convert, display]
  );

  return (
    <CurrencyContext.Provider value={{ display, setDisplay, rates, setRate, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency debe usarse dentro de CurrencyProvider");
  return ctx;
}
