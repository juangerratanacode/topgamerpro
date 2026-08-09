"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Product, ProductVariation, GameFieldValue } from "@/lib/types";
import { useCart } from "@/lib/cartStore";
import { useCurrency } from "@/lib/currencyStore";
import { getVariationFields } from "@/lib/mockProducts";
import { validateGameFields } from "@/lib/validation";
import GameSpecialNotice from "./GameSpecialNotice";
import PackageIconDisplay from "./PackageIconDisplay";
import StarRating from "./StarRating";
import { getAverageRating } from "@/lib/reviews";
import clsx from "clsx";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(product.variations[0]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const { addItem } = useCart();
  const { display, format } = useCurrency();
  const router = useRouter();

  const activeFields = getVariationFields(product, selectedVariation.id);
  const { average, count } = getAverageRating(product.slug);

  function scrollToReviews() {
    document.getElementById("resenas")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleAddToCart() {
    const gameFields: GameFieldValue[] = activeFields.map((f) => ({
      label: f.label,
      value: fieldValues[f.key] ?? "",
    }));

    const error = validateGameFields(gameFields);
    if (error) {
      alert(error);
      return;
    }

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variationId: selectedVariation.id,
      variationLabel: selectedVariation.label,
      unitPriceUsd: selectedVariation.priceUsd,
      unitPriceUsdPaypal: selectedVariation.priceUsdPaypal,
      quantity: 1,
      gameFields,
      reloadlyProductId: selectedVariation.reloadlyProductId ?? null,
      icon: selectedVariation.icon,
      iconImageUrl: selectedVariation.iconImageUrl,
    });

    router.push("/carrito");
  }

  return (
    <div className="grid sm:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="aspect-[4/5] rounded-2xl relative overflow-hidden"
      >
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <h1 className="text-2xl font-extrabold mb-2">{product.name}</h1>

        <div className="mb-4">
          {count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={average} size="sm" />
              <span className="text-xs text-brand-textMuted">({count} valoraciones de clientes)</span>
            </div>
          )}
          <button
            onClick={scrollToReviews}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-accent hover:brightness-110 text-white text-xs font-extrabold uppercase tracking-wide px-4 py-2 rounded-full transition-all shadow-glow"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {count > 0 ? "Ver reseñas" : "Sé el primero en opinar"}
          </button>
        </div>

        {product.description && (
          <p className="text-brand-textMuted mb-4 text-sm">{product.description}</p>
        )}

        <GameSpecialNotice product={product} />

        <div className="mb-6">
          <div className="font-semibold text-sm mb-2 text-brand-textMuted">Elige tu paquete</div>
          <div className="grid grid-cols-3 gap-3">
            {product.variations.map((v, i) => (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedVariation(v)}
                className={clsx(
                  "border-2 rounded-xl p-3 text-center transition-colors flex flex-col items-center gap-1",
                  selectedVariation.id === v.id
                    ? "border-brand-primary bg-brand-primary/10"
                    : "border-brand-border bg-brand-surface hover:border-brand-textMuted"
                )}
              >
                <PackageIconDisplay variation={v} className="w-9 h-9" />
                <div className="text-xs font-semibold">{v.label}</div>
                <div className="text-brand-green font-bold text-sm">{format(v.priceUsd)}</div>
                {display !== "USD" && (
                  <div className="text-[10px] text-brand-textMuted">${v.priceUsd.toFixed(2)} USD</div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {activeFields.length > 0 && (
          <div className="mb-6 space-y-3">
            {activeFields.map((field) => {
              const value = fieldValues[field.key] ?? "";
              const setValue = (v: string) =>
                setFieldValues((prev) => ({ ...prev, [field.key]: v }));
              const baseClass =
                "w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary";

              if (field.type === "checkbox") {
                return (
                  <label key={field.key} className="flex items-start gap-2 text-sm text-brand-textMuted">
                    <input
                      type="checkbox"
                      checked={value === "true"}
                      onChange={(e) => setValue(e.target.checked ? "true" : "false")}
                      className="mt-1 accent-brand-primary"
                    />
                    <span>{field.label}</span>
                  </label>
                );
              }

              return (
                <div key={field.key}>
                  <label className="block text-sm font-semibold mb-1 text-brand-textMuted">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={baseClass}
                    >
                      <option value="">Selecciona...</option>
                      {(field.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={baseClass + " resize-none"}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={
                        field.type === "email"
                          ? "email"
                          : field.type === "password"
                          ? "password"
                          : field.type === "number"
                          ? "number"
                          : "text"
                      }
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={baseClass}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.helpText && (
                    <p className="text-xs text-brand-textMuted/70 mt-1">{field.helpText}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white font-bold py-3 rounded-full transition-colors"
        >
          Agregar al carrito — {format(selectedVariation.priceUsd)}
        </motion.button>
      </motion.div>
    </div>
  );
}
