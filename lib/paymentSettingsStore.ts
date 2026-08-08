"use client";

// Datos de las cuentas de cobro (Pago Móvil, Binance, Bancolombia, PayPal),
// editables desde /admin/pagos. Viven en localStorage mientras no
// conectemos Supabase, con los mismos valores por defecto que antes vivían
// hardcodeados (o por variable de entorno) en constants.ts.

import { useCallback, useEffect, useState } from "react";

export interface PaymentSettings {
  pagoMovil: { banco: string; telefono: string; cedula: string };
  binance: { cuenta: string };
  bancolombia: { cuenta: string };
  paypal: {
    correo: string; // se muestra al cliente como referencia
    paypalMeUser: string; // usuario de paypal.me, para el botón de pago directo (sin "paypal.me/")
  };
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  pagoMovil: {
    banco: "Banesco (0134)",
    telefono: "0412-3542332",
    cedula: "V-27894619",
  },
  binance: {
    cuenta: "correo@binance.com",
  },
  bancolombia: {
    cuenta: "Ahorros 240-000004-26",
  },
  paypal: {
    correo: "pagos@novatop.com",
    paypalMeUser: "novatoprecargas",
  },
};

const STORAGE_KEY = "pitanga_payment_settings_v1";

function load(): PaymentSettings {
  if (typeof window === "undefined") return DEFAULT_PAYMENT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PAYMENT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      pagoMovil: { ...DEFAULT_PAYMENT_SETTINGS.pagoMovil, ...parsed.pagoMovil },
      binance: { ...DEFAULT_PAYMENT_SETTINGS.binance, ...parsed.binance },
      bancolombia: { ...DEFAULT_PAYMENT_SETTINGS.bancolombia, ...parsed.bancolombia },
      paypal: { ...DEFAULT_PAYMENT_SETTINGS.paypal, ...parsed.paypal },
    };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

function save(settings: PaymentSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(settings);
  }, [settings, hydrated]);

  const update = useCallback(<K extends keyof PaymentSettings>(key: K, patch: Partial<PaymentSettings[K]>) => {
    setSettings((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  return { settings, hydrated, update };
}

// Para componentes que solo necesitan leer (no editar), sin re-render extra.
export function readPaymentSettings(): PaymentSettings {
  return load();
}
