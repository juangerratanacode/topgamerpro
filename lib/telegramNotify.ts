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

// Telegram usa Markdown propio (no el estándar) — caracteres como _ * [ ] ()
// tienen significado especial y rompen el formato si vienen en un nombre o
// referencia sin escapar.
function escapeMarkdown(value: string): string {
  return value.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

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
        .map((f) => `      _${escapeMarkdown(f.label)}:_ ${escapeMarkdown(f.value || "—")}`)
        .join("\n");
      return (
        `  • ${item.quantity}× *${escapeMarkdown(item.productName)}* — ${escapeMarkdown(item.variationLabel)} ` +
        `\\($${lineUsd.toFixed(2)}\\)` +
        (fieldsText ? "\n" + fieldsText : "")
      );
    })
    .join("\n");

  return (
    `🛒 *Nuevo pedido registrado*\n\n` +
    `*Cliente:* ${escapeMarkdown(customer.firstName)} ${escapeMarkdown(customer.lastName)}\n` +
    `*Teléfono:* ${escapeMarkdown(customer.phone)}\n` +
    `*Correo:* ${escapeMarkdown(customer.email)}\n\n` +
    `*Pedido:*\n${itemsText}\n\n` +
    `*Monto:* ${totalLabel}\n` +
    `*Pago:* ${escapeMarkdown(methodLabel)}${reference ? ` · Ref: ${escapeMarkdown(reference)}` : ""}\n\n` +
    `#${escapeMarkdown(orderId.slice(0, 8).toUpperCase())}`
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

  try {
    // Si hay foto de comprobante, se manda como sendPhoto con el resumen de
    // caption — así se ve todo (datos + comprobante) en un solo mensaje sin
    // tener que abrir el panel de admin. Si no hay foto, va como texto.
    const endpoint = params.receiptUrl
      ? `https://api.telegram.org/bot${token}/sendPhoto`
      : `https://api.telegram.org/bot${token}/sendMessage`;
    const body = params.receiptUrl
      ? { chat_id: chatId, photo: params.receiptUrl, caption: text, parse_mode: "MarkdownV2" }
      : { chat_id: chatId, text, parse_mode: "MarkdownV2" };

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
