"use client";

// Modal de "cómo recargar" — mismo patrón que LoginModal.tsx: portal directo
// a <body> (position:fixed dentro de un ancestro con backdrop-blur pierde el
// centrado respecto al viewport) + overlay que cierra al click + bloqueo de
// scroll del body mientras está abierto.

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// Short de YouTube con el paso a paso general de cómo recargar —
// https://youtube.com/shorts/gYIzUctPEbA
const VIDEO_ID = "gYIzUctPEbA";

export default function HowToRechargeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-[calc(100%-2rem)] sm:h-auto sm:max-w-2xl bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="p-5 pb-3 pr-14">
              <h2 className="font-bold text-lg text-white">Cómo recargar tu juego</h2>
              <p className="text-xs text-brand-textMuted mt-1">
                Un video rápido con todo el proceso, paso a paso.
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
              {/* aspect-[9/16]: es un Short (formato vertical) — con
                  aspect-video (16:9) quedaría aplastado con barras negras
                  enormes arriba/abajo. Centrado y con un ancho máximo para
                  que no se estire de más en pantallas anchas, mismo
                  criterio que VideoTutorialModal.tsx (popup de Call of
                  Duty Mobile). */}
              <div className="aspect-[9/16] w-full max-w-[280px] mx-auto rounded-xl overflow-hidden bg-black">
                {open && (
                  <iframe
                    key={VIDEO_ID}
                    // modestbranding/rel/iv_load_policy: minimizan la marca
                    // de YouTube (logo, sugeridos de otros canales,
                    // anotaciones) — el nombre del canal del creador puede
                    // seguir apareciendo un instante al iniciar, eso ya no
                    // lo controla el embed, es política de YouTube.
                    src={`https://www.youtube.com/embed/${VIDEO_ID}?modestbranding=1&rel=0&iv_load_policy=3`}
                    title="Cómo recargar tu juego"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
