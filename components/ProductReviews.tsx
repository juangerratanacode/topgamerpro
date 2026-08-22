"use client";

import { useState } from "react";
import { useReviewStats, invalidateReviewsCache } from "@/lib/useReviewStats";
import StarRating from "./StarRating";
import clsx from "clsx";

export default function ProductReviews({ slug, productName }: { slug: string; productName: string }) {
  const { average, count, all } = useReviewStats(slug);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [visibleCount, setVisibleCount] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !email.trim() || !content.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: slug,
          author: author.trim(),
          email: email.trim(),
          content: content.trim(),
          rating,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(data?.error ?? "No se pudo publicar la reseña.");
        return;
      }
      invalidateReviewsCache();
      setAuthor("");
      setEmail("");
      setContent("");
      setRating(5);
      setShowForm(false);
      // useReviewStats vuelve a pedir la lista recién en el próximo mount —
      // forzamos un refresh de la página actual para que la reseña nueva
      // aparezca de una, sin tener que navegar para verla.
      window.location.reload();
    } catch {
      setSubmitError("No se pudo conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="resenas" className="mt-14 border-t border-brand-border pt-10 scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Opiniones sobre {productName}</h2>
          {count > 0 ? (
            <div className="flex items-center gap-2 text-sm text-brand-textMuted">
              <StarRating rating={average} size="md" />
              <span className="font-semibold text-white">{average}</span>
              <span>· {count} reseñas</span>
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
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo (no se publica)"
              className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
            />
          </div>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cuéntanos cómo fue tu recarga..."
            rows={3}
            className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-3 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary resize-none"
          />
          {submitError && <p className="text-xs text-red-400">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 text-brand-bg font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            {submitting ? "Publicando..." : "Publicar reseña"}
          </button>
        </form>
      )}

      {count > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {all.slice(0, visibleCount).map((r) => (
            <div key={r.id} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
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

      {visibleCount < count && (
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
