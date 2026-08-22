"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { useReviewStats } from "@/lib/useReviewStats";
import { useCurrency } from "@/lib/currencyStore";
import { getPaypalDisplayPrice } from "@/lib/pricing";
import StarRating from "./StarRating";

export default function ProductCard({ product }: { product: Product }) {
  // Un producto sin paquetes (ej. un juego recién creado en el admin, antes
  // de cargarle precios) tumbaba el sitio entero: reduce() sobre un array
  // vacío sin valor inicial lanza una excepción no capturada. El catálogo ya
  // filtra estos productos, pero esto queda como resguardo — nunca debería
  // llegar a renderizarse una card sin paquetes.
  if (product.variations.length === 0) return null;
  const cheapestVariation = product.variations.reduce((min, v) => (v.priceUsd < min.priceUsd ? v : min));
  const { average, count } = useReviewStats(product.slug);
  const { display, format } = useCurrency();

  // En modo PayPal el precio real es el que se cargó a mano en el admin
  // (o la fórmula de respaldo si no se cargó ninguno) — no una conversión
  // genérica del precio base, que ignoraría ese ajuste manual.
  const displayPrice =
    display === "PAYPAL" ? `$${getPaypalDisplayPrice(cheapestVariation).toFixed(2)}` : format(cheapestVariation.priceUsd);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group h-full flex flex-col bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-brand-accent/60 hover:shadow-glow-accent transition-colors cursor-pointer"
    >
      <div className="aspect-square relative overflow-hidden shrink-0">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-sm leading-tight truncate mb-0.5">{product.name}</h3>
        <p className="text-xs text-brand-textMuted truncate">Recarga de {product.category}</p>

        <div className="h-4 mt-1">
          {count > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-brand-textMuted">
              <StarRating rating={average} />
              {average} ({count})
            </span>
          )}
        </div>

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div>
            <span className="block text-[10px] text-brand-textMuted">desde</span>
            <span className="text-brand-green font-bold text-sm leading-none">{displayPrice}</span>
          </div>
          <span className="text-xs font-semibold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Ver más →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
