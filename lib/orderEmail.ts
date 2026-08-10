// Envío de correos de pedido (recibido / confirmado / cancelado) vía
// Resend. SOLO se importa desde app/api/orders/route.ts (server). No poner
// "use client" en ningún archivo que importe esto — el SDK de Resend usa
// la API key secreta y no debe llegar nunca al bundle del navegador.

import { Resend } from "resend";
import { getItemPriceForMethod } from "./pricing";
import { PAYMENT_METHOD_NAMES } from "./whatsapp";
import type { CartItem, CustomerInfo, Currency, PaymentMethodId } from "./types";

// Mismo símbolo/decimales que lib/currencyStore.tsx (CURRENCY_META), pero
// ese archivo es "use client" y este es server-only, así que van copiados
// acá en vez de compartir el import.
const CURRENCY_FORMAT: Record<Currency, { symbol: string; decimals: number }> = {
  USD: { symbol: "$", decimals: 2 },
  VES: { symbol: "Bs. ", decimals: 0 },
  PAYPAL: { symbol: "$", decimals: 2 },
};

const CARACAS_TZ = "America/Caracas";

const BRAND_PRIMARY = "#0EA5E9";
const BRAND_ACCENT = "#F5B942";
const BRAND_GREEN = "#34D399";
const BRAND_RED = "#EF4444";

export type OrderEmailStatus = "recibido" | "confirmado" | "cancelado";

const SOPORTE_URL = "https://www.topgamerpro.com/soporte";
const SOPORTE_LINK = `<a href="${SOPORTE_URL}" style="color:${BRAND_PRIMARY};text-decoration:underline;">soporte</a>`;

// footerHtml es HTML crudo (no pasa por escapeHtml) porque necesita el link
// de soporte — son textos fijos que escribimos nosotros, no algo que venga
// del cliente, así que no hay riesgo de inyección.
const STATUS_COPY: Record<
  OrderEmailStatus,
  { subject: string; heading: string; intro: string; footerHtml: string; accent: string }
> = {
  recibido: {
    subject: "Recibimos tu pedido",
    heading: "¡Recibimos tu pedido!",
    intro: "Confirmamos que recibimos tu pedido. Aquí tienes el detalle:",
    footerHtml:
      "Tu pedido está pendiente de confirmación — te avisamos por WhatsApp apenas quede listo.",
    accent: BRAND_PRIMARY,
  },
  confirmado: {
    subject: "Tu pedido fue confirmado",
    heading: "¡Tu recarga está en camino!",
    intro: "Verificamos tu pago y ya estamos procesando tu recarga.",
    footerHtml: `Si no la recibes en los próximos minutos, escríbenos por ${SOPORTE_LINK}.`,
    accent: BRAND_GREEN,
  },
  cancelado: {
    subject: "Tu pedido fue cancelado",
    heading: "Tu pedido fue cancelado",
    intro: "No pudimos validar el pago de este pedido, así que quedó cancelado.",
    footerHtml: `Si crees que es un error, escríbenos por WhatsApp con tu comprobante y lo revisamos de nuevo.`,
    accent: BRAND_RED,
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface OrderEmailParams {
  customer: CustomerInfo;
  items: CartItem[];
  method: PaymentMethodId;
  orderId: string;
  totalUsd: number;
  currency: Currency;
  totalConverted: number;
  createdAt: Date;
}

function buildOrderEmailHtml(status: OrderEmailStatus, params: OrderEmailParams): string {
  const { customer, items, method, orderId, totalUsd, currency, totalConverted, createdAt } = params;
  const copy = STATUS_COPY[status];
  const methodLabel = PAYMENT_METHOD_NAMES[method] ?? method;
  const dateLabel = createdAt.toLocaleString("es-VE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: CARACAS_TZ,
  });

  // El total ya viene convertido a la moneda con la que pagó el cliente
  // (guardado en la orden al momento del checkout, porque la tasa de
  // cambio solo existe en el navegador y el servidor no la puede
  // reconstruir después). Cada línea se convierte con la misma proporción
  // para que las líneas sumen exactamente el total mostrado.
  const { symbol, decimals } = CURRENCY_FORMAT[currency] ?? CURRENCY_FORMAT.USD;
  const rate = totalUsd > 0 ? totalConverted / totalUsd : 1;
  const formatAmount = (usd: number) =>
    `${symbol}${(usd * rate).toLocaleString("es-VE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

  const itemsHtml = items
    .map((item) => {
      const lineTotalUsd = getItemPriceForMethod(item, method) * item.quantity;
      const fieldsHtml = item.gameFields
        .map(
          (f) =>
            `<div style="font-size:12px;color:#8CA3BF;padding-left:12px;">${escapeHtml(
              f.label
            )}: ${escapeHtml(f.value)}</div>`
        )
        .join("");
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1E2A44;">
            <div style="font-weight:600;color:#0B1220;">
              ${item.quantity} × ${escapeHtml(item.productName)} — ${escapeHtml(item.variationLabel)}
            </div>
            ${fieldsHtml}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1E2A44;text-align:right;font-weight:700;color:${BRAND_PRIMARY};white-space:nowrap;">
            ${formatAmount(lineTotalUsd)}
          </td>
        </tr>`;
    })
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f5f7;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:${BRAND_PRIMARY};padding:20px 24px;">
        <span style="color:#ffffff;font-size:18px;font-weight:800;">TopGamerPro</span>
      </div>

      <div style="padding:24px;">
        <h1 style="font-size:18px;margin:0 0 4px;color:${copy.accent};">
          ${escapeHtml(copy.heading)} ${status !== "cancelado" ? escapeHtml(customer.firstName) : ""}
        </h1>
        <p style="font-size:13px;color:#6b7280;margin:0 0 20px;">${escapeHtml(copy.intro)}</p>

        <table style="width:100%;border-collapse:collapse;background:#f4f5f7;border-radius:12px;margin-bottom:14px;">
          <tr>
            <td style="padding:12px 16px;vertical-align:top;">
              <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Orden</div>
              <div style="font-family:'Courier New',monospace;font-size:14px;font-weight:800;color:${BRAND_PRIMARY};letter-spacing:0.02em;">#${escapeHtml(
                orderId.slice(0, 8).toUpperCase()
              )}</div>
            </td>
            <td style="padding:12px 16px;text-align:right;vertical-align:top;">
              <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Fecha</div>
              <div style="font-size:13px;color:#0B1220;">${dateLabel}</div>
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Método de pago</td>
            <td style="padding:4px 0;text-align:right;color:#0B1220;">${escapeHtml(methodLabel)}</td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">
          ${itemsHtml}
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:15px;margin-top:16px;">
          <tr>
            <td style="padding:10px 0;font-weight:800;color:#0B1220;">Total</td>
            <td style="padding:10px 0;text-align:right;font-weight:800;font-size:18px;color:${BRAND_ACCENT};">
              ${formatAmount(totalUsd)}
            </td>
          </tr>
        </table>

        <p style="font-size:12px;color:#9ca3af;margin-top:24px;">${copy.footerHtml}</p>
      </div>
    </div>
  </div>`;
}

// Nunca debe romper la creación/actualización del pedido: si falla el
// envío (o falta la configuración de Resend), solo se registra en
// consola. El pedido ya se confirma también por WhatsApp, así que el
// correo es un plus, no un requisito para que la compra se complete.
export async function sendOrderStatusEmail(
  status: OrderEmailStatus,
  params: OrderEmailParams
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn(
      `RESEND_API_KEY o RESEND_FROM_EMAIL no configurados — se omite el correo de pedido ${status}.`
    );
    return;
  }

  if (!params.customer.email) return;

  try {
    const resend = new Resend(apiKey);
    const html = buildOrderEmailHtml(status, params);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: params.customer.email,
      subject: `${STATUS_COPY[status].subject} #${params.orderId.slice(0, 8).toUpperCase()} - TopGamerPro`,
      html,
    });
    if (error) {
      console.error(`Resend devolvió un error al enviar el correo de pedido ${status}:`, error);
    }
  } catch (err) {
    console.error(`Error enviando el correo de pedido ${status}:`, err);
  }
}
