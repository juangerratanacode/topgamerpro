"use client";

// Portadas del slider de inicio (como el carrusel "Robux al mejor precio" de
// referencia). Mismo patrón que paymentSettingsStore: viven en localStorage
// mientras no conectemos Supabase, editables desde /admin/banners.

import { useCallback, useEffect, useState } from "react";
import { safeLocalStorageSet } from "./image";

export interface Banner {
  id: string;
  imageUrl: string; // dataURL subida desde el admin
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "banner-default-1",
    imageUrl: "/hero/hero-visual.png",
    title: "Recarga tu juego favorito",
    subtitle: "Entrega en minutos con Pago Móvil, Binance, PayPal o Bancolombia",
    ctaLabel: "Ver catálogo",
    ctaHref: "/#catalogo",
  },
];

const STORAGE_KEY = "pitanga_banners_v1";

function load(): Banner[] {
  if (typeof window === "undefined") return DEFAULT_BANNERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BANNERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_BANNERS;
    return parsed;
  } catch {
    return DEFAULT_BANNERS;
  }
}

function save(banners: Banner[]): boolean {
  return safeLocalStorageSet(STORAGE_KEY, JSON.stringify(banners));
}

function newId() {
  return `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setBanners(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) setSaveError(!save(banners));
  }, [banners, hydrated]);

  const add = useCallback((banner: Omit<Banner, "id">) => {
    setBanners((prev) => [...prev, { ...banner, id: newId() }]);
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<Banner, "id">>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const remove = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const moveUp = useCallback((id: string) => {
    setBanners((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setBanners((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i === -1 || i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i + 1], next[i]] = [next[i], next[i + 1]];
      return next;
    });
  }, []);

  return { banners, hydrated, saveError, add, update, remove, moveUp, moveDown };
}

// Lectura simple para componentes que solo muestran (sin editar).
export function readBanners(): Banner[] {
  return load();
}
