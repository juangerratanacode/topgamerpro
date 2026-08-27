"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import type { ProductReview } from "@/lib/useReviewStats";
import StarRating from "@/components/StarRating";

export default function ComentariosPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [hydrated, setHydrated] = useState(false);

  async function refresh() {
    const res = await adminFetch("/api/reviews", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
    setHydrated(true);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    await adminFetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    refresh();
  }

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">Comentarios</h1>
      <p className="text-sm text-brand-textMuted mb-6">
        Reseñas que escriben tus clientes desde la web — podés moderarlas (borrarlas) abajo.
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
                {r.email && <span className="text-xs text-brand-textMuted ml-2">({r.email})</span>}
                <span className="text-xs text-brand-textMuted ml-2">
                  en <span className="text-brand-primary">{r.productSlug}</span> · {r.date}
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
