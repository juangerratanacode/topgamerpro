"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SaveBarProps {
  onSave?: () => Promise<boolean> | boolean;
  saving?: boolean;
  error?: boolean;
}

// Botón real de guardar: llama a onSave (que persiste en Supabase) y
// muestra el resultado. Antes esto solo mostraba una animación sin
// guardar nada de verdad — cada cambio se mandaba solo, lo que causaba
// carreras que duplicaban datos. Ahora el guardado es explícito.
export default function SaveBar({ onSave, saving, error }: SaveBarProps) {
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    if (!onSave) return;
    const ok = await onSave();
    if (ok) {
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2200);
    }
  }

  return (
    <div className="sticky bottom-4 z-30 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-brand-surface border border-brand-border rounded-full shadow-2xl shadow-black/40 px-2 py-2">
        {error && (
          <span className="text-red-400 text-xs font-semibold px-2">No se pudo guardar</span>
        )}
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
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
