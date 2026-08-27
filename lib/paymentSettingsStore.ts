"use client";

// Datos de las cuentas de cobro (Pago Móvil, PayPal).
// Antes vivían en localStorage; ahora se leen/escriben en la tabla
// `payment_settings` de Supabase vía /api/admin/payment-settings.

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "./adminFetch";

export interface PaymentSettings {
  pagoMovil: { banco: string; telefono: string; cedula: string; enabled: boolean };
  paypal: { correo: string; paypalMeUser: string; enabled: boolean };
  binance: { correoOId: string; nombre: string; enabled: boolean };
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  pagoMovil: { banco: "Banesco (0134)", telefono: "0412-3542332", cedula: "V-27894619", enabled: true },
  paypal: { correo: "pagos@novatop.com", paypalMeUser: "novatoprecargas", enabled: true },
  binance: { correoOId: "", nombre: "", enabled: true },
};

async function fetchSettings(): Promise<PaymentSettings> {
  try {
    const res = await fetch("/api/admin/payment-settings", { cache: "no-store" });
    if (!res.ok) return DEFAULT_PAYMENT_SETTINGS;
    const data = await res.json();
    return data.settings ?? DEFAULT_PAYMENT_SETTINGS;
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

async function persistSettings(settings: PaymentSettings): Promise<boolean> {
  try {
    const res = await adminFetch("/api/admin/payment-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    fetchSettings().then((s) => {
      setSettings(s);
      setHydrated(true);
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const ok = await persistSettings(settings);
    setSaveError(!ok);
    setSaving(false);
    return ok;
  }, [settings]);

  const update = useCallback(<K extends keyof PaymentSettings>(key: K, patch: Partial<PaymentSettings[K]>) => {
    setSettings((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  return { settings, hydrated, saving, saveError, save, update };
}

export async function readPaymentSettings(): Promise<PaymentSettings> {
  return fetchSettings();
}
