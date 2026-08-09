import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

// Sin esto, Next.js puede optimizar esta ruta como estática (el GET no usa
// ninguna API "dinámica" a su criterio) y en ese caso el PUT deja de
// responder — el framework la sirve como asset estático GET-only y cachea
// un 405 para cualquier otro método, incluso en el edge de Vercel.
export const dynamic = "force-dynamic";

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { data, error } = await supabaseAdmin.from("banners").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const banners: Banner[] = (data ?? []).map((b: any) => ({
    id: b.id,
    imageUrl: b.image_url,
    title: b.title,
    subtitle: b.subtitle ?? "",
    ctaLabel: b.cta_label ?? "",
    ctaHref: b.cta_href ?? "",
  }));

  return NextResponse.json({ banners });
}

// Reemplazo completo (igual patrón que localStorage: el admin edita en
// memoria un array y esto lo persiste entero cada vez que cambia).
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { banners } = (await req.json()) as { banners: Banner[] };
  if (!Array.isArray(banners)) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  await supabaseAdmin.from("banners").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  if (banners.length > 0) {
    const rows = banners.map((b, i) => ({
      image_url: b.imageUrl,
      title: b.title,
      subtitle: b.subtitle,
      cta_label: b.ctaLabel,
      cta_href: b.ctaHref,
      sort_order: i,
    }));
    const { error } = await supabaseAdmin.from("banners").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
