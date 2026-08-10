import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { sendOrderStatusEmail } from "@/lib/orderEmail";
import type { CartItem, CustomerInfo, Currency, PaymentMethodId } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CreateOrderBody {
  customer: CustomerInfo;
  items: CartItem[];
  currency: Currency;
  payment: { method: PaymentMethodId; reference: string; receiptDataUrl?: string | null };
  totalUsd: number;
}

// Crea un pedido nuevo: sube el comprobante (si vino) a Storage y guarda
// la orden + sus líneas en Supabase.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const body = (await req.json()) as CreateOrderBody;
  const { customer, items, currency, payment, totalUsd } = body;

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
        .upload(path, buffer, { contentType: mime, upsert: false });
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
      total_usd: totalUsd,
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

  // El pedido ya quedó guardado — el correo es un extra sobre la
  // confirmación por WhatsApp, así que un fallo acá no debe tumbar la
  // respuesta ni hacer que el cliente vea un error de checkout.
  await sendOrderStatusEmail("recibido", {
    customer,
    items,
    method: payment.method,
    orderId: order.id,
    totalUsd,
    createdAt: new Date(order.created_at ?? Date.now()),
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
      createdAt: new Date(order.created_at),
    });
  }

  return NextResponse.json({ ok: true });
}
