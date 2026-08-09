"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HowToRechargeModal from "./HowToRechargeModal";

// Botón flotante fijo que abre el modal de "cómo recargar" (antes navegaba
// a /como-recargar, que sigue existiendo como página de contenido/SEO pero
// ya no es a donde lleva este botón). Se ubica arriba del botón flotante de
// WhatsApp (bottom-6 right-6, ver components/WhatsAppFloatingButton.tsx)
// para que, si en algún momento se activa, ambos convivan sin taparse.
//
// En mobile es un círculo chico (solo ícono) en vez de la píldora con
// texto: así ocupa el mínimo posible sobre el contenido que tiene detrás
// mientras el usuario scrollea (ej. las tarjetas de /como-recargar).
export default function FloatingHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.6, ease: "easeOut" }}
        className="fixed bottom-24 right-4 sm:right-6 z-40"
      >
        <button
          onClick={() => setOpen(true)}
          aria-label="Aprende a recargar"
          className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold text-sm rounded-full shadow-glow transition-colors w-12 h-12 sm:w-auto sm:h-auto sm:pl-3 sm:pr-4 sm:py-3"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.5 9a2.5 2.5 0 114.2 1.8c-.7.65-1.7 1.05-1.7 2.2"
            />
            <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
          </svg>
          <span className="hidden sm:inline">Aprende a recargar</span>
        </button>
      </motion.div>

      <HowToRechargeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
