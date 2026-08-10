// Envío del correo de confirmación de pedido vía Resend. SOLO se importa
// desde app/api/orders/route.ts (server). No poner "use client" en ningún
// archivo que importe esto — el SDK de Resend usa la API key secreta y no
// debe llegar nunca al bundle del navegador.

import { Resend } from "resend";
import { getItemPriceForMethod } from "./pricing";
import { PAYMENT_METHOD_NAMES } from "./whatsapp";
import type { CartItem, CustomerInfo, PaymentMethodId } from "./types";

const BRAND_PRIMARY = "#0EA5E9";
const BRAND_ACCENT = "#F5B942";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

function buildOrderEmailHtml(params: {
  customer: CustomerInfo;
  items: CartItem[];
  method: PaymentMethodId;
  orderId: string;
  totalUsd: number;
  createdAt: Date;
}): string {
  const { customer, items, method, orderId, totalUsd, createdAt } = params;
  const methodLabel = PAYMENT_METHOD_NAMES[method] ?? method;
  const dateLabel = createdAt.toLocaleString("es-VE", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const itemsHtml = items
    .map((item) => {
      const lineTotal = getItemPriceForMethod(item, method) * item.quantity;
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
            ${formatUsd(lineTotal)}
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
        <h1 style="font-size:18px;margin:0 0 4px;color:#0B1220;">¡Gracias por tu compra, ${escapeHtml(
          customer.firstName
        )}!</h1>
        <p style="font-size:13px;color:#6b7280;margin:0 0 20px;">
          Confirmamos que recibimos tu pedido. Aquí tienes el detalle:
        </p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Orden</td>
            <td style="padding:4px 0;text-align:right;font-weight:700;color:#0B1220;">#${escapeHtml(
              orderId
            )}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;">Fecha</td>
            <td style="padding:4px 0;text-align:right;color:#0B1220;">${dateLabel}</td>
          </tr>
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
              ${formatUsd(totalUsd)}
            </td>
          </tr>
        </table>

        <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
          Tu pedido está pendiente de confirmación — te avisamos por WhatsApp apenas quede listo.
          Si tienes alguna duda, respóndenos por WhatsApp o desde /soporte.
        </p>
      </div>
    </div>
  </div>`;
}

// Nunca debe romper la creación del pedido: si falla el envío (o falta la
// configuración de Resend), solo se registra en consola. El pedido ya se
// confirma también por WhatsApp, así que el correo es un plus, no un
// requisito para que la compra se complete.
export async function sendOrderConfirmationEmail(params: {
  customer: CustomerInfo;
  items: CartItem[];
  method: PaymentMethodId;
  orderId: string;
  totalUsd: number;
  createdAt: Date;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn(
      "RESEND_API_KEY o RESEND_FROM_EMAIL no configurados — se omite el correo de confirmación del pedido."
    );
    return;
  }

  if (!params.customer.email) {
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const html = buildOrderEmailHtml(params);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: params.customer.email,
      subject: `Confirmación de tu pedido #${params.orderId} - TopGamerPro`,
      html,
    });
    if (error) {
      console.error("Resend devolvió un error al enviar el correo de confirmación:", error);
    }
  } catch (err) {
    console.error("Error enviando el correo de confirmación del pedido:", err);
  }
}
