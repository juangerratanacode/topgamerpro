import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export interface PaymentSettings {
  pagoMovil: { banco: string; telefono: string; cedula: string };
  paypal: { correo: string; paypalMeUser: string };
  binance: { correoOId: string; nombre: string };
}

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { data, error } = await supabaseAdmin.from("payment_settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: PaymentSettings = {
    pagoMovil: data.pago_movil,
    paypal: data.paypal,
    // El registro puede traer la forma vieja ({ cuenta }) de antes de que
    // se agregaran estos campos — normalizamos acá para que nunca lleguen
    // "undefined" al checkout si el admin todavía no guardó nada nuevo.
    binance: {
      correoOId: data.binance?.correoOId ?? "",
      nombre: data.binance?.nombre ?? "",
    },
  };

  // Antes la tasa VES vivía solo en localStorage del navegador de quien la
  // configuraba — cada visitante veía un valor distinto (el default
  // hardcodeado en el código) según si había pasado por el admin o no.
  // Ahora es una fila más de esta misma tabla, así que un solo valor rige
  // para todo el mundo.
  const exchangeRates: Record<string, number> = data.exchange_rates ?? { VES: 130 };

  return NextResponse.json({ settings, exchangeRates });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { settings, exchangeRates } = (await req.json()) as {
    settings?: PaymentSettings;
    exchangeRates?: Record<string, number>;
  };
  if (!settings && !exchangeRates) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (settings) {
    patch.pago_movil = settings.pagoMovil;
    patch.paypal = settings.paypal;
    patch.binance = settings.binance;
  }
  if (exchangeRates) {
    patch.exchange_rates = exchangeRates;
  }

  const { error } = await supabaseAdmin.from("payment_settings").update(patch).eq("id", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
