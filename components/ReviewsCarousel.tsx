"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import StarRating from "./StarRating";
import { HOME_REVIEWS } from "@/lib/homeReviews";

// Carrusel horizontal con scroll-snap nativo: en mobile se desliza con el
// dedo sin ningún JS extra (el navegador ya lo hace), y en desktop las
// flechas simplemente le piden al contenedor que se desplace una tarjeta.
// Reemplaza la franja de 3 cajas de beneficios que había antes debajo del
// catálogo.
export default function ReviewsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold">Lo que dicen nuestros clientes</h2>
          <p className="text-sm text-brand-textMuted">Reseñas reales de compras confirmadas por WhatsApp.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Anterior"
            className="w-9 h-9 rounded-full border border-brand-border text-brand-textMuted hover:text-white hover:border-brand-primary transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Siguiente"
            className="w-9 h-9 rounded-full border border-brand-border text-brand-textMuted hover:text-white hover:border-brand-primary transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {HOME_REVIEWS.map((r, i) => (
          <motion.div
            key={r.name + i}
            data-review-card
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-brand-surface border border-brand-border rounded-2xl p-4 flex flex-col gap-2"
          >
            <StarRating rating={r.rating} size="sm" />
            <p className="text-sm text-brand-textMuted leading-relaxed flex-1">"{r.text}"</p>
            <div className="text-xs font-semibold text-white pt-1">{r.name}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
