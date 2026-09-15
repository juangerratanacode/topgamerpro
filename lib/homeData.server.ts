// Carga de datos del home DEL LADO DEL SERVIDOR — se ejecuta durante el
// render del Server Component (app/page.tsx), antes de mandar el HTML al
// navegador. Así el banner y el catálogo llegan ya resueltos en el primer
// HTML: cero pantalla en blanco, cero "aparece uno antes que el otro",
// cero petición en cascada desde el cliente.

import { supabase } from "./supabaseClient";
import { DEFAULT_BANNERS, type Banner } from "./bannersStore";
import type { Product } from "./types";

async function fetchBannersServer(): Promise<Banner[]> {
  if (!supabase) return DEFAULT_BANNERS;
  const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return DEFAULT_BANNERS;
  return data.map((b: any) => ({
    id: b.id,
    imageUrl: b.image_url,
    videoUrl: b.video_url ?? undefined,
    title: b.title,
    subtitle: b.subtitle ?? "",
    ctaLabel: b.cta_label ?? "",
    ctaHref: b.cta_href ?? "",
  }));
}

async function fetchProductsServer(): Promise<Product[]> {
  // Siempre se lee directo de Supabase, sin datos de muestra de respaldo —
  // ver el comentario equivalente en app/productos/[slug]/page.tsx. Mejor
  // un catálogo vacío momentáneo (con log del error) que clientes viendo
  // precios/paquetes de mentira sin ningún aviso.
  if (!supabase) {
    console.error("Supabase no está configurado — no se puede cargar el catálogo.");
    return [];
  }

  // Un blip de red momentáneo entre Vercel y Supabase no debería vaciar el
  // catálogo del home para un cliente real — se reintenta una vez antes de
  // rendirse. Mismo patrón que app/productos/[slug]/page.tsx.
  let rows: any[] | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variations(*)")
      .order("sort_order", { ascending: true })
      .order("sort_order", { referencedTable: "product_variations", ascending: true });

    if (!error) {
      rows = data;
      break;
    }
    console.error(`Error cargando el catálogo desde Supabase (intento ${attempt}):`, error.message);
    if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (!rows || rows.length === 0) return [];

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
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
}

export async function getHomeData() {
  const [banners, products] = await Promise.all([fetchBannersServer(), fetchProductsServer()]);
  return { banners, products };
}

export interface ProductSlugEntry {
  slug: string;
  updatedAt?: string;
}

// Versión liviana de fetchProductsServer para app/sitemap.ts — solo trae
// slug + updated_at en vez de todas las variaciones de cada producto, que
// ahí no hacen falta.
export async function fetchProductSlugsServer(): Promise<ProductSlugEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("slug, updated_at");
  if (error) console.error("Error cargando slugs para el sitemap desde Supabase:", error.message);
  if (error || !data) return [];
  return data.map((row: any) => ({ slug: row.slug, updatedAt: row.updated_at ?? undefined }));
}
