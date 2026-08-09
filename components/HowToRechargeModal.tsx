"use client";

// Modal de "cómo recargar" — mismo patrón que LoginModal.tsx: portal directo
// a <body> (position:fixed dentro de un ancestro con backdrop-blur pierde el
// centrado respecto al viewport) + overlay que cierra al click + bloqueo de
// scroll del body mientras está abierto.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const VIDEO_SRC = "/videos/como-recargar.mp4";

export default function HowToRechargeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reintenta el video la próxima vez que se abra el modal (por si ya
  // subiste public/videos/como-recargar.mp4 después de un primer fallo).
  useEffect(() => {
    if (open) setVideoError(false);
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
              {videoError ? (
                <div className="aspect-video w-full rounded-xl bg-brand-surfaceLight border border-brand-border flex flex-col items-center justify-center gap-2 text-brand-textMuted">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M10 9.5v5l4-2.5-4-2.5z" fill="currentColor" stroke="none" />
                  </svg>
                  <p className="text-sm font-semibold">Video próximamente</p>
                </div>
              ) : (
                // Cuando subas el archivo real a public/videos/como-recargar.mp4
                // este <video> lo va a servir automáticamente, sin tocar código.
                <video
                  key={open ? "open" : "closed"}
                  controls
                  className="w-full aspect-video rounded-xl bg-black"
                  onError={() => setVideoError(true)}
                >
                  <source src={VIDEO_SRC} type="video/mp4" />
                </video>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
