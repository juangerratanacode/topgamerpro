import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { data: rows, error } = await supabaseAdmin
    .from("products")
    .select("*, product_variations(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "product_variations", ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const products: Product[] = (rows ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    category: row.category,
    genre: row.genre,
    requiresActivisionLink: row.requires_activision_link ?? undefined,
    requiresKonamiId: row.requires_konami_id ?? undefined,
    fields: row.fields ?? [],
    variations: (row.product_variations ?? []).map((v: any) => ({
      id: v.id,
      label: v.label,
      priceUsd: Number(v.price_usd),
      priceUsdPaypal: v.price_usd_paypal != null ? Number(v.price_usd_paypal) : undefined,
      icon: v.icon,
      iconImageUrl: v.icon_image_url ?? undefined,
      reloadlyProductId: v.reloadly_product_id ?? undefined,
      fieldsOverride: v.fields_override ?? undefined,
    })),
  }));

  return NextResponse.json({ products });
}

// Reemplazo completo del catálogo (mismo patrón que el localStorage
// original: el admin edita en memoria y esto persiste el array entero).
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });

  const { products } = (await req.json()) as { products: Product[] };
  if (!Array.isArray(products)) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // slugs que ya no están en el array recibido => se borraron en el admin
  const { data: existing } = await supabaseAdmin.from("products").select("id, slug");
  const incomingSlugs = new Set(products.map((p) => p.slug));
  const toDelete = (existing ?? []).filter((e) => !incomingSlugs.has(e.slug)).map((e) => e.id);
  if (toDelete.length > 0) {
    await supabaseAdmin.from("products").delete().in("id", toDelete);
  }

  for (const [index, p] of products.entries()) {
    const { data: upserted, error } = await supabaseAdmin
      .from("products")
      .upsert(
        {
          slug: p.slug,
          name: p.name,
          description: p.description ?? null,
          image_url: p.imageUrl ?? null,
          category: p.category,
          genre: p.genre,
          requires_activision_link: p.requiresActivisionLink ?? false,
          requires_konami_id: p.requiresKonamiId ?? false,
          fields: p.fields ?? [],
          sort_order: index,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (error || !upserted) {
      return NextResponse.json({ error: error?.message ?? "Error guardando producto" }, { status: 500 });
    }

    await supabaseAdmin.from("product_variations").delete().eq("product_id", upserted.id);

    if (p.variations.length > 0) {
      const variationRows = p.variations.map((v, vIndex) => ({
        product_id: upserted.id,
        label: v.label,
        price_usd: v.priceUsd,
        price_usd_paypal: v.priceUsdPaypal ?? null,
        icon: v.icon,
        icon_image_url: v.iconImageUrl ?? null,
        reloadly_product_id: v.reloadlyProductId ?? null,
        fields_override: v.fieldsOverride ?? null,
        sort_order: vIndex,
      }));
      const { error: varError } = await supabaseAdmin.from("product_variations").insert(variationRows);
      if (varError) return NextResponse.json({ error: varError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
