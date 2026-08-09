"use client";

import { motion } from "framer-motion";

const BENEFITS = [
  {
    title: "Entrega rápida",
    desc: "Tu recarga se procesa en minutos, no en horas.",
    stat: "En promedio, menos de 10 minutos",
    accent: "border-t-brand-primary",
    iconBg: "bg-brand-primary/15",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-brand-primary">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    title: "Pago local",
    desc: "Pago Móvil, sin complicaciones.",
    stat: "Validación automática, sin esperas",
    accent: "border-t-brand-gold",
    iconBg: "bg-brand-gold/15",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-brand-gold" fill="none" strokeWidth="2">
        <rect x="4" y="5" width="16" height="14" rx="2" strokeLinejoin="round" />
        <path d="M4 10h16" strokeLinecap="round" />
        <path d="M7 14.5h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Soporte directo",
    desc: "Atención personal por WhatsApp en cada pedido.",
    stat: "Respuesta en minutos",
    accent: "border-t-brand-whatsapp",
    iconBg: "bg-brand-whatsapp/15",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-brand-whatsapp">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z" />
      </svg>
    ),
  },
];

// Franja de beneficios debajo del catálogo — antes eran 3 cajas planas
// idénticas sin jerarquía; ahora cada una tiene ícono, un borde superior de
// color distinto (mismo truco que TrustSection con brand-primary/gold/
// whatsapp) y un dato extra de confianza, con entrada escalonada al
// llegar al scroll.
export default function BenefitsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="grid sm:grid-cols-3 gap-4">
        {BENEFITS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
            className={`bg-brand-surface border border-brand-border border-t-2 ${b.accent} rounded-2xl p-5 space-y-3`}
          >
            <span className={`inline-flex w-11 h-11 rounded-xl items-center justify-center ${b.iconBg}`}>
              {b.icon}
            </span>
            <div>
              <div className="font-bold text-white mb-1">{b.title}</div>
              <div className="text-sm text-brand-textMuted">{b.desc}</div>
            </div>
            <div className="text-xs font-semibold text-brand-green">{b.stat}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
