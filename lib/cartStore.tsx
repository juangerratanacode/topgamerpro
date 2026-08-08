"use client";

// Carrito simple en el cliente con Context + localStorage.
// (Esto SÍ puede usar localStorage porque es una app real desplegada
// en Vercel, no un artifact de Claude — ahí la restricción no aplica.)

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { CartItem } from "./types";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  totalUsd: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "pitanga_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        // ignore corrupt storage
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "cartItemId">) {
    const cartItemId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { ...item, cartItemId }]);
  }

  function removeItem(cartItemId: string) {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalUsd = items.reduce((sum, i) => sum + i.unitPriceUsd * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalUsd }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
