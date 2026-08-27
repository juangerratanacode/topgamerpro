"use client";

import { useMemo, useState } from "react";
import { useOrders, type OrderStatus } from "@/lib/ordersStore";
import clsx from "clsx";

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-brand-gold/15 text-brand-gold border-brand-gold/30" },
  confirmado: { label: "Confirmado", className: "bg-brand-green/15 text-brand-green border-brand-green/30" },
  rechazado: { label: "Rechazado", className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const METHOD_LABELS: Record<string, string> = {
  pago_movil_manual: "Pago Móvil",
};

function monthKey(iso: string) {
  return iso.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
}

export default function PedidosPage() {
  const { orders, hydrated, updateStatus } = useOrders();
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const months = useMemo(() => {
    const set = new Set(orders.map((o) => monthKey(o.createdAt)));
    return Array.from(set).sort().reverse();
  }, [orders]);

  const filtered = orders.filter((o) => {
    if (monthFilter !== "all" && monthKey(o.createdAt) !== monthFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const totalConfirmed = filtered
    .filter((o) => o.status === "confirmado")
    .reduce((acc, o) => acc + o.totalUsd, 0);

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">Pedidos</h1>
      <p className="text-sm text-brand-textMuted mb-6">
        Cada pedido enviado por WhatsApp queda registrado aquí. Marca como confirmado cuando
        verifiques el pago y hagas la recarga, o rechazado si el comprobante no es válido.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Todos los meses</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <div className="ml-auto bg-brand-surface border border-brand-border rounded-lg px-4 py-2 text-sm">
          <span className="text-brand-textMuted">Ventas confirmadas: </span>
          <span className="font-bold text-brand-green">${totalConfirmed.toFixed(2)}</span>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-brand-textMuted">No hay pedidos con estos filtros todavía.</p>
      )}

      <div className="space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="bg-brand-surface border border-brand-border rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-bold text-sm">
                  #{order.id} — {order.customer.firstName} {order.customer.lastName}
                </div>
                <div className="text-xs text-brand-textMuted">
                  {order.customer.email} · {order.customer.phone}
                </div>
                <div className="text-xs text-brand-textMuted">
                  {new Date(order.createdAt).toLocaleString("es-VE")}
                </div>
              </div>
              <span
                className={clsx(
                  "text-xs font-semibold border rounded-full px-3 py-1 shrink-0",
                  STATUS_META[order.status].className
                )}
              >
                {STATUS_META[order.status].label}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-3">
              <div className="text-sm space-y-2">
                {order.items.map((item, i) => (
                  <div key={i}>
                    <div className="text-brand-textMuted">
                      {item.quantity} × {item.productName} — {item.variationLabel}
                    </div>
                    {item.gameFields.length > 0 && (
                      <div className="mt-0.5 pl-3 border-l-2 border-brand-border space-y-0.5">
                        {item.gameFields.map((f, fi) => (
                          <div key={fi} className="text-xs">
                            <span className="text-brand-textMuted">{f.label}:</span>{" "}
                            <span className="font-semibold">{f.value || "—"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="font-bold text-white pt-1">Total: ${order.totalUsd.toFixed(2)}</div>
                <div className="text-xs text-brand-textMuted">
                  Pago: {METHOD_LABELS[order.payment.method] ?? order.payment.method} · Ref:{" "}
                  {order.payment.reference}
                </div>
              </div>

              <div>
                {order.payment.receiptDataUrl ? (
                  <a href={order.payment.receiptDataUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={order.payment.receiptDataUrl}
                      alt="Comprobante"
                      className="w-28 h-28 object-cover rounded-lg border border-brand-border hover:border-brand-primary transition-colors"
                    />
                  </a>
                ) : (
                  <span className="text-xs text-brand-textMuted">Sin comprobante</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const error = await updateStatus(order.id, "confirmado");
                  if (error) alert(`No se pudo confirmar el pedido: ${error}`);
                }}
                disabled={order.status === "confirmado"}
                className="text-xs font-semibold bg-brand-green/15 text-brand-green border border-brand-green/30 rounded-full px-3 py-1.5 disabled:opacity-40"
              >
                Confirmar
              </button>
              <button
                onClick={async () => {
                  const error = await updateStatus(order.id, "rechazado");
                  if (error) alert(`No se pudo rechazar el pedido: ${error}`);
                }}
                disabled={order.status === "rechazado"}
                className="text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 rounded-full px-3 py-1.5 disabled:opacity-40"
              >
                Rechazar
              </button>
              <button
                onClick={async () => {
                  const error = await updateStatus(order.id, "pendiente");
                  if (error) alert(`No se pudo actualizar el pedido: ${error}`);
                }}
                disabled={order.status === "pendiente"}
                className="text-xs font-semibold bg-brand-surfaceLight text-brand-textMuted border border-brand-border rounded-full px-3 py-1.5 disabled:opacity-40"
              >
                Marcar pendiente
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
