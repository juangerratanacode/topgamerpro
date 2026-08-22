import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Reseñas de producto reales, en Supabase — antes vivían solo en el
// localStorage de quien las escribía, así que nunca las veía nadie más
// (ni siquiera el admin en el panel de moderación). Público: cualquiera
// puede leerlas (sin el correo, que es solo para moderación interna) y
// escribir una nueva. Solo un admin puede borrarlas.

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  // El correo del que escribió la reseña nunca se muestra públicamente —
  // solo se incluye en la respuesta si quien pide la lista es un admin
  // logueado (para moderar en /admin/comentarios).
  const auth = await requireAdmin(req);

  const { data, error } = await supabaseAdmin
    .from("product_reviews")
    .select("id, product_slug, author, email, content, rating, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reviews = (data ?? []).map((r) => ({
    id: r.id,
    productSlug: r.product_slug,
    author: r.author,
    email: auth.ok ? r.email : undefined,
    content: r.content,
    rating: r.rating,
    date: r.created_at.slice(0, 10),
  }));

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const productSlug = typeof body?.productSlug === "string" ? body.productSlug.trim() : "";
  const author = typeof body?.author === "string" ? body.author.trim().slice(0, 80) : "";
  const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
  const content = typeof body?.content === "string" ? body.content.trim().slice(0, 2000) : "";
  const rating = Number(body?.rating);

  if (!productSlug || !author || !email || !content) {
    return NextResponse.json({ error: "Faltan datos de la reseña." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Calificación inválida." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("product_reviews").insert({
    product_slug: productSlug,
    author,
    email,
    content,
    rating,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const { error } = await supabaseAdmin.from("product_reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
