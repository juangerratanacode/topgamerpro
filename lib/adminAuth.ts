// Valida que una request a una API route de admin venga con una sesión
// real de Supabase Auth (token enviado como "Authorization: Bearer <token>"
// desde el navegador, ver lib/adminFetch.ts) Y que esa sesión sea de un
// correo admin real — antes solo se chequeaba "¿es una sesión válida?",
// lo que dejaba pasar a CUALQUIER cliente que se registrara una cuenta
// normal en la web (el registro es público, solo protegido por Turnstile).
// Con eso alcanzaba para llamar directo a /api/admin/* y reescribir el
// catálogo, los datos de pago móvil/PayPal/Binance del checkout, o ver el
// correo/teléfono de todos los clientes.
import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin(req: NextRequest): Promise<{ ok: true } | { ok: false; status: number }> {
  if (!supabaseAdmin) return { ok: false, status: 500 };
  if (ADMIN_EMAILS.length === 0) return { ok: false, status: 500 };

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { ok: false, status: 401 };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.email) return { ok: false, status: 401 };
  if (!ADMIN_EMAILS.includes(data.user.email.toLowerCase())) return { ok: false, status: 403 };

  return { ok: true };
}
