// Link corto y con marca propia para comprobantes de pago: redirige a la
// URL pública real en Supabase Storage. Existe solo para que el mensaje de
// WhatsApp muestre "topgamerpro.com/..." en vez de exponer el dominio
// técnico de Supabase ("cmfsiutponuahgjfctco.supabase.co") delante del
// cliente.

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const target = `${supabaseUrl}/storage/v1/object/public/receipts/${encodeURIComponent(params.filename)}`;
  return NextResponse.redirect(target);
}
