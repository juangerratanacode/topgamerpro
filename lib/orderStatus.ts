// Lógica compartida para cambiar el estado de un pedido (confirmar/
// rechazar/pendiente) + sus efectos secundarios (reembolso de puntos,
// correo al cliente). La usan tanto el PATCH de /api/orders (panel admin,
// con sesión) como el webhook de Telegram (botones del mensaje, sin
// sesión de navegador) — un solo lugar para no duplicar ni desincronizar
// esta lógica entre los dos caminos.

import { supabaseAdmin } from "./supabaseAdmin";
import { sendOrderStatusEmail } from "./orderEmail";
import type { CartItem, CustomerInfo } from "./types";

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabaseAdmin) return { ok: false, error: "Supabase no configurado" };

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (error) return { ok: false, error: error.message };

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

  return { ok: true };
}
