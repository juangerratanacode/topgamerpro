// Valida que una request a una API route de admin venga con una sesión
// real de Supabase Auth (token enviado como "Authorization: Bearer <token>"
// desde el navegador, ver lib/adminFetch.ts). Sin esto, cualquiera podía
// llamar directo a /api/admin/* y reescribir el catálogo/banners/pagos.

import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";

export async function requireAdmin(req: NextRequest): Promise<{ ok: true } | { ok: false; status: number }> {
  if (!supabaseAdmin) return { ok: false, status: 500 };

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { ok: false, status: 401 };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { ok: false, status: 401 };

  return { ok: true };
}
