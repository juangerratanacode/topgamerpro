"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Los cambios del admin ya se guardan solos en localStorage apenas los
// escribes (no hay riesgo de perderlos), pero eso no se siente igual que
// un botón real de "Guardar". Este componente da esa confirmación visual
// explícita que pediste, sin cambiar cómo se persisten los datos.
export default function SaveBar() {
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleSave() {
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2200);
  }

  return (
    <div className="sticky bottom-4 z-30 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-brand-surface border border-brand-border rounded-full shadow-2xl shadow-black/40 px-2 py-2">
        <AnimatePresence mode="wait">
          {savedAt ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 text-brand-green text-sm font-semibold px-4"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-brand-green">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              Cambios guardados
            </motion.span>
          ) : (
            <motion.button
              key="save"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSave}
              className="bg-brand-primary hover:bg-brand-primaryDark text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
            >
              Guardar cambios
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
