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
import { dedupeProducts } from "./productUtils";

// Antes de mandar nada al servidor, revisa si algún producto tiene dos
// paquetes con la misma etiqueta (ej. dos "Nuevo paquete" sin renombrar).
// Sirve para cortar el guardado ahí mismo con un mensaje claro en vez de
// dejar que Supabase lo rebote por el constraint único y el admin vea un
// error de Postgres crudo.
function findDuplicateLabel(products: Product[]): { product: string; label: string } | null {
  for (const p of products) {
    const seen = new Set<string>();
    for (const v of p.variations) {
      const key = v.label.trim().toLowerCase();
      if (seen.has(key)) return { product: p.name, label: v.label };
      seen.add(key);
    }
  }
  return null;
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

  // Un producto sin paquetes todavía (ej. recién creado en el admin, antes
  // de cargarle precios) no es comprable — mostrarlo en la tienda pública
  // rompía la card de producto (ver ProductCard.tsx) y no tiene nada que un
  // cliente pueda hacer ahí. Se excluye acá, no en el admin: el admin sí
  // necesita verlo para poder terminarlo de configurar.
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
  ).filter((p) => p.variations.length > 0);
}

// Antes, si esta llamada fallaba (ej. sesión vencida -> 401, o un error de
// red), se devolvía en silencio el catálogo de ejemplo hardcodeado en
// mockProducts.ts — y como ese mock tiene igual cantidad de campos que un
// producto real, el admin no tenía forma de notar que estaba viendo datos
// falsos en vez del catálogo real. Peor: si en ese estado alguien guardaba,
// se sobrescribía la base de datos real con el mock. Ahora un fallo real se
// reporta como tal en vez de disfrazarse de catálogo vacío/de ejemplo.
async function loadProductsFromApi(): Promise<{ products: Product[]; error: string | null }> {
  try {
    const res = await adminFetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) {
      const reason =
        res.status === 401
          ? "Tu sesión de admin venció — volvé a iniciar sesión."
          : `Error ${res.status} al cargar el catálogo.`;
      return { products: defaultProducts, error: reason };
    }
    const data = await res.json();
    const products = Array.isArray(data.products) ? dedupeProducts(data.products) : [];
    return { products: products.length > 0 ? products : defaultProducts, error: null };
  } catch (err) {
    return {
      products: defaultProducts,
      error: err instanceof Error ? err.message : "No se pudo conectar con el servidor.",
    };
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
  // Cuando esto tiene un valor, lo que se ve en `products` NO es
  // necesariamente el catálogo real (puede ser el mock de respaldo) — se usa
  // para bloquear el guardado y avisar en la UI en vez de arriesgarse a
  // sobrescribir la base de datos real con datos de ejemplo.
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadProductsFromApi().then(({ products: p, error }) => {
      setProducts(p);
      setLoadError(error);
      setHydrated(true);
    });
  }, []);

  // Botón manual para forzar una relectura desde la BD sin recargar toda la
  // página — red de seguridad contra el problema recurrente de esta app: una
  // pestaña del admin abierta hace rato queda con datos viejos en memoria
  // (ej. un paquete que otra persona guardó desde otra pestaña, o que el
  // servidor guardó pero esta pestaña nunca se enteró).
  const reload = useCallback(async () => {
    const { products: fresh, error } = await loadProductsFromApi();
    setProducts(fresh);
    setLoadError(error);
  }, []);

  // Guardado EXPLÍCITO (botón "Guardar cambios"), no automático en cada
  // tecla — guardar en cada cambio causaba llamadas simultáneas al mismo
  // endpoint que se pisaban entre sí y duplicaban paquetes en la base.
  const save = useCallback(async () => {
    if (loadError) {
      setSaveError("No se guardó nada: el catálogo no se pudo cargar bien (ver aviso arriba). Recargá la página antes de guardar.");
      return false;
    }

    const dup = findDuplicateLabel(products);
    if (dup) {
      setSaveError(`"${dup.product}" tiene dos paquetes llamados "${dup.label}" — cambia el nombre de uno antes de guardar.`);
      return false;
    }

    setSaving(true);
    const errorMessage = await persistProductsToApi(products);
    setSaveError(errorMessage);

    // Tras guardar, el servidor le asignó un UUID real a cada paquete
    // nuevo — pero el estado local todavía tiene el id temporal
    // (`v<timestamp>`) con el que se creó en el navegador. Sin recargar
    // acá, un segundo guardado (ej. tras editar otro campo) seguía viendo
    // ese paquete como "nuevo" y lo insertaba OTRA VEZ con la misma
    // etiqueta, chocando contra el constraint único. Recargar desde la API
    // sincroniza el estado con los ids reales de la base.
    if (!errorMessage) {
      const { products: fresh, error } = await loadProductsFromApi();
      setProducts(fresh);
      setLoadError(error);
    }

    setSaving(false);
    return !errorMessage;
  }, [products, loadError]);

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
              // Sufijo corto y aleatorio en el id Y en el nombre por
              // defecto: dos clics rápidos en "+ Agregar paquete" podían
              // caer en el mismo Date.now(), generando dos paquetes con
              // id y etiqueta idénticos ("Nuevo paquete") que Supabase
              // rebotaba al guardar por el constraint único. Con esto,
              // cada paquete nuevo nace ya distinguible del resto.
              variations: [
                ...p.variations,
                {
                  id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  label: `Nuevo paquete ${Math.random().toString(36).slice(2, 6)}`,
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

  return {
    products,
    hydrated,
    saving,
    saveError,
    loadError,
    save,
    reload,
    updateProduct,
    updateVariation,
    addVariation,
    removeVariation,
    addField,
    updateField,
    removeField,
    addProduct,
    deleteProduct,
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
