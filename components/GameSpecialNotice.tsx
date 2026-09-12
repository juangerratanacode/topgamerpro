"use client";

// Puerto de los popups "Pop pup call of dutty" y "efootball 2 2" —
// avisos de vinculación de cuenta para juegos que lo requieren.

import { useState } from "react";
import type { Product } from "@/lib/types";
import VideoTutorialModal from "./VideoTutorialModal";

// Short de YouTube con el paso a paso de vinculación a Activision —
// https://youtube.com/shorts/c2iUDQ4FVw0
const ACTIVISION_TUTORIAL_VIDEO_ID = "c2iUDQ4FVw0";

export default function GameSpecialNotice({ product }: { product: Product }) {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  if (product.requiresActivisionLink) {
    return (
      <>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-200 space-y-3">
          <p>
            <strong className="text-red-300">Tu cuenta debe estar vinculada a Activision.</strong>{" "}
            Si no lo has hecho, mira el paso a paso.
          </p>
          {/* Mismo estilo que "Aprende a recargar" (FloatingHelpButton) —
              píldora con ícono de play y color de marca, para que se note
              que es una acción real (ver video) y no solo un link de texto. */}
          <button
            onClick={() => setTutorialOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold text-sm rounded-full shadow-glow transition-colors pl-3 pr-4 py-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M10 8.5l5 3.5-5 3.5v-7z" fill="currentColor" stroke="none" />
            </svg>
            Ver tutorial paso a paso
          </button>
        </div>
        <VideoTutorialModal
          open={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
          videoId={ACTIVISION_TUTORIAL_VIDEO_ID}
          title="Cómo vincular tu cuenta a Activision"
        />
      </>
    );
  }

  if (product.requiresKonamiId) {
    return (
      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4 mb-4 text-sm text-yellow-100">
        <strong className="text-brand-gold">⚠ Importante:</strong> Este servicio solo está
        disponible para cuentas vinculadas a <strong>KONAMI ID</strong>.
      </div>
    );
  }

  return null;
}
