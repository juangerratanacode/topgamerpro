// Protección contra fuerza bruta en /staffgate7d3k/login. El login en sí
// sigue siendo supabase.auth.signInWithPassword() del lado del cliente
// (necesario para que la sesión quede en el navegador) — este endpoint es
// un chequeo previo: antes de intentar, el cliente pregunta acá si ese
// correo ya gastó sus intentos fallidos recientes.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ blocked: false });

  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email) return NextResponse.json({ error: "Falta el correo" }, { status: 400 });

  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", email.trim().toLowerCase())
    .gte("created_at", since);

  if (error) return NextResponse.json({ blocked: false });

  const blocked = (count ?? 0) >= MAX_ATTEMPTS;
  return NextResponse.json({ blocked, maxAttempts: MAX_ATTEMPTS, windowMinutes: WINDOW_MINUTES });
}
