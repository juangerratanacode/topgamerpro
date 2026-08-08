"use client";

// Estado del panel admin. Por ahora vive en localStorage (no hay
// Supabase conectado todavía) — cuando exista la base de datos real,
// estas funciones se reemplazan por llamadas a Supabase y el admin
// sigue funcionando igual desde la UI, sin cambiar componentes.

import { useEffect, useState, useCallback } from "react";
import { mockProducts as defaultProducts } from "./mockProducts";
import type { Product, ProductVariation, GameFieldDef } from "./types";
import { safeLocalStorageSet } from "./image";

const STORAGE_KEY = "pitanga_admin_products_v1";

function loadProducts(): Product[] {
  if (typeof window === "undefined") return defaultProducts;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultProducts;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultProducts;
  }
}

function saveProducts(products: Product[]): boolean {
  return safeLocalStorageSet(STORAGE_KEY, JSON.stringify(products));
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProducts(products);
  }, [products, hydrated]);

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
    setProducts(loadProducts());
    setHydrated(true);

    // si el admin edita en otra pestaña, esta se actualiza sola
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setProducts(loadProducts());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { products, hydrated };
}
