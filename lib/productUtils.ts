import type { Product, ProductVariation } from "./types";

// Única fuente de verdad para deduplicar paquetes por id o por etiqueta.
// Se usa tanto al leer el catálogo para el admin como al leer un producto
// para su página pública — así lo que ve el admin y lo que ve el cliente
// en /productos/[slug] es SIEMPRE el mismo set de paquetes, filtrado con
// exactamente la misma regla.
export function dedupeVariations<T extends Pick<ProductVariation, "id" | "label">>(variations: T[]): T[] {
  const seenIds = new Set<string>();
  const seenLabels = new Set<string>();
  return variations.filter((v) => {
    const labelKey = v.label.trim().toLowerCase();
    if (seenIds.has(v.id) || seenLabels.has(labelKey)) return false;
    seenIds.add(v.id);
    seenLabels.add(labelKey);
    return true;
  });
}

export function dedupeProducts(products: Product[]): Product[] {
  return products.map((p) => ({ ...p, variations: dedupeVariations(p.variations) }));
}
