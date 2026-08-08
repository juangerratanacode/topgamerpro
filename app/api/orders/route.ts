import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import type { CartItem, CustomerInfo, Currency, PaymentMethodId } from "@/lib/types";

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
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { id, status } = (await req.json()) as { id: string; status: string };
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
