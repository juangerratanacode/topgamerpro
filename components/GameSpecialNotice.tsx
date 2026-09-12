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
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-200">
          <strong className="text-red-300">Tu cuenta debe estar vinculada a Activision.</strong>{" "}
          Si no lo has hecho,{" "}
          <button
            onClick={() => setTutorialOpen(true)}
            className="font-semibold text-red-200 underline underline-offset-2 hover:text-white transition-colors"
          >
            Aquí tienes el paso a paso
          </button>
          .
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
