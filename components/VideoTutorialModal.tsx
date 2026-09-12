"use client";

// Modal genérico para tutoriales en video embebidos de YouTube — mismo
// patrón que HowToRechargeModal.tsx (portal a <body>, overlay, bloqueo de
// scroll) pero pensado para reutilizarse con cualquier juego/video: quien
// lo usa solo pasa el videoId de YouTube y un título. Se armó a partir del
// aviso de Activision en GameSpecialNotice.tsx, pero no depende de nada
// específico de ese juego — a futuro sirve igual para eFootball u otros.

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

interface VideoTutorialModalProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  title: string;
}

export default function VideoTutorialModal({ open, onClose, videoId, title }: VideoTutorialModalProps) {
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
            className="relative w-full max-w-xs sm:max-w-sm bg-brand-surface border border-brand-border rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]"
          >
            {/* Encabezado con marca — mismo degradado de header/franjas de
                marca que ya se usa en otros lados del sitio. */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-brand-primary to-brand-accent shrink-0">
              <Logo size="sm" />
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <h2 className="font-bold text-sm text-white mb-3">{title}</h2>

              {/* aspect-[9/16]: el video es un Short (formato vertical) —
                  con aspect-video (16:9) quedaría aplastado con barras
                  negras enormes arriba/abajo. Centrado y con un ancho
                  máximo para que no se estire de más en pantallas anchas. */}
              <div className="aspect-[9/16] w-full max-w-[260px] mx-auto rounded-xl overflow-hidden bg-black">
                {open && (
                  <iframe
                    key={videoId}
                    // modestbranding/rel/iv_load_policy: minimizan la marca de
                    // YouTube (logo, sugeridos de otros canales, anotaciones)
                    // — el nombre del canal del creador puede seguir
                    // apareciendo un instante al iniciar, eso ya no lo
                    // controla el embed, es política de YouTube.
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&controls=1`}
                    title={title}
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
