"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// Botón flotante fijo que enseña el proceso de recarga. Se ubica arriba
// del botón flotante de WhatsApp (bottom-6 right-6, ver
// components/WhatsAppFloatingButton.tsx) para que, si en algún momento se
// activa, ambos convivan sin taparse — este queda en bottom-24.
export default function FloatingHelpButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.6, ease: "easeOut" }}
      className="fixed bottom-24 right-6 z-40"
    >
      <Link
        href="/como-recargar"
        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold text-sm pl-3 pr-4 py-3 rounded-full shadow-glow transition-colors"
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
        <span className="sm:hidden">Ayuda</span>
      </Link>
    </motion.div>
  );
}
