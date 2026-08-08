"use client";

// Carga banners + catálogo EN PARALELO y recién revela ambos cuando los dos
// terminaron — así el home nunca muestra el catálogo antes que el banner
// (o viceversa), sin importar cuál responda primero.

import { useEffect, useState } from "react";
import { readBanners, type Banner, DEFAULT_BANNERS } from "./bannersStore";
import { fetchProductsFromSupabase } from "./adminStore";
import { mockProducts } from "./mockProducts";
import type { Product } from "./types";

export function useHomeData() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([readBanners(), fetchProductsFromSupabase()]).then(([b, p]) => {
      if (cancelled) return;
      setBanners(b.length > 0 ? b : DEFAULT_BANNERS);
      setProducts(p && p.length > 0 ? p : mockProducts);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { banners, products, ready };
}
