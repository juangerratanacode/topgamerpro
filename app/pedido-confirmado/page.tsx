"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PedidoConfirmadoPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-green/15 border border-brand-green/40 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold mb-2">¡Pedido guardado con éxito!</h1>
      <p className="text-brand-textMuted mb-6">Orden #{orderId}</p>

      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-lg p-4 mb-6 text-sm text-yellow-100 text-left">
        <strong className="text-brand-gold">🔔 ¿No se abrió tu WhatsApp?</strong>
        <br />
        Si no pudiste enviar el comprobante, contáctanos directo con el botón verde flotante para
        procesar tu recarga.
      </div>

      <Link
        href="/"
        className="inline-block bg-brand-primary hover:bg-brand-primaryDark text-white font-bold py-3 px-8 rounded-full transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
