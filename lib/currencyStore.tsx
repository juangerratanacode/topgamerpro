"use client";

// Selector de moneda de visualización, inspirado en el plugin YayCurrency
// del sitio original: los precios se guardan siempre en USD, pero el
// cliente puede ver el equivalente en Bolívares o Pesos colombianos según
// una tasa configurable desde el panel admin. Es solo visual — el cobro
// real sigue definiéndose por el método de pago elegido en el checkout.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Currency } from "./types";
import { getPaypalPrice } from "./pricing";

const STORAGE_KEY = "pitanga_currency_v1";

export const CURRENCY_META: Record<Currency, { label: string; symbol: string; flag: string }> = {
  USD: { label: "Dólar (USDT)", symbol: "$", flag: "🇺🇸" },
  VES: { label: "Bolívares", symbol: "Bs.", flag: "🇻🇪" },
  // No es un país — el ícono real de PayPal se dibuja aparte en
  // CurrencySwitcher.tsx; este emoji queda solo de respaldo.
  PAYPAL: { label: "PayPal", symbol: "$", flag: "🅿️" },
};

export const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  VES: 130, // Bs por USD — editable en /admin
  // PayPal no usa una tasa fija: el precio se calcula con la misma fórmula
  // de comisión (getPaypalPrice) que ya usa el checkout. Este valor no se
  // usa para convertir, solo existe para que el tipo quede completo.
  PAYPAL: 1,
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

// Moneda con la que abre la web por defecto (antes de que el visitante
// elija algo distinto) — la mayoría de los clientes son venezolanos, así
// que arranca en Bolívares en vez de Dólares.
const DEFAULT_DISPLAY: Currency = "VES";

function load(): { display: Currency; rates: Record<Currency, number> } {
  if (typeof window === "undefined") return { display: DEFAULT_DISPLAY, rates: DEFAULT_RATES };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { display: DEFAULT_DISPLAY, rates: DEFAULT_RATES };
    const parsed = JSON.parse(raw);
    // Si alguien tiene guardada la vieja moneda "COP" (ya retirada) de una
    // visita anterior, cae de vuelta al default en vez de romper el selector.
    const savedDisplay: Currency =
      parsed.display === "USD" || parsed.display === "VES" || parsed.display === "PAYPAL"
        ? parsed.display
        : DEFAULT_DISPLAY;
    return { display: savedDisplay, rates: { ...DEFAULT_RATES, ...parsed.rates } };
  } catch {
    return { display: DEFAULT_DISPLAY, rates: DEFAULT_RATES };
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [display, setDisplayState] = useState<Currency>(DEFAULT_DISPLAY);
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
    (usd: number) => (display === "PAYPAL" ? getPaypalPrice(usd) : usd * (rates[display] ?? 1)),
    [display, rates]
  );

  const format = useCallback(
    (usd: number) => {
      const converted = convert(usd);
      const { symbol } = CURRENCY_META[display];
      const decimals = display === "VES" ? 0 : 2;
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
