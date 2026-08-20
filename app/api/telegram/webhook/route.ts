// Webhook que Telegram llama cuando el admin toca "Confirmar pedido" o
// "Rechazar" en la notificación (ver lib/telegramNotify.ts). No usa
// requireAdmin (no hay sesión de navegador acá) — en su lugar valida el
// secret_token que Telegram manda de vuelta, configurado una sola vez con
// setWebhook.

import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

const STATUS_BY_ACTION: Record<string, string> = {
  confirm: "confirmado",
  reject: "rechazado",
};

const RESULT_LABEL: Record<string, string> = {
  confirmado: "✅ Confirmado",
  rechazado: "❌ Rechazado",
};

async function telegramCall(token: string, method: string, body: unknown) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !webhookSecret) {
    return NextResponse.json({ error: "Telegram no configurado" }, { status: 500 });
  }

  const receivedSecret = req.headers.get("x-telegram-bot-api-secret-token");
  if (receivedSecret !== webhookSecret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  const callback = update?.callback_query;
  if (!callback?.data) {
    // Otro tipo de update (mensaje normal, etc.) — no hay nada que hacer,
    // pero hay que responder 200 o Telegram reintenta indefinidamente.
    return NextResponse.json({ ok: true });
  }

  if (callback.data === "noop") {
    await telegramCall(token, "answerCallbackQuery", { callback_query_id: callback.id });
    return NextResponse.json({ ok: true });
  }

  const [action, orderId] = String(callback.data).split(":");
  const status = STATUS_BY_ACTION[action];
  const message = callback.message;

  if (!status || !orderId || !message) {
    await telegramCall(token, "answerCallbackQuery", { callback_query_id: callback.id, text: "Botón inválido" });
    return NextResponse.json({ ok: true });
  }

  const result = await updateOrderStatus(orderId, status);

  if (!result.ok) {
    await telegramCall(token, "answerCallbackQuery", {
      callback_query_id: callback.id,
      text: `Error: ${result.error}`,
      show_alert: true,
    });
    return NextResponse.json({ ok: true });
  }

  await telegramCall(token, "answerCallbackQuery", {
    callback_query_id: callback.id,
    text: RESULT_LABEL[status],
  });

  // Reemplaza los botones por el resultado, para que quede a la vista que
  // ya se resolvió y no se pueda tocar dos veces.
  const editBody = {
    chat_id: message.chat.id,
    message_id: message.message_id,
    reply_markup: { inline_keyboard: [[{ text: RESULT_LABEL[status], callback_data: "noop" }]] },
  };
  await telegramCall(token, "editMessageReplyMarkup", editBody);

  return NextResponse.json({ ok: true });
}
