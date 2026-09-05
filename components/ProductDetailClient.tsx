"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, ProductVariation, GameFieldValue } from "@/lib/types";
import { useCart } from "@/lib/cartStore";
import { useCurrency } from "@/lib/currencyStore";
import { getPaypalDisplayPrice } from "@/lib/pricing";
import { getVariationFields } from "@/lib/mockProducts";
import { validateGameFields } from "@/lib/validation";
import GameSpecialNotice from "./GameSpecialNotice";
import PackageIconDisplay from "./PackageIconDisplay";
import StarRating from "./StarRating";
import { useReviewStats } from "@/lib/useReviewStats";
import clsx from "clsx";

// El texto de la descripción larga a veces viene con saltos de línea a
// mitad de oración (copiado de una fuente pensada para otro ancho de
// columna) — se ve cortado de forma rara. No podemos aplastar TODOS los
// saltos de línea porque el admin sí puede querer párrafos separados a
// propósito (ej. pasos numerados). La regla: una línea en blanco entre
// dos bloques de texto es un salto de párrafo real y se respeta; un
// salto de línea suelto dentro de un mismo bloque es un simple ajuste de
// ancho y se convierte en espacio.
function normalizeParagraphs(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(product.variations[0]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const { addItem } = useCart();
  const { display, format } = useCurrency();
  const router = useRouter();

  const activeFields = getVariationFields(product, selectedVariation.id);
  const fieldsWithHelp = activeFields.filter((f) => f.helpText);
  const { average, count } = useReviewStats(product.slug);

  // En modo PayPal, el precio real es el que se cargó a mano en el admin
  // para este paquete (o la fórmula de respaldo si no se cargó ninguno) —
  // no la conversión genérica del precio base.
  function formatVariationPrice(v: ProductVariation) {
    return display === "PAYPAL" ? `$${getPaypalDisplayPrice(v).toFixed(2)}` : format(v.priceUsd);
  }

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
    <div className="grid sm:grid-cols-2 gap-8 lg:items-start">
      {/* Columna izquierda: en desktop queda "pegada" (sticky) mientras se
          scrollea la derecha, en vez de dejar un hueco vacío debajo cuando
          la imagen es más corta que el resto del contenido. En mobile no
          cambia nada — sigue apilada normal. */}
      <div className="lg:sticky lg:top-[100px] lg:self-start space-y-4">
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
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
        </motion.div>

        {/* Mismo texto de ayuda que ya se muestra bajo cada campo — acá
            solo se repite en desktop (hidden por defecto) para balancear
            la altura de la columna izquierda; en mobile se sigue viendo
            únicamente debajo de cada campo, como siempre. */}
        {fieldsWithHelp.length > 0 && (
          <div className="hidden lg:block bg-brand-surface border border-brand-border rounded-xl p-4">
            <div className="font-semibold text-sm mb-2">¿Cómo encontrar tus datos?</div>
            <ul className="space-y-2 text-xs text-brand-textMuted">
              {fieldsWithHelp.map((f) => (
                <li key={f.key}>
                  <strong className="text-white">{f.label}:</strong> {f.helpText}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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

        {product.shortDescription && (
          <div className="mb-5 bg-brand-surface border border-brand-border rounded-xl p-4">
            {/* A diferencia de la descripción larga, acá NO se respetan los
                saltos de línea tal cual — este campo es para 1-2 líneas, y
                el contenido cargado desde el sitio original a veces trae
                saltos de línea a mitad de oración (de cuando el texto
                estaba pensado para un ancho de columna distinto), lo que
                cortaba las frases de forma rara. Colapsar todo a espacios
                deja que el texto fluya y se ajuste solo al ancho real. */}
            <p className="text-brand-textMuted text-sm leading-relaxed">
              {product.shortDescription.replace(/\s*\n\s*/g, " ")}
            </p>
          </div>
        )}

        <GameSpecialNotice product={product} />

        <div className="mb-6">
          <div className="font-semibold text-sm mb-2 text-brand-textMuted">Elige tu paquete</div>
          {/* Antes cada card era un motion.button con fade-in escalonado +
              whileTap — con catálogos grandes eso es una instancia de
              Framer Motion por paquete corriendo en el hilo de JS al
              montar. Reemplazado por CSS puro (transition-colors +
              active:scale) que hace lo mismo sin overhead de JS. */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-2.5">
            {product.variations.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariation(v)}
                className={clsx(
                  "border-2 rounded-xl p-3 lg:p-2.5 text-center transition-colors active:scale-[0.96] flex flex-col items-center gap-1",
                  selectedVariation.id === v.id
                    ? "border-brand-primary bg-brand-primary/10"
                    : "border-brand-border bg-brand-surface hover:border-brand-textMuted"
                )}
              >
                <PackageIconDisplay variation={v} className="w-9 h-9 lg:w-7 lg:h-7" />
                <div className="text-xs font-semibold">{v.label}</div>
                <div className="text-brand-green font-bold text-sm">{formatVariationPrice(v)}</div>
              </button>
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
                    <p className="text-xs text-brand-textMuted/70 mt-1 lg:hidden">{field.helpText}</p>
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
          Agregar al carrito — {formatVariationPrice(selectedVariation)}
        </motion.button>

        {product.description && (
          <div className="mt-6 bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
            <button
              onClick={() => setDescriptionOpen((o) => !o)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-semibold text-sm">Descripción del producto</span>
              <span className={clsx("transition-transform text-brand-textMuted shrink-0", descriptionOpen && "rotate-180")}>
                ▾
              </span>
            </button>
            <AnimatePresence initial={false}>
              {descriptionOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-brand-textMuted text-sm leading-relaxed whitespace-pre-line text-justify px-4 pb-4">
                    {normalizeParagraphs(product.description)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
