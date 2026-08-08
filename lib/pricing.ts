import type { CartItem } from "./types";

// Fórmula de respaldo, extraída de comparar pitcharge.com vs
// paypal.pitcharge.com: precio_paypal = precio_base * 1.057 + 0.31
// (5.7% de comisión + $0.31 fijo). SOLO se usa si el paquete no tiene un
// precio de PayPal definido a mano en el admin — el precio manual siempre
// tiene prioridad, porque cada juego puede necesitar un margen distinto.
const PAYPAL_PERCENT_FEE = 0.057;
const PAYPAL_FIXED_FEE = 0.31;

export function getPaypalPrice(basePriceUsd: number): number {
  const price = basePriceUsd * (1 + PAYPAL_PERCENT_FEE) + PAYPAL_FIXED_FEE;
  return Math.round(price * 100) / 100;
}

export function getPriceForMethod(basePriceUsd: number, method: string): number {
  if (method === "paypal") return getPaypalPrice(basePriceUsd);
  return basePriceUsd;
}

// Precio unitario de un item del carrito para un método de pago dado.
// Para PayPal usa el precio manual guardado en el item si existe;
// si no, cae en la fórmula de respaldo.
export function getItemPriceForMethod(item: CartItem, method: string): number {
  if (method === "paypal") {
    return item.unitPriceUsdPaypal ?? getPaypalPrice(item.unitPriceUsd);
  }
  return item.unitPriceUsd;
}

export function getCartTotalForMethod(items: CartItem[], method: string): number {
  const total = items.reduce((sum, item) => sum + getItemPriceForMethod(item, method) * item.quantity, 0);
  return Math.round(total * 100) / 100;
}
