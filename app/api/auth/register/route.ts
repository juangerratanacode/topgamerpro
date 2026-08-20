import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyTurnstileToken } from "@/lib/verifyTurnstile";

export const dynamic = "force-dynamic";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  turnstileToken: string;
}

// El registro de cuenta se movió acá (antes lib/authStore.tsx llamaba
// supabase.auth.signUp() directo desde el navegador) específicamente para
// poder verificar Turnstile del lado servidor ANTES de crear el usuario —
// eso no se puede hacer si el signUp se dispara directo desde el cliente.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const body = (await req.json()) as RegisterBody;
  const { name, email, password, turnstileToken } = body;

  if (!email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Completa todos los campos." }, { status: 400 });
  }

  const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const verification = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!verification.success) {
    return NextResponse.json({ error: verification.error }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? undefined;

  const { error } = await supabaseAdmin.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: name.trim() },
      emailRedirectTo: origin ? `${origin}/mi-cuenta` : undefined,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
