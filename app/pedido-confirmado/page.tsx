"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/constants";

function PedidoConfirmadoContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const waUrl = params.get("wa");
  const cleanPhone = WHATSAPP_NUMBER.replace("+", "");

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-green/15 border border-brand-green/40 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold mb-2">¡Pedido realizado!</h1>
      <p className="text-brand-textMuted mb-6">Orden #{orderId}</p>

      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-lg p-4 mb-6 text-sm text-yellow-100 text-left">
        <strong className="text-brand-gold">🔔 ¿No se abrió tu WhatsApp?</strong>
        <br />
        Tocá el botón de abajo para enviarnos tu comprobante y procesar la recarga.
      </div>

      <a
        href={waUrl ?? `https://wa.me/${cleanPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-brand-whatsapp hover:bg-brand-whatsappDark text-white font-bold py-3 px-8 rounded-full transition-colors mb-3"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z" />
        </svg>
        Abrir WhatsApp
      </a>

      <div>
        <Link
          href="/"
          className="inline-block text-brand-textMuted hover:text-white font-semibold py-2 px-4 transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={null}>
      <PedidoConfirmadoContent />
    </Suspense>
  );
}
