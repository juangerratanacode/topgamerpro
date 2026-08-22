"use client";

// Registro de pedidos. Antes vivían en localStorage; ahora se leen desde
// la tabla `orders` (+ `order_items`) de Supabase vía /api/orders. La
// creación del pedido (POST) ya la hace directamente CheckoutForm.tsx.

import { useCallback, useEffect, useState } from "react";
import type { CartItem, Currency, CustomerInfo, PaymentMethodId } from "./types";
import { adminFetch } from "./adminFetch";

export type OrderStatus = "pendiente" | "confirmado" | "rechazado";

export interface StoredOrder {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  currency: Currency;
  payment: {
    method: PaymentMethodId;
    reference: string;
    receiptDataUrl: string | null; // ahora es la URL pública en Supabase Storage
  };
  totalUsd: number;
  status: OrderStatus;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchOrders(): Promise<StoredOrder[]> {
  try {
    const res = await adminFetch("/api/orders", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.orders) ? data.orders : [];
  } catch {
    return [];
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    fetchOrders().then((o) => {
      setOrders(o);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Antes esto era "puro optimismo": si el PATCH fallaba (sesión vencida,
  // red caída, lo que sea), el error se tragaba en silencio y la pantalla
  // se quedaba mostrando "Confirmado" aunque en la base siguiera
  // "pendiente" — nada avisaba que había que reintentar. Ahora, si falla,
  // se revierte el cambio optimista y se devuelve el error para que la
  // pantalla lo muestre.
  const updateStatus = useCallback(async (id: string, status: OrderStatus): Promise<string | null> => {
    const previousStatus = orders.find((o) => o.id === id)?.status;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      const res = await adminFetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) return null;
      if (previousStatus) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: previousStatus } : o)));
      const body = await res.json().catch(() => null);
      return body?.error ?? `Error ${res.status} al actualizar el pedido.`;
    } catch (err) {
      if (previousStatus) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: previousStatus } : o)));
      return err instanceof Error ? err.message : "No se pudo conectar con el servidor.";
    }
  }, [orders]);

  return { orders, hydrated, refresh, updateStatus };
}
