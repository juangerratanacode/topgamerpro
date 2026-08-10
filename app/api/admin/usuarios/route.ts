import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Lista las cuentas de clientes registradas en Supabase Auth (no hay tabla
// propia de "usuarios" — Auth ya guarda todo). listUsers() es paginado, así
// que recorremos todas las páginas para traer el listado completo; con la
// cantidad de clientes que maneja la tienda esto es rápido y evita tener
// que mantener una tabla espejo solo para poder buscar.
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const perPage = 200;
  let page = 1;
  const allUsers: any[] = [];

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    allUsers.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  const users = allUsers
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      fullName: (u.user_metadata?.full_name as string | undefined) ?? "",
      phone: (u.user_metadata?.phone as string | undefined) ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      emailConfirmed: !!u.email_confirmed_at,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ users });
}
