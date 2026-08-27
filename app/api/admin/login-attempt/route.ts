// Registra un intento de login fallido en /staffgate7d3k/login — lo llama
// el cliente justo después de que supabase.auth.signInWithPassword()
// devuelve error. Un intento exitoso NUNCA se registra acá, así que el
// conteo de login-guard es siempre "fallos recientes", no logins totales.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ ok: true });

  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email) return NextResponse.json({ error: "Falta el correo" }, { status: 400 });

  await supabaseAdmin.from("admin_login_attempts").insert({ email: email.trim().toLowerCase() });
  return NextResponse.json({ ok: true });
}
