"use client";

import { motion } from "framer-motion";

const TITLE = "Recarga tus juegos favoritos con total confianza";

const TRUST_ITEMS = [
  {
    label: "4.8/5 en +500 recargas",
    hint: "Valoración promedio de clientes",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-brand-gold">
        <path d="M12 2.5l2.9 6.06 6.6.83-4.85 4.6 1.28 6.6L12 17.2l-5.93 3.4 1.28-6.6-4.85-4.6 6.6-.83L12 2.5z" />
      </svg>
    ),
  },
  {
    label: "Pago Móvil verificado en minutos",
    hint: "Sin esperas, confirmación al instante",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-green" fill="none" strokeWidth="2">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    label: "Entrega en minutos",
    hint: undefined as string | undefined,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-brand-primary" fill="none" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// Franja de confianza entre el carrusel de banners y el catálogo — refuerza
// credibilidad (valoración, velocidad, seguridad del pago) justo antes de
// que el cliente empiece a elegir juego.
export default function TrustSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h2
        className="text-center text-base sm:text-lg font-black uppercase tracking-wide mb-4 sm:mb-5
          bg-gradient-to-r from-brand-primary via-white to-brand-gold bg-clip-text text-transparent
          drop-shadow-[0_0_18px_rgba(14,165,233,0.35)]"
      >
        {TITLE.split(" ").map((word, i) => (
          <span key={i} className="inline-block align-bottom mr-[0.28em] pb-1 -mb-1">
            <motion.span
              className="inline-block"
              initial={{ y: 25, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>

      <div className="flex flex-nowrap sm:flex-wrap sm:grid sm:grid-cols-3 gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-none snap-x snap-mandatory sm:snap-none">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="snap-start shrink-0 w-[220px] sm:w-auto flex items-center gap-3 bg-brand-surface border border-brand-border rounded-2xl px-4 py-3"
          >
            <span className="shrink-0 w-9 h-9 rounded-full bg-brand-surfaceLight flex items-center justify-center">
              {item.icon}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white leading-tight">{item.label}</div>
              {item.hint && <div className="text-[11px] text-brand-textMuted leading-tight">{item.hint}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
