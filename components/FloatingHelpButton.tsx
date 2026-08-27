"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import HowToRechargeModal from "./HowToRechargeModal";

// Botón flotante fijo que abre el modal de "cómo recargar" (antes navegaba
// a /como-recargar, que sigue existiendo como página de contenido/SEO pero
// ya no es a donde lleva este botón).
//
// Antes en mobile era un círculo chico (solo ícono) para ocupar el mínimo
// posible sobre el contenido mientras se scrollea — pero sin texto no
// quedaba claro qué hacía el botón. Ahora es una píldora con ícono + texto
// en todos los tamaños; en mobile el texto es más corto ("Cómo Recargar")
// para no ocupar tanto ancho.
export default function FloatingHelpButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Es para clientes de la tienda — dentro del panel de admin tapaba
  // botones reales (ej. "Guardar cambios" en /staffgate7d3k/catalogo).
  if (pathname?.startsWith("/staffgate7d3k")) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.6, ease: "easeOut" }}
        className="fixed bottom-6 right-4 sm:right-6 z-40"
      >
        <button
          onClick={() => setOpen(true)}
          aria-label="Aprende a recargar"
          className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold text-sm rounded-full shadow-glow transition-colors pl-3 pr-4 py-3"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M10 8.5l5 3.5-5 3.5v-7z" fill="currentColor" stroke="none" />
          </svg>
          <span className="sm:hidden">Cómo Recargar</span>
          <span className="hidden sm:inline">Aprende a recargar</span>
        </button>
      </motion.div>

      <HowToRechargeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
