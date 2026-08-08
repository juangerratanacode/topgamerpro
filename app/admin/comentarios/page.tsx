"use client";

import { useEffect, useState } from "react";
import { readAllExtraReviews, deleteExtraReview, type StoredReview } from "@/lib/extraReviewsStore";
import { reviewsBySlug } from "@/lib/reviews";
import StarRating from "@/components/StarRating";

const importedTotal = Object.values(reviewsBySlug).reduce((acc, arr) => acc + arr.length, 0);

export default function ComentariosPage() {
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReviews(readAllExtraReviews());
    setHydrated(true);
  }, []);

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    deleteExtraReview(id);
    setReviews(readAllExtraReviews());
  }

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">Comentarios</h1>
      <p className="text-sm text-brand-textMuted mb-6">
        {importedTotal} reseñas importadas de pitcharge.com se muestran de base en cada producto
        (no se pueden borrar aquí porque son contenido histórico). Las que escriben tus clientes
        nuevos en la web sí puedes moderarlas abajo.
      </p>

      {reviews.length === 0 && (
        <p className="text-sm text-brand-textMuted">
          Todavía no hay reseñas nuevas escritas desde la web.
        </p>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-brand-surface border border-brand-border rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <span className="font-semibold text-sm">{r.author}</span>
                <span className="text-xs text-brand-textMuted ml-2">
                  en <span className="text-brand-primary">{r.slug}</span> · {r.date}
                </span>
              </div>
              <StarRating rating={r.rating} />
            </div>
            <p className="text-sm text-brand-textMuted mb-2">{r.content}</p>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-xs font-semibold text-red-400 hover:text-red-300"
            >
              Eliminar reseña
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
