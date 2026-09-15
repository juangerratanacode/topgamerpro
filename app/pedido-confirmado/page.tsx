"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { useCart } from "@/lib/cartStore";

// Cuánto se espera antes de intentar abrir WhatsApp solo, para que el
// cliente alcance a leer el resumen del pedido antes de que la pantalla
// cambie — y para que, si cancela el intento automático (o vuelve acá),
// el botón manual siga estando disponible para reintentar.
const AUTO_REDIRECT_MS = 1500;

function PedidoConfirmadoContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const waUrl = params.get("wa");
  const nombre = params.get("nombre") ?? "";
  const total = params.get("total") ?? "";
  const cleanPhone = WHATSAPP_NUMBER.replace("+", "");
  const finalWaUrl = waUrl ?? `https://wa.me/${cleanPhone}`;

  const { clearCart } = useCart();
  const [autoOpened, setAutoOpened] = useState(false);
  // Si el cliente ya tocó el botón manual, no hace falta (ni conviene)
  // que el intento automático se dispare también un momento después.
  const manualClickRef = useRef(false);

  // El carrito se vacía ACÁ, no en el checkout — recién cuando el pedido
  // ya está creado Y el cliente está viendo esta pantalla de confirmación.
  // Antes se vaciaba justo antes de navegar, y como la navegación no es
  // instantánea, se alcanzaba a ver un instante de "carrito vacío" en la
  // página de checkout, dando sensación de error o pérdida de datos.
  useEffect(() => {
    if (orderId) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Redirección automática opcional a WhatsApp — se mantiene EN ESTA
  // MISMA pestaña (location.href, no window.open) porque un popup
  // disparado desde un setTimeout casi siempre lo bloquea el navegador al
  // no venir de un click directo del usuario. El botón manual de abajo
  // queda siempre visible, tanto antes de que dispare esto como después
  // (si el navegador canceló el intento de abrir la app, esta pestaña
  // nunca llega a irse de acá).
  useEffect(() => {
    if (!waUrl) return;
    const timer = setTimeout(() => {
      if (manualClickRef.current) return;
      setAutoOpened(true);
      window.location.href = finalWaUrl;
    }, AUTO_REDIRECT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waUrl]);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-green/15 border border-brand-green/40 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold mb-2">¡Pedido registrado con éxito!</h1>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 mb-6 text-sm text-left space-y-1.5">
        <div className="flex justify-between">
          <span className="text-brand-textMuted">Número de orden</span>
          <span className="font-semibold">#{orderId.slice(0, 8).toUpperCase()}</span>
        </div>
        {nombre && (
          <div className="flex justify-between">
            <span className="text-brand-textMuted">Cliente</span>
            <span className="font-semibold">{nombre}</span>
          </div>
        )}
        {total && (
          <div className="flex justify-between">
            <span className="text-brand-textMuted">Total</span>
            <span className="font-semibold text-brand-primary">{total}</span>
          </div>
        )}
      </div>

      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-lg p-4 mb-6 text-sm text-yellow-100 text-left">
        <strong className="text-brand-gold">Un paso más:</strong>{" "}
        {autoOpened
          ? "Si WhatsApp no se abrió solo, tocá el botón de abajo."
          : "Te llevamos a WhatsApp en un momento — si no pasa nada, tocá el botón de abajo."}
      </div>

      <a
        href={finalWaUrl}
        onClick={() => {
          manualClickRef.current = true;
        }}
        className="inline-flex items-center justify-center gap-2 bg-brand-whatsapp hover:bg-brand-whatsappDark text-white font-bold py-3 px-8 rounded-full transition-colors mb-3"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z" />
        </svg>
        Abrir WhatsApp para enviar comanda
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
