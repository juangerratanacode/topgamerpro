// Aviso al dueño del negocio por Telegram cada vez que entra un pedido
// nuevo — llega como notificación push incluso con el teléfono bloqueado,
// sin depender de abrir ninguna app de correo. SOLO se importa desde
// app/api/orders/route.ts (server) — el bot token es secreto.

import { getItemPriceForMethod } from "./pricing";
import { PAYMENT_METHOD_NAMES } from "./whatsapp";
import type { CartItem, CustomerInfo, Currency, PaymentMethodId } from "./types";

const CURRENCY_FORMAT: Record<Currency, { symbol: string; decimals: number }> = {
  USD: { symbol: "$", decimals: 2 },
  VES: { symbol: "Bs. ", decimals: 0 },
  PAYPAL: { symbol: "$", decimals: 2 },
};

interface TelegramOrderParams {
  customer: CustomerInfo;
  items: CartItem[];
  method: PaymentMethodId;
  reference: string;
  orderId: string;
  totalUsd: number;
  currency: Currency;
  totalConverted: number;
  receiptUrl?: string | null;
}

// Texto plano, sin parse_mode: el MarkdownV2 de Telegram exige escapar a
// mano casi todos los signos de puntuación (incluido el "." de cualquier
// monto formateado), y un solo carácter sin escapar tumba el envío entero
// con un 400 — pasó exactamente eso en la primera versión ("Bs. 4.410"
// rompía el parseo). Sin parse_mode no hay nada que escapar ni que pueda
// romperse por un monto, una referencia o un nombre con puntuación.
function buildMessage(params: TelegramOrderParams): string {
  const { customer, items, method, reference, orderId, totalUsd, currency, totalConverted } = params;
  const { symbol, decimals } = CURRENCY_FORMAT[currency] ?? CURRENCY_FORMAT.USD;
  const totalLabel = `${symbol}${totalConverted.toLocaleString("es-VE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
  const methodLabel = PAYMENT_METHOD_NAMES[method] ?? method;

  const itemsText = items
    .map((item) => {
      const lineUsd = getItemPriceForMethod(item, method) * item.quantity;
      const fieldsText = item.gameFields
        .map((f) => `      ${f.label}: ${f.value || "—"}`)
        .join("\n");
      return (
        `  • ${item.quantity}x ${item.productName} — ${item.variationLabel} ($${lineUsd.toFixed(2)})` +
        (fieldsText ? "\n" + fieldsText : "")
      );
    })
    .join("\n");

  return (
    `🛒 Nuevo pedido registrado\n\n` +
    `Cliente: ${customer.firstName} ${customer.lastName}\n` +
    `Teléfono: ${customer.phone}\n` +
    `Correo: ${customer.email}\n\n` +
    `Pedido:\n${itemsText}\n\n` +
    `Monto: ${totalLabel}\n` +
    `Pago: ${methodLabel}${reference ? ` · Ref: ${reference}` : ""}\n\n` +
    `#${orderId.slice(0, 8).toUpperCase()}`
  );
}

// Nunca debe romper la creación del pedido: un fallo acá solo se registra
// en consola, igual que el correo de Resend.
export async function sendTelegramOrderNotification(params: TelegramOrderParams): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados — se omite el aviso de Telegram.");
    return;
  }

  const text = buildMessage(params);
  // callback_data tiene un límite de 64 bytes en la API de Telegram — el
  // id completo (36 caracteres) entra bien con el prefijo.
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "✅ Confirmar pedido", callback_data: `confirm:${params.orderId}` },
        { text: "❌ Rechazar", callback_data: `reject:${params.orderId}` },
      ],
    ],
  };

  try {
    // Si hay foto de comprobante, se manda como sendPhoto con el resumen de
    // caption — así se ve todo (datos + comprobante) en un solo mensaje sin
    // tener que abrir el panel de admin. Si no hay foto, va como texto.
    const endpoint = params.receiptUrl
      ? `https://api.telegram.org/bot${token}/sendPhoto`
      : `https://api.telegram.org/bot${token}/sendMessage`;
    const body = params.receiptUrl
      ? { chat_id: chatId, photo: params.receiptUrl, caption: text, reply_markup: replyMarkup }
      : { chat_id: chatId, text, reply_markup: replyMarkup };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("Telegram devolvió un error al enviar el aviso de pedido:", res.status, errBody);
    }
  } catch (err) {
    console.error("Error enviando el aviso de Telegram:", err);
  }
}
