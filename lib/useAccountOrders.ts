"use client";

// Hook compartido entre las subpáginas de /mi-cuenta (escritorio y
// pedidos) para no duplicar el fetch a /api/mi-cuenta/orders — ambas
// necesitan la misma info (lista de pedidos + puntos acumulados).

import { useEffect, useState } from "react";
import { useAuth } from "./authStore";

export interface AccountOrderItem {
  productName: string;
  variationLabel: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface AccountOrder {
  id: string;
  createdAt: string;
  items: AccountOrderItem[];
  currency: string;
  paymentMethod: string;
  totalUsd: number;
  status: "pendiente" | "confirmado" | "rechazado";
}

export function useAccountOrders() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [points, setPoints] = useState(0);
  const [pointsRedeemedTotal, setPointsRedeemedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Cambiar este número fuerza al useEffect a reintentar el fetch.
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(false);
    fetch("/api/mi-cuenta/orders", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders ?? []);
        setPoints(data.points ?? 0);
        setPointsRedeemedTotal(data.pointsRedeemedTotal ?? 0);
      })
      .catch(() => {
        // Sin este catch, una falla de red dejaba "orders" en null para
        // siempre y las páginas de /mi-cuenta se quedaban en blanco sin
        // avisar nada ni ofrecer reintentar.
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [session, retryCount]);

  return { orders, points, pointsRedeemedTotal, loading, error, retry: () => setRetryCount((n) => n + 1) };
}
