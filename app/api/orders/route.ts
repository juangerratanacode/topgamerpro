import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { sendOrderStatusEmail, sendAdminNewOrderNotification } from "@/lib/orderEmail";
import { sendTelegramOrderNotification } from "@/lib/telegramNotify";
import { getNetPointsBalance, maxRedeemablePoints, pointsToUsd, POINTS_REDEMPTION_STEP } from "@/lib/loyalty";
import { verifyTurnstileToken } from "@/lib/verifyTurnstile";
import type { CartItem, CustomerInfo, Currency, PaymentMethodId } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CreateOrderBody {
  customer: CustomerInfo;
  items: CartItem[];
  currency: Currency;
  payment: { method: PaymentMethodId; reference: string; receiptDataUrl?: string | null };
  totalUsd: number;
  totalConverted?: number;
  pointsRedeemed?: number;
  turnstileToken?: string;
}

// Crea un pedido nuevo: sube el comprobante (si vino) a Storage y guarda
// la orden + sus líneas en Supabase.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const body = (await req.json()) as CreateOrderBody;
  const { customer, items, currency, payment, totalUsd, totalConverted } = body;

  // Si el cliente tiene sesión iniciada, el front manda el access token en
  // el header Authorization — lo verificamos acá (nunca confiamos en un
  // user_id que venga en el body) para vincular el pedido a su cuenta y
  // que sume puntos e historial en /mi-cuenta. Si no hay token, o no es
  // válido, el pedido sigue como invitado (user_id null) sin romper el
  // checkout.
  let userId: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data } = await supabaseAdmin.auth.getUser(token);
    userId = data.user?.id ?? null;
  }

  // Anti-abuso: a un cliente con sesión no se le vuelve a pedir Turnstile
  // (ya lo resolvió una vez al crear la cuenta) — solo a invitados, que son
  // los que podrían spamear /api/orders sin fricción alguna.
  if (!userId && process.env.TURNSTILE_SECRET_KEY) {
    const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const verification = await verifyTurnstileToken(body.turnstileToken, remoteIp);
    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }
  }

  // Canje de puntos: nunca se confía en el descuento que calculó el
  // navegador. `totalUsd`/`totalConverted` que llegan en el body son el
  // SUBTOTAL sin descontar — acá se recalcula el balance real del usuario
  // (mismo cálculo que /api/mi-cuenta/orders) y se valida que el canje
  // pedido sea legítimo antes de restar nada. Sin sesión, o sin puntos
  // pedidos, no hay descuento.
  const requestedPoints = body.pointsRedeemed ?? 0;
  let pointsRedeemed = 0;
  if (requestedPoints > 0) {
    if (!userId) {
      return NextResponse.json(
        { error: "Necesitas iniciar sesión para usar puntos." },
        { status: 401 }
      );
    }
    if (requestedPoints % POINTS_REDEMPTION_STEP !== 0) {
      return NextResponse.json(
        { error: `Los puntos se canjean en múltiplos de ${POINTS_REDEMPTION_STEP}.` },
        { status: 400 }
      );
    }
    const balance = await getNetPointsBalance(supabaseAdmin, userId);
    const maxAllowed = maxRedeemablePoints(totalUsd, balance.net);
    if (requestedPoints > maxAllowed) {
      return NextResponse.json(
        { error: "No tienes suficientes puntos disponibles para ese descuento." },
        { status: 400 }
      );
    }
    pointsRedeemed = requestedPoints;
  }

  const discountUsd = pointsToUsd(pointsRedeemed);
  const finalTotalUsd = Math.max(0, totalUsd - discountUsd);
  const discountRatio = totalUsd > 0 ? finalTotalUsd / totalUsd : 1;
  const finalTotalConverted =
    totalConverted != null ? totalConverted * discountRatio : undefined;

  let receiptUrl: string | null = null;
  if (payment.receiptDataUrl) {
    const match = payment.receiptDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (match) {
      const [, mime, base64] = match;
      const ext = mime.split("/")[1] || "png";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buffer = Buffer.from(base64, "base64");
      const { error: uploadError } = await supabaseAdmin.storage
        .from("receipts")
        .upload(path, buffer, { contentType: mime, upsert: false, cacheControl: "31536000" });
      if (!uploadError) {
        const { data: publicUrl } = supabaseAdmin.storage.from("receipts").getPublicUrl(path);
        receiptUrl = publicUrl.publicUrl;
      }
    }
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_email: customer.email,
      customer_phone: customer.phone,
      user_id: userId,
      currency,
      payment_method: payment.method,
      payment_reference: payment.reference,
      receipt_url: receiptUrl,
      status: "pendiente",
      total_usd: finalTotalUsd,
      total_converted: finalTotalConverted ?? null,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Error creando la orden" }, { status: 500 });
  }

  const itemRows = items.map((item) => ({
    order_id: order.id,
    product_id: /^[0-9a-f-]{36}$/i.test(item.productId) ? item.productId : null,
    product_slug: item.productSlug,
    product_name: item.productName,
    variation_id: /^[0-9a-f-]{36}$/i.test(item.variationId) ? item.variationId : null,
    variation_label: item.variationLabel,
    unit_price_usd: item.unitPriceUsd,
    unit_price_usd_paypal: item.unitPriceUsdPaypal ?? null,
    quantity: item.quantity,
    game_fields: item.gameFields,
    reloadly_product_id: item.reloadlyProductId ?? null,
  }));

  if (itemRows.length > 0) {
    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(itemRows);
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
  }

  // El canje se registra recién ACÁ, con la orden ya creada — si algo
  // falla antes de este punto, no queremos puntos gastados sin un pedido
  // real detrás. Un fallo acá tampoco debe romper la respuesta del
  // checkout: en el peor caso el cliente obtuvo el descuento sin que
  // quede el registro, algo a revisar manualmente, pero no bloquear la venta.
  if (userId && pointsRedeemed > 0) {
    const { error: redemptionError } = await supabaseAdmin.from("loyalty_redemptions").insert({
      user_id: userId,
      points_used: pointsRedeemed,
      usd_value: discountUsd,
      order_id: order.id,
    });
    if (redemptionError) {
      console.error("Error registrando el canje de puntos:", redemptionError);
    }
  }

  // El pedido ya quedó guardado — el correo es un extra sobre la
  // confirmación por WhatsApp, así que un fallo acá no debe tumbar la
  // respuesta ni hacer que el cliente vea un error de checkout.
  const emailParams = {
    customer,
    items,
    method: payment.method,
    orderId: order.id,
    totalUsd: finalTotalUsd,
    currency,
    totalConverted: finalTotalConverted ?? finalTotalUsd,
    createdAt: new Date(order.created_at ?? Date.now()),
  };
  await sendOrderStatusEmail("recibido", emailParams);
  await sendAdminNewOrderNotification(emailParams);
  await sendTelegramOrderNotification({
    customer,
    items,
    method: payment.method,
    reference: payment.reference,
    orderId: order.id,
    totalUsd: finalTotalUsd,
    currency,
    totalConverted: finalTotalConverted ?? finalTotalUsd,
    receiptUrl,
  });

  return NextResponse.json({ orderId: order.id, status: order.status });
}

// Lista de pedidos para el panel admin (con sus líneas).
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = (data ?? []).map((o: any) => ({
    id: o.id,
    createdAt: o.created_at,
    customer: {
      firstName: o.customer_first_name,
      lastName: o.customer_last_name,
      email: o.customer_email,
      phone: o.customer_phone,
    },
    items: (o.order_items ?? []).map((it: any) => ({
      cartItemId: it.id,
      productId: it.product_id,
      productSlug: it.product_slug,
      productName: it.product_name,
      variationId: it.variation_id,
      variationLabel: it.variation_label,
      unitPriceUsd: Number(it.unit_price_usd),
      unitPriceUsdPaypal: it.unit_price_usd_paypal != null ? Number(it.unit_price_usd_paypal) : undefined,
      quantity: it.quantity,
      gameFields: it.game_fields ?? [],
      reloadlyProductId: it.reloadly_product_id,
    })),
    currency: o.currency,
    payment: {
      method: o.payment_method,
      reference: o.payment_reference,
      receiptDataUrl: o.receipt_url,
    },
    totalUsd: Number(o.total_usd),
    status: o.status,
  }));

  return NextResponse.json({ orders });
}

// Cambiar el estado de un pedido (confirmar / rechazar / volver a pendiente).
// Al confirmar o rechazar, le avisamos al cliente por correo — igual que la
// confirmación de recepción, un fallo acá nunca debe romper el cambio de
// estado en sí.
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { id, status } = (await req.json()) as { id: string; status: string };
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Si el pedido se rechaza, cualquier canje de puntos que se le haya
  // aplicado se revierte automáticamente — el cliente nunca debería perder
  // puntos por un pago que no se confirmó. Como el balance se calcula
  // siempre como (ganados - canjeados), borrar la fila alcanza para
  // devolvérselos, sin tocar ninguna columna de "balance" directa.
  if (order && status === "rechazado") {
    const { error: refundError } = await supabaseAdmin
      .from("loyalty_redemptions")
      .delete()
      .eq("order_id", order.id);
    if (refundError) {
      console.error("Error devolviendo puntos de un pedido rechazado:", refundError);
    }
  }

  if (order && (status === "confirmado" || status === "rechazado")) {
    const customer: CustomerInfo = {
      firstName: order.customer_first_name,
      lastName: order.customer_last_name,
      email: order.customer_email,
      phone: order.customer_phone,
    };
    const items: CartItem[] = (order.order_items ?? []).map((it: any) => ({
      cartItemId: it.id,
      productId: it.product_id,
      productSlug: it.product_slug,
      productName: it.product_name,
      variationId: it.variation_id,
      variationLabel: it.variation_label,
      unitPriceUsd: Number(it.unit_price_usd),
      unitPriceUsdPaypal: it.unit_price_usd_paypal != null ? Number(it.unit_price_usd_paypal) : undefined,
      quantity: it.quantity,
      gameFields: it.game_fields ?? [],
      reloadlyProductId: it.reloadly_product_id,
    }));

    await sendOrderStatusEmail(status === "confirmado" ? "confirmado" : "cancelado", {
      customer,
      items,
      method: order.payment_method,
      orderId: order.id,
      totalUsd: Number(order.total_usd),
      currency: order.currency,
      totalConverted: order.total_converted != null ? Number(order.total_converted) : Number(order.total_usd),
      createdAt: new Date(order.created_at),
    });
  }

  return NextResponse.json({ ok: true });
}
