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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);
    fetch("/api/mi-cuenta/orders", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setPoints(data.points ?? 0);
      })
      .finally(() => setLoading(false));
  }, [session]);

  return { orders, points, loading };
}
