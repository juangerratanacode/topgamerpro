"use client";

import Image from "next/image";
import { useStorefrontProducts } from "@/lib/adminStore";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductReviews from "@/components/ProductReviews";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { products, hydrated } = useStorefrontProducts();

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-brand-textMuted">Cargando...</div>;
  }

  const product = products.find((p) => p.slug === params.slug);

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
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt=""
            fill
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
