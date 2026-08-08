"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-bg border-b border-brand-border">
      {/* Arte generado con IA: personajes emergiendo de teléfonos, neón azul/violeta.
          Animación lenta de zoom-out (empieza acercada y se aleja) para que el
          hero se sienta vivo en vez de una imagen estática. */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="/hero/hero-visual.png"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-70"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-brand-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-brand-bg/40" />
      </div>

      {/* glow ambiental encima de la imagen */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-brand-accent2/15 rounded-full blur-3xl animate-blob [animation-delay:3s]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32 relative">
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block bg-brand-surfaceLight border border-brand-border text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
          >
            Entrega en minutos
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-6xl font-black leading-tight"
          >
            Recarga tu juego <br />
            <span className="bg-gradient-to-r from-brand-primary via-brand-accent to-brand-accent2 bg-clip-text text-transparent">
              favorito
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-brand-textMuted mt-4 max-w-lg text-base sm:text-lg"
          >
            Elige tu juego, indica tus datos y paga con Pago Móvil, Binance, PayPal o Bancolombia —
            la recarga se procesa en minutos.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#catalogo"
              className="bg-brand-primary hover:bg-brand-primaryDark text-white font-bold px-6 py-3 rounded-full transition-colors shadow-glow border border-brand-accent/40 hover:border-brand-accent"
            >
              Ver catálogo
            </a>
            <a
              href="/soporte"
              className="border border-brand-border hover:border-brand-accent text-white font-bold px-6 py-3 rounded-full transition-colors"
            >
              Hablar con soporte
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
