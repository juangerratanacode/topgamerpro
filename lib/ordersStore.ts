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

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await adminFetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      // si falla, un refresh manual del admin vuelve a traer el estado real
    }
  }, []);

  return { orders, hydrated, refresh, updateStatus };
}
