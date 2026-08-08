"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStorefrontProducts } from "@/lib/adminStore";
import { GENRE_LABELS, type GameGenre } from "@/lib/types";
import ProductCard from "./ProductCard";
import CatalogSkeleton from "./CatalogSkeleton";
import clsx from "clsx";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita acentos para que "roblox"/"róblox" den igual
}

export default function CatalogSection() {
  const { products, hydrated } = useStorefrontProducts();
  const [active, setActive] = useState<GameGenre | "all">("all");
  const searchParams = useSearchParams();
  const query = normalize(searchParams.get("buscar") ?? "");

  const availableGenres = useMemo(() => {
    const set = new Set(products.map((p) => p.genre));
    return (Object.keys(GENRE_LABELS) as GameGenre[]).filter((g) => set.has(g));
  }, [products]);

  const filtered = useMemo(() => {
    let list = active === "all" ? products : products.filter((p) => p.genre === active);
    if (query) list = list.filter((p) => normalize(p.name).includes(query));
    return list;
  }, [active, products, query]);

  // Reserva (aprox.) la misma altura que el contenido real en vez de
  // colapsar a 0 mientras carga — un cambio brusco de altura justo cuando
  // el navegador restaura el scroll (ej. al volver atrás con el botón del
  // navegador) hace que "aterrice" en un punto equivocado de la página.
  if (!hydrated) return <CatalogSkeleton />;

  return (
    <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-6 bg-brand-primary rounded-full" />
        <h2 className="text-xl sm:text-2xl font-extrabold">
          {query ? (
            <>
              Resultados para <span className="text-brand-primary">"{searchParams.get("buscar")}"</span>
            </>
          ) : (
            <>
              Juegos de <span className="text-brand-accent">Recarga</span>
            </>
          )}
        </h2>
      </div>

      <div className="flex sm:flex-wrap gap-2.5 mb-8 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 scrollbar-none snap-x snap-mandatory sm:snap-none">
        <CategoryPill
          label="Todos"
          genre="all"
          active={active === "all"}
          onClick={() => setActive("all")}
        />
        {availableGenres.map((g) => (
          <CategoryPill
            key={g}
            label={GENRE_LABELS[g]}
            genre={g}
            active={active === g}
            onClick={() => setActive(g)}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="h-full"
            >
              <Link href={`/productos/${product.slug}`} className="block h-full">
                <ProductCard product={product} />
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-brand-textMuted">
              {query
                ? `No encontramos juegos que coincidan con "${searchParams.get("buscar")}".`
                : "No hay juegos en esta categoría todavía."}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

const GENRE_ICON_PATHS: Record<GameGenre | "all", string> = {
  all: "M4 6h16M4 12h16M4 18h16",
  "battle-royale": "M12 2v4m0 12v4M2 12h4m12 0h4M12 8a4 4 0 100 8 4 4 0 000-8z",
  moba: "M14.5 3.5l6 6L9 21l-6-1.5L4.5 13.5 14.5 3.5zM13 5l6 6",
  supercell: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z",
  futbol: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4l3.5 2.5-1.3 4.2H9.8L8.5 8.5 12 6zM4.2 9.5l3-1M20 9.7l-3-1.2M8 19.5l1-3.8M15.3 15.7l1 3.8",
  "gift-cards": "M20 12v9H4v-9M2 7h20v5H2V7zM12 7v14M12 7c-1.5-3-6-3-6 0s4.5 0 6 0zm0 0c1.5-3 6-3 6 0s-4.5 0-6 0z",
  otros: "M12 2l1.8 5.5H19l-4.6 3.4 1.8 5.6-4.6-3.5L7 16.5l1.8-5.6L4.2 7.5h5.4z",
};

function CategoryPill({
  label,
  genre,
  active,
  onClick,
}: {
  label: string;
  genre: GameGenre | "all";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "shrink-0 snap-start flex items-center gap-2.5 pl-5 pr-6 py-2.5 rounded-full text-sm font-semibold border transition-all",
        active
          ? "bg-gradient-to-r from-brand-primary to-brand-accent text-white border-transparent shadow-glow"
          : "bg-brand-surface text-brand-textMuted border-brand-border hover:border-brand-primary/60 hover:text-white"
      )}
    >
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={GENRE_ICON_PATHS[genre]} />
      </svg>
      {label}
    </button>
  );
}
