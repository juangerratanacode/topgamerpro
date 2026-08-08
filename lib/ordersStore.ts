"use client";

// Registro de pedidos reales. Igual que adminStore/cartStore, vive en
// localStorage mientras no conectemos Supabase — pero ya captura todo lo
// que el panel admin necesita para replicar el flujo de WooCommerce:
// datos del cliente, comprobante de pago, y estado (pendiente / confirmado
// / rechazado) editable manualmente por quien procesa la recarga.

import { useCallback, useEffect, useState } from "react";
import type { CartItem, Currency, CustomerInfo, PaymentMethodId } from "./types";

export type OrderStatus = "pendiente" | "confirmado" | "rechazado";

export interface StoredOrder {
  id: string;
  createdAt: string; // ISO
  customer: CustomerInfo;
  items: CartItem[];
  currency: Currency;
  payment: {
    method: PaymentMethodId;
    reference: string;
    receiptDataUrl: string | null; // imagen del comprobante, en base64
  };
  totalUsd: number;
  status: OrderStatus;
}

const STORAGE_KEY = "pitanga_orders_v1";

function readAll(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

function writeAll(orders: StoredOrder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function saveOrder(order: StoredOrder) {
  const all = readAll();
  all.unshift(order);
  writeAll(all);
}

export function useOrders() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOrders(readAll());
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => setOrders(readAll()), []);

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, status } : o));
      writeAll(next);
      return next;
    });
  }, []);

  return { orders, hydrated, refresh, updateStatus };
}
