"use client";

// Reseñas escritas por clientes desde la web (distintas de las importadas
// del sitio original en lib/reviews.ts). Viven en localStorage y se pueden
// moderar (eliminar) desde /admin/comentarios.

import type { ProductReview } from "./reviews";

const STORAGE_KEY = "pitanga_extra_reviews_v1";

export interface StoredReview extends ProductReview {
  id: string;
  slug: string;
}

type ReviewsBySlug = Record<string, ProductReview[]>;

function readRaw(): ReviewsBySlug {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewsBySlug) : {};
  } catch {
    return {};
  }
}

function writeRaw(all: ReviewsBySlug) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function readExtraReviews(slug: string): ProductReview[] {
  return readRaw()[slug] ?? [];
}

export function saveExtraReview(slug: string, review: ProductReview) {
  const all = readRaw();
  all[slug] = [review, ...(all[slug] ?? [])];
  writeRaw(all);
}

export function readAllExtraReviews(): StoredReview[] {
  const all = readRaw();
  const out: StoredReview[] = [];
  for (const slug of Object.keys(all)) {
    all[slug].forEach((r, i) => {
      out.push({ ...r, slug, id: `${slug}__${i}__${r.date}` });
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function deleteExtraReview(id: string) {
  const all = readRaw();
  const [slug] = id.split("__");
  const list = all[slug] ?? [];
  const idx = list.findIndex((r, i) => `${slug}__${i}__${r.date}` === id);
  if (idx !== -1) {
    list.splice(idx, 1);
    all[slug] = list;
    writeRaw(all);
  }
}
