import { WHATSAPP_NUMBER } from "./constants";
import { getItemPriceForMethod } from "./pricing";
import type { CartItem, CustomerInfo, OrderPaymentDetails } from "./types";

export const PAYMENT_METHOD_NAMES: Record<string, string> = {
  pago_movil_manual: "Pago Móvil",
  paypal: "PayPal",
  binance: "Binance",
};

// Puerto directo de la función enviarWhatsApp() del snippet
// "Envia de comando bs-usdt-pesos whatsapp" (WooCommerce WhatsApp Comprobante 3.4).
// Incluye precio por línea y total en la moneda elegida — antes se perdía
// esa info y el mensaje solo mostraba los productos sin montos.
export function buildWhatsAppMessage(
  customer: CustomerInfo,
  payment: OrderPaymentDetails,
  items: CartItem[],
  orderId: string,
  totals: { formatPrice: (usd: number) => string; formattedTotal: string },
  redemption?: { points: number; discountLabel: string }
): string {
  const lines: string[] = [];
  lines.push("¡Hola! Quiero realizar un pedido:");
  lines.push(`Orden: #${orderId}`);
  lines.push(`Cliente: ${customer.firstName} ${customer.lastName}`);
  lines.push(`Correo: ${customer.email}`);
  lines.push(`WhatsApp: ${customer.phone}`);
  lines.push(`Método: ${PAYMENT_METHOD_NAMES[payment.method] ?? payment.method}`);
  lines.push(`Referencia: ${payment.reference}`);
  lines.push(`Comprobante: ${payment.receiptUrl}`);
  lines.push("");

  for (const item of items) {
    const lineTotalUsd = getItemPriceForMethod(item, payment.method) * item.quantity;
    lines.push(
      `${item.quantity} x ${item.productName} - ${item.variationLabel} — ${totals.formatPrice(lineTotalUsd)}`
    );
    for (const field of item.gameFields) {
      lines.push(`  ${field.label}: ${field.value}`);
    }
    lines.push("");
  }

  if (redemption && redemption.points > 0) {
    lines.push(`Puntos usados: ${redemption.points.toLocaleString("es-VE")} (-${redemption.discountLabel})`);
  }
  lines.push(`Total: ${totals.formattedTotal}`);

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace("+", "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
