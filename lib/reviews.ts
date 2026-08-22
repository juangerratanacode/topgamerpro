// Reseñas por producto. Antes acá vivía un bloque grande de reseñas
// copiadas del sitio original (pitcharge.com) como "contenido de prueba
// social" — no eran de clientes de TopGamerPro, así que se sacaron. Las
// reseñas reales que dejan los clientes desde la web se guardan aparte
// (ver lib/extraReviewsStore.ts) y se combinan con este objeto vacío en
// ProductReviews.tsx.

export interface ProductReview {
  author: string;
  // No se muestra públicamente — solo sirve para moderar (ver quién
  // escribió qué en /admin/comentarios) y frenar reseñas de spam.
  email?: string;
  content: string;
  rating: number;
  date: string;
}

export const reviewsBySlug: Record<string, ProductReview[]> = {};

export function getReviewsForSlug(slug: string): ProductReview[] {
  return reviewsBySlug[slug] ?? [];
}

export function getAverageRating(slug: string): { average: number; count: number } {
  const reviews = getReviewsForSlug(slug);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
