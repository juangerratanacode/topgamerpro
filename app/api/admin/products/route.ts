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

  const { products: rawProducts } = (await req.json()) as { products: Product[] };
  if (!Array.isArray(rawProducts)) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Defensa contra estado corrupto del cliente (ej. una pestaña vieja del
  // admin que quedó abierta con datos de antes de una limpieza manual, y
  // termina reescribiéndolos al guardar sin que el usuario lo note): sin
  // importar qué mande el navegador, el servidor nunca persiste un
  // producto repetido por slug ni un paquete repetido por nombre dentro
  // del mismo producto. Se queda con la ÚLTIMA aparición de cada uno —
  // es la más reciente en el array tal como lo arma el admin.
  const productsBySlug = new Map<string, Product>();
  for (const p of rawProducts) productsBySlug.set(p.slug, p);
  const products = Array.from(productsBySlug.values());

  // slugs que ya no están en el array recibido => se borraron en el admin
  const { data: existing } = await supabaseAdmin.from("products").select("id, slug");
  const incomingSlugs = new Set(products.map((p) => p.slug));
  const toDelete = (existing ?? []).filter((e) => !incomingSlugs.has(e.slug)).map((e) => e.id);
  if (toDelete.length > 0) {
    await supabaseAdmin.from("products").delete().in("id", toDelete);
  }

  const skippedDeletions: { product: string; id: string; reason: string }[] = [];

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

    const variationsByLabel = new Map<string, (typeof p.variations)[number]>();
    for (const v of p.variations) variationsByLabel.set(v.label.trim().toLowerCase(), v);
    const dedupedVariations = Array.from(variationsByLabel.values());

    // Antes esto era "borrar todo lo que tenga este producto, después
    // insertar todo de nuevo". El problema: si algún paquete ya tiene un
    // pedido real asociado (order_items.variation_id lo referencia), el
    // DELETE completo fallaba por la foreign key — y como el resultado de
    // ese delete nunca se chequeaba, el código seguía igual e insertaba el
    // set nuevo ENCIMA del viejo (que nunca se había borrado). Eso era la
    // causa real de los paquetes duplicados, no un bug de lectura.
    //
    // Ahora se sincroniza por id: real UUID existente = UPDATE, id
    // temporal del cliente (o sin id) = INSERT nuevo, y solo se borran los
    // ids que existían antes y ya no vienen en el array — si ese borrado
    // puntual falla por tener pedidos reales, se omite ese paquete en vez
    // de tumbar el guardado entero, y se avisa en la respuesta.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const { data: existingVariations } = await supabaseAdmin
      .from("product_variations")
      .select("id")
      .eq("product_id", upserted.id);
    const existingIds = new Set((existingVariations ?? []).map((v) => v.id as string));

    const toUpdate = dedupedVariations.filter((v) => UUID_RE.test(v.id) && existingIds.has(v.id));
    const toInsert = dedupedVariations.filter((v) => !UUID_RE.test(v.id) || !existingIds.has(v.id));
    const keptIds = new Set(toUpdate.map((v) => v.id));
    const idsToRemove = [...existingIds].filter((id) => !keptIds.has(id));

    for (const [vIndex, v] of dedupedVariations.entries()) {
      const row = {
        label: v.label,
        price_usd: v.priceUsd,
        price_usd_paypal: v.priceUsdPaypal ?? null,
        icon: v.icon,
        icon_image_url: v.iconImageUrl ?? null,
        reloadly_product_id: v.reloadlyProductId ?? null,
        fields_override: v.fieldsOverride ?? null,
        sort_order: vIndex,
      };
      if (toUpdate.includes(v)) {
        const { error: updError } = await supabaseAdmin
          .from("product_variations")
          .update(row)
          .eq("id", v.id);
        if (updError) return NextResponse.json({ error: updError.message }, { status: 500 });
      } else if (toInsert.includes(v)) {
        const { error: insError } = await supabaseAdmin
          .from("product_variations")
          .insert({ ...row, product_id: upserted.id });
        if (insError) {
          // Choque contra el constraint único (product_id, label): significa
          // que ya existe una fila con esta etiqueta para este producto —
          // típicamente porque el navegador todavía tenía el id temporal de
          // un paquete que en realidad ya se había guardado antes (el
          // estado del cliente no se había refrescado con el id real). En
          // vez de fallar el guardado entero, se actualiza esa fila
          // existente en lugar de insertar una nueva.
          if (insError.code === "23505") {
            const { error: fallbackError } = await supabaseAdmin
              .from("product_variations")
              .update(row)
              .eq("product_id", upserted.id)
              .eq("label", v.label);
            if (fallbackError) {
              return NextResponse.json({ error: fallbackError.message }, { status: 500 });
            }
          } else {
            return NextResponse.json({ error: insError.message }, { status: 500 });
          }
        }
      }
    }

    for (const id of idsToRemove) {
      const { error: delError } = await supabaseAdmin.from("product_variations").delete().eq("id", id);
      if (delError) {
        // No se pudo borrar (típicamente: tiene pedidos reales asociados).
        // Se deja el paquete en la base en vez de fallar todo el guardado
        // — va a seguir apareciendo en la lista hasta que se le quiten
        // esos pedidos, pero eso es preferible a perder el historial.
        skippedDeletions.push({ product: p.name, id, reason: delError.message });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    ...(skippedDeletions.length > 0 && {
      warning: `No se pudieron eliminar ${skippedDeletions.length} paquete(s) porque tienen pedidos asociados.`,
      skippedDeletions,
    }),
  });
}
