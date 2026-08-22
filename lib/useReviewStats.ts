"use client";

// Un solo lugar para calcular promedio/cantidad de reseñas de un producto,
// combinando SIEMPRE las mismas dos fuentes (base + las que escriben los
// clientes desde la web). Antes el badge de arriba en la página de
// producto (ProductDetailClient) solo miraba la fuente base y la sección
// de abajo (ProductReviews) combinaba las dos — con la base vacía, el
// badge decía "Sé el primero en opinar" aunque ya hubiera reseñas reales.

import { useEffect, useState } from "react";
import { getReviewsForSlug, type ProductReview } from "./reviews";
import { readExtraReviews } from "./extraReviewsStore";

export function useReviewStats(slug: string): { average: number; count: number; all: ProductReview[] } {
  const [extra, setExtra] = useState<ProductReview[]>([]);

  useEffect(() => {
    setExtra(readExtraReviews(slug));
  }, [slug]);

  const all = [...extra, ...getReviewsForSlug(slug)];
  const count = all.length;
  const average = count > 0 ? Math.round((all.reduce((acc, r) => acc + r.rating, 0) / count) * 10) / 10 : 0;

  return { average, count, all };
}
