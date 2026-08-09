import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export interface PaymentSettings {
  pagoMovil: { banco: string; telefono: string; cedula: string };
  paypal: { correo: string; paypalMeUser: string };
}

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { data, error } = await supabaseAdmin.from("payment_settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: PaymentSettings = {
    pagoMovil: data.pago_movil,
    paypal: data.paypal,
  };

  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { settings } = (await req.json()) as { settings: PaymentSettings };
  if (!settings) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("payment_settings")
    .update({
      pago_movil: settings.pagoMovil,
      paypal: settings.paypal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
