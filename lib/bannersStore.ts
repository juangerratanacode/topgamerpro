"use client";

// Portadas del slider de inicio. Antes vivían en localStorage; ahora se
// leen/escriben en la tabla `banners` de Supabase a través de
// /api/admin/banners (que usa la service_role key del lado servidor).

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "./adminFetch";
import { supabase } from "./supabaseClient";

export interface Banner {
  id: string;
  imageUrl: string;
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
    subtitle: "Entrega en minutos con Pago Móvil o PayPal",
    ctaLabel: "Ver catálogo",
    ctaHref: "/#catalogo",
  },
];

// Lectura pública directa a Supabase (mismo camino rápido que usa el
// catálogo) — antes pasaba por /api/admin/banners, un salto de red extra
// que hacía que el slider apareciera después que los juegos.
async function fetchBanners(): Promise<Banner[]> {
  if (!supabase) return DEFAULT_BANNERS;
  try {
    const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return DEFAULT_BANNERS;
    return data.map((b: any) => ({
      id: b.id,
      imageUrl: b.image_url,
      title: b.title,
      subtitle: b.subtitle ?? "",
      ctaLabel: b.cta_label ?? "",
      ctaHref: b.cta_href ?? "",
    }));
  } catch {
    return DEFAULT_BANNERS;
  }
}

async function persistBanners(banners: Banner[]): Promise<string | null> {
  try {
    const res = await adminFetch("/api/admin/banners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banners }),
    });
    if (res.ok) return null;
    if (res.status === 413) return "Las imágenes son muy pesadas. Sube portadas más chicas o comprimidas.";
    const body = await res.json().catch(() => null);
    return body?.error ?? `Error ${res.status} al guardar.`;
  } catch (err) {
    return err instanceof Error ? err.message : "No se pudo conectar con el servidor.";
  }
}

function newId() {
  return `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners().then((b) => {
      setBanners(b);
      setHydrated(true);
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const errorMessage = await persistBanners(banners);
    setSaveError(errorMessage);
    setSaving(false);
    return !errorMessage;
  }, [banners]);

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

  return { banners, hydrated, saving, saveError, save, add, update, remove, moveUp, moveDown };
}

// Lectura simple para componentes que solo muestran (sin editar), ej. el
// slider del home.
export async function readBanners(): Promise<Banner[]> {
  return fetchBanners();
}
