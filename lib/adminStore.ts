"use client";

// Estado del panel admin. Por ahora vive en localStorage (no hay
// Supabase conectado todavía) — cuando exista la base de datos real,
// estas funciones se reemplazan por llamadas a Supabase y el admin
// sigue funcionando igual desde la UI, sin cambiar componentes.

import { useEffect, useState, useCallback } from "react";
import { mockProducts as defaultProducts } from "./mockProducts";
import type { Product, ProductVariation, GameFieldDef } from "./types";
import { supabase } from "./supabaseClient";
import { adminFetch } from "./adminFetch";

// Defensa en el cliente contra duplicados: aunque la API ya devuelva datos
// limpios, si por lo que sea llegan paquetes repetidos (mismo id, o mismo
// label dentro del mismo producto) no queremos que el formulario del admin
// los cargue en el estado y los vuelva a guardar tal cual. Se queda con la
// primera aparición de cada uno.
function dedupeProducts(products: Product[]): Product[] {
  return products.map((p) => {
    const seenIds = new Set<string>();
    const seenLabels = new Set<string>();
    const variations = p.variations.filter((v) => {
      const labelKey = v.label.trim().toLowerCase();
      if (seenIds.has(v.id) || seenLabels.has(labelKey)) return false;
      seenIds.add(v.id);
      seenLabels.add(labelKey);
      return true;
    });
    return { ...p, variations };
  });
}

// Convierte las filas de Supabase (products + product_variations) al mismo
// shape que ya usaba el resto del código con mockProducts.ts, para no tener
// que tocar los componentes que consumen useStorefrontProducts().
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!supabase) return null;

  const { data: rows, error } = await supabase
    .from("products")
    .select("*, product_variations(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "product_variations", ascending: true });

  if (error || !rows) {
    console.error("Error cargando productos de Supabase:", error?.message);
    return null;
  }

  return dedupeProducts(
    rows.map((row: any) => ({
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
    }))
  );
}

async function loadProductsFromApi(): Promise<Product[]> {
  try {
    const res = await adminFetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) return defaultProducts;
    const data = await res.json();
    return Array.isArray(data.products) && data.products.length > 0
      ? dedupeProducts(data.products)
      : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

async function persistProductsToApi(products: Product[]): Promise<string | null> {
  try {
    const res = await adminFetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    });
    if (res.ok) return null;
    if (res.status === 413) return "La imagen es muy pesada. Sube un ícono más chico o comprimido.";
    const body = await res.json().catch(() => null);
    return body?.error ?? `Error ${res.status} al guardar.`;
  } catch (err) {
    return err instanceof Error ? err.message : "No se pudo conectar con el servidor.";
  }
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadProductsFromApi().then((p) => {
      setProducts(p);
      setHydrated(true);
    });
  }, []);

  // Guardado EXPLÍCITO (botón "Guardar cambios"), no automático en cada
  // tecla — guardar en cada cambio causaba llamadas simultáneas al mismo
  // endpoint que se pisaban entre sí y duplicaban paquetes en la base.
  const save = useCallback(async () => {
    setSaving(true);
    const errorMessage = await persistProductsToApi(products);
    setSaveError(errorMessage);
    setSaving(false);
    return !errorMessage;
  }, [products]);

  const moveProductUp = useCallback((id: string) => {
    setProducts((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }, []);

  const moveProductDown = useCallback((id: string) => {
    setProducts((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      if (i === -1 || i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i + 1], next[i]] = [next[i], next[i + 1]];
      return next;
    });
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const updateVariation = useCallback(
    (productId: string, variationId: string, patch: Partial<ProductVariation>) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                variations: p.variations.map((v) =>
                  v.id === variationId ? { ...v, ...patch } : v
                ),
              }
        )
      );
    },
    []
  );

  const addVariation = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              variations: [
                ...p.variations,
                {
                  id: `v${Date.now()}`,
                  label: "Nuevo paquete",
                  priceUsd: 1,
                  icon: "generic",
                },
              ],
            }
      )
    );
  }, []);

  const removeVariation = useCallback((productId: string, variationId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : { ...p, variations: p.variations.filter((v) => v.id !== variationId) }
      )
    );
  }, []);

  const addField = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              fields: [
                ...p.fields,
                {
                  key: `campo_${Date.now()}`,
                  label: "Nuevo campo",
                  type: "text",
                  required: true,
                } as GameFieldDef,
              ],
            }
      )
    );
  }, []);

  const updateField = useCallback(
    (productId: string, fieldKey: string, patch: Partial<GameFieldDef>) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                fields: p.fields.map((f) => (f.key === fieldKey ? { ...f, ...patch } : f)),
              }
        )
      );
    },
    []
  );

  const removeField = useCallback((productId: string, fieldKey: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : { ...p, fields: p.fields.filter((f) => f.key !== fieldKey) }
      )
    );
  }, []);

  const addProduct = useCallback(() => {
    const id = `p${Date.now()}`;
    setProducts((prev) => [
      ...prev,
      {
        id,
        slug: `nuevo-juego-${id}`,
        name: "Nuevo Juego",
        category: "Nuevo Juego",
        genre: "otros",
        description: "",
        fields: [],
        variations: [],
      },
    ]);
    return id;
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setProducts(defaultProducts);
  }, []);

  return {
    products,
    hydrated,
    saving,
    saveError,
    save,
    updateProduct,
    updateVariation,
    addVariation,
    removeVariation,
    addField,
    updateField,
    removeField,
    addProduct,
    deleteProduct,
    resetToDefaults,
    moveProductUp,
    moveProductDown,
  };
}

// Hook de solo lectura para el sitio real (home, página de producto).
// Lee el mismo catálogo que edita el admin — así cualquier cambio que
// hagas en /admin/catalogo (ícono, precio, descripción, juego nuevo) se
// ve reflejado de inmediato en la tienda, sin duplicar datos.
export function useStorefrontProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const fromSupabase = await fetchProductsFromSupabase();
      if (cancelled) return;
      setProducts(fromSupabase && fromSupabase.length > 0 ? fromSupabase : defaultProducts);
      setHydrated(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, hydrated };
}
