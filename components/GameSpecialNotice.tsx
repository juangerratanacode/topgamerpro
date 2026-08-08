// Puerto de los popups "Pop pup call of dutty" y "efootball 2 2" —
// avisos de vinculación de cuenta para juegos que lo requieren.

import type { Product } from "@/lib/types";

export default function GameSpecialNotice({ product }: { product: Product }) {
  if (product.requiresActivisionLink) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-200">
        <strong className="text-red-300">Tu cuenta debe estar vinculada a Activision.</strong>{" "}
        Si no lo has hecho, contáctanos antes de comprar para evitar pérdidas.
      </div>
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
