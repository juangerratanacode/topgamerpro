import Image from "next/image";
import type { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductReviews from "@/components/ProductReviews";
import { supabase } from "@/lib/supabaseClient";
import { mockProducts } from "@/lib/mockProducts";
import type { Product } from "@/lib/types";

export const revalidate = 0;

async function getProductBySlugServer(slug: string): Promise<Product | undefined> {
  if (supabase) {
    const { data: row, error } = await supabase
      .from("products")
      .select("*, product_variations(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && row) {
      return {
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
        variations: (row.product_variations ?? [])
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((v: any) => ({
            id: v.id,
            label: v.label,
            priceUsd: Number(v.price_usd),
            priceUsdPaypal: v.price_usd_paypal != null ? Number(v.price_usd_paypal) : undefined,
            icon: v.icon,
            iconImageUrl: v.icon_image_url ?? undefined,
            reloadlyProductId: v.reloadly_product_id ?? undefined,
            fieldsOverride: v.fields_override ?? undefined,
          })),
      };
    }
  }

  return mockProducts.find((p) => p.slug === slug);
}

// SEO por producto: sin esto, todas las páginas de producto heredaban el
// title/description genérico de app/layout.tsx, y Google no tenía forma de
// distinguir una página de otra en resultados de búsqueda.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlugServer(params.slug);
  if (!product) return {};

  const title = `${product.name} — Recarga rápida | TopGamerPro`;
  const description =
    product.description?.slice(0, 160) ||
    `Recarga ${product.name} de forma rápida y segura con Pago Móvil o PayPal. Entrega en minutos.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

// Server Component: el producto llega ya resuelto en el HTML — nada de
// "Cargando..." ni fetch en el navegador, igual que en la Home.
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlugServer(params.slug);

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-brand-textMuted">No encontramos este juego en el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Fondo a pantalla completa con el arte del propio juego, oscurecido y
          con degradado de marca encima — así cada producto "ambienta" su
          página sin competir con el contenido. */}
      {product.imageUrl && (
        // will-change-transform: promueve el fondo a su propia capa de
        // composición — es fixed y no debería repintarse en cada scroll,
        // pero con blur-2xl + scale-110 conviene asegurarlo en vez de
        // confiar en que el navegador lo decida solo.
        <div className="fixed inset-0 -z-10 overflow-hidden will-change-transform">
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover scale-110 blur-2xl opacity-60 sm:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/35 via-brand-bg/70 to-brand-accent2/35 sm:from-brand-primary/25 sm:via-brand-bg/60 sm:to-brand-accent2/25" />
          <div className="absolute inset-0 bg-brand-bg/75 sm:bg-brand-bg/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-bg/50 to-brand-bg sm:via-brand-bg/40" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <ProductDetailClient product={product} />
        <ProductReviews slug={product.slug} productName={product.name} />
      </div>
    </div>
  );
}
