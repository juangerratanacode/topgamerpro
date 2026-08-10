"use client";

import Link from "next/link";
import { useCurrency } from "@/lib/currencyStore";
import { useAccountOrders, type AccountOrder } from "@/lib/useAccountOrders";

const STATUS_META: Record<AccountOrder["status"], { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-yellow-500/15 text-yellow-400" },
  confirmado: { label: "Confirmado", className: "bg-brand-green/15 text-brand-green" },
  rechazado: { label: "Rechazado", className: "bg-red-500/15 text-red-400" },
};

export default function MiCuentaPedidosPage() {
  const { format } = useCurrency();
  const { orders, loading } = useAccountOrders();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Mis pedidos</h1>

      {loading && <p className="text-brand-textMuted text-sm">Cargando pedidos...</p>}

      {!loading && orders && orders.length === 0 && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-surfaceLight flex items-center justify-center text-brand-textMuted">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l1.5-3h15L21 7M3 7h18M3 7v12a1 1 0 001 1h16a1 1 0 001-1V7M9 11a3 3 0 006 0" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">No tienes pedidos aún</p>
            <p className="text-sm text-brand-textMuted">Cuando hagas tu primera compra, aparecerá aquí.</p>
          </div>
          <Link
            href="/"
            className="bg-brand-primary hover:bg-brand-primaryDark text-brand-bg font-bold px-5 py-2.5 rounded-full transition-colors text-sm"
          >
            Ir a la tienda
          </Link>
        </div>
      )}

      {!loading && orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusMeta = STATUS_META[order.status];
            return (
              <div key={order.id} className="bg-brand-surface border border-brand-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-brand-textMuted">
                    #{order.id.slice(0, 8)} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-VE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </div>
                <div className="space-y-1 mb-2">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm text-brand-textMuted">
                      {item.quantity} × {item.productName} — {item.variationLabel}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-brand-border pt-2">
                  <span className="text-xs text-brand-textMuted">Total</span>
                  <span className="font-bold text-brand-primary">{format(order.totalUsd)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
