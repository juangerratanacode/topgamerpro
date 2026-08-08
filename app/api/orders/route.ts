import { NextRequest, NextResponse } from "next/server";

// PLACEHOLDER — todavía no hay base de datos conectada.
// Cuando exista Supabase, esto va a:
//   1. Subir el comprobante a Supabase Storage
//   2. Insertar la orden en la tabla `orders`
//   3. Si el producto es de Reloadly, disparar la compra automática
//      (ver lib/reloadly.ts) cuando el estado pase a "completed"
//
// Por ahora solo genera un ID temporal para que el flujo de checkout
// funcione de punta a punta en el navegador.

export async function POST(req: NextRequest) {
  const body = await req.json();

  // TODO: reemplazar por inserción real en Supabase
  const orderId = `TEMP-${Date.now()}`;

  console.log("[orders API - placeholder] Nueva orden recibida:", {
    orderId,
    customer: body.customer,
    itemCount: body.items?.length,
    currency: body.currency,
    method: body.payment?.method,
  });

  return NextResponse.json({ orderId, status: "on-hold" });
}
