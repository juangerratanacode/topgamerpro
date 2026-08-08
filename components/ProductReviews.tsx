"use client";

import { useEffect, useState } from "react";
import { getReviewsForSlug, getAverageRating, type ProductReview } from "@/lib/reviews";
import { readExtraReviews, saveExtraReview } from "@/lib/extraReviewsStore";
import StarRating from "./StarRating";
import clsx from "clsx";

export default function ProductReviews({ slug, productName }: { slug: string; productName: string }) {
  const baseReviews = getReviewsForSlug(slug);
  const [extra, setExtra] = useState<ProductReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setExtra(readExtraReviews(slug));
  }, [slug]);

  const all = [...extra, ...baseReviews];
  const totalCount = all.length;
  const avg =
    totalCount > 0
      ? Math.round((all.reduce((acc, r) => acc + r.rating, 0) / totalCount) * 10) / 10
      : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    const review: ProductReview = {
      author: author.trim(),
      content: content.trim(),
      rating,
      date: new Date().toISOString().slice(0, 10),
    };
    saveExtraReview(slug, review);
    setExtra((prev) => [review, ...prev]);
    setAuthor("");
    setContent("");
    setRating(5);
    setShowForm(false);
  }

  return (
    <section id="resenas" className="mt-14 border-t border-brand-border pt-10 scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Opiniones sobre {productName}</h2>
          {totalCount > 0 ? (
            <div className="flex items-center gap-2 text-sm text-brand-textMuted">
              <StarRating rating={avg} size="md" />
              <span className="font-semibold text-white">{avg}</span>
              <span>· {totalCount} reseñas</span>
            </div>
          ) : (
            <p className="text-sm text-brand-textMuted">Sé el primero en dejar una opinión.</p>
          )}
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="border border-brand-border hover:border-brand-primary text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          {showForm ? "Cancelar" : "Escribir una reseña"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-8 space-y-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-brand-textMuted">Tu calificación</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  className="p-0.5"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className={clsx("w-6 h-6", n <= rating ? "fill-brand-gold" : "fill-brand-border")}
                  >
                    <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
          />
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cuéntanos cómo fue tu recarga..."
            rows={3}
            className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary resize-none"
          />
          <button
            type="submit"
            className="bg-brand-primary hover:bg-brand-primaryDark text-brand-bg font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Publicar reseña
          </button>
        </form>
      )}

      {totalCount > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {all.slice(0, visibleCount).map((r, i) => (
            <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{r.author}</span>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-sm text-brand-textMuted">{r.content}</p>
              <p className="text-xs text-brand-textMuted/60 mt-2">{r.date}</p>
            </div>
          ))}
        </div>
      )}

      {visibleCount < totalCount && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount((c) => c + 6)}
            className="text-sm font-semibold text-brand-primary hover:underline"
          >
            Ver más reseñas
          </button>
        </div>
      )}
    </section>
  );
}
