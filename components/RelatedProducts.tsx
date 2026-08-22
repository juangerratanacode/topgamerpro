import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

// "Productos que te pueden interesar" al final de la página de producto —
// elegidos a mano por el admin para cada juego (no automático por
// categoría), ver el checklist de "Productos relacionados" en
// /admin/catalogo. Máximo 4, aunque el admin podría en teoría guardar más
// editando la base directo.
export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-14 border-t border-brand-border pt-10">
      <h2 className="text-xl font-bold mb-6">Productos que te pueden interesar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => (
          <Link href={`/productos/${product.slug}`} key={product.id} className="block h-full">
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </section>
  );
}
