"use client";

// Reseñas reales, guardadas en Supabase (ver app/api/reviews/route.ts) —
// antes esto leía de localStorage, así que una reseña que un cliente
// escribía en su propio navegador nunca la veía nadie más, ni siquiera el
// admin. Un solo lugar (este hook) calcula promedio/cantidad para el
// badge de arriba en la página de producto, la card del catálogo y la
// sección de reseñas de abajo — así los tres siempre muestran lo mismo.
//
// Todas las páginas piden el mismo listado completo (no hay demasiadas
// reseñas todavía como para justificar un endpoint por slug), así que se
// cachea en memoria del lado del cliente para no disparar un pedido de
// red por cada tarjeta del catálogo.

import { useEffect, useState } from "react";

export interface ProductReview {
  id: string;
  productSlug: string;
  author: string;
  email?: string;
  content: string;
  rating: number;
  date: string;
}

let cachedPromise: Promise<ProductReview[]> | null = null;

function fetchAllReviews(): Promise<ProductReview[]> {
  if (!cachedPromise) {
    cachedPromise = fetch("/api/reviews", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => (Array.isArray(data.reviews) ? data.reviews : []))
      .catch(() => []);
  }
  return cachedPromise;
}

// Se llama después de escribir una reseña nueva, para que el próximo
// componente que la pida (o el mismo, al recargar sus datos) traiga la
// lista actualizada en vez de la respuesta vieja cacheada.
export function invalidateReviewsCache() {
  cachedPromise = null;
}

export function useReviewStats(slug: string): { average: number; count: number; all: ProductReview[] } {
  const [all, setAll] = useState<ProductReview[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchAllReviews().then((rows) => {
      if (!cancelled) setAll(rows.filter((r) => r.productSlug === slug));
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const count = all.length;
  const average = count > 0 ? Math.round((all.reduce((acc, r) => acc + r.rating, 0) / count) * 10) / 10 : 0;

  return { average, count, all };
}
