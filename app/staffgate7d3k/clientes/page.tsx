"use client";

import { useMemo } from "react";
import { useOrders } from "@/lib/ordersStore";

interface CustomerSummary {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpentUsd: number;
  lastOrderAt: string;
}

export default function ClientesPage() {
  const { orders, hydrated } = useOrders();

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    for (const order of orders) {
      const key = order.customer.email.toLowerCase();
      const existing = map.get(key);
      const spent = order.status === "confirmado" ? order.totalUsd : 0;
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpentUsd += spent;
        if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
      } else {
        map.set(key, {
          email: order.customer.email,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          phone: order.customer.phone,
          orderCount: 1,
          totalSpentUsd: spent,
          lastOrderAt: order.createdAt,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? 1 : -1));
  }, [orders]);

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">Clientes</h1>
      <p className="text-sm text-brand-textMuted mb-6">
        Se arman automáticamente a partir de los pedidos que has recibido — sin necesidad de que el
        cliente cree una cuenta.
      </p>

      {customers.length === 0 && (
        <p className="text-sm text-brand-textMuted">Todavía no hay clientes registrados.</p>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-left text-brand-textMuted text-xs">
              <th className="p-3 font-semibold">Cliente</th>
              <th className="p-3 font-semibold">Contacto</th>
              <th className="p-3 font-semibold">Pedidos</th>
              <th className="p-3 font-semibold">Gastado</th>
              <th className="p-3 font-semibold">Último pedido</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-brand-border last:border-0">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 text-brand-textMuted">
                  {c.email}
                  <br />
                  {c.phone}
                </td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3 text-brand-green font-semibold">${c.totalSpentUsd.toFixed(2)}</td>
                <td className="p-3 text-brand-textMuted">
                  {new Date(c.lastOrderAt).toLocaleDateString("es-VE")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
