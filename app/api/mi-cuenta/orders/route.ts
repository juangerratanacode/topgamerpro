import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getNetPointsBalance } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Historial de pedidos + puntos del cliente que tiene la sesión iniciada.
// A diferencia del GET de /api/orders (que es para el admin y trae todo),
// este solo devuelve los pedidos del propio usuario autenticado.
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = (data ?? []).map((o: any) => ({
    id: o.id,
    createdAt: o.created_at,
    items: (o.order_items ?? []).map((it: any) => ({
      productName: it.product_name,
      variationLabel: it.variation_label,
      quantity: it.quantity,
      unitPriceUsd: Number(it.unit_price_usd),
    })),
    currency: o.currency,
    paymentMethod: o.payment_method,
    totalUsd: Number(o.total_usd),
    status: o.status,
  }));

  const balance = await getNetPointsBalance(supabaseAdmin, userData.user.id);

  return NextResponse.json({
    orders,
    points: balance.net,
    pointsRedeemedTotal: balance.redeemed,
  });
}
