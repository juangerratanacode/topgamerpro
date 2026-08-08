"use client";

import { useState } from "react";
import Image from "next/image";
import { useAdminProducts } from "@/lib/adminStore";
import PackageIconDisplay from "@/components/PackageIconDisplay";
import SaveBar from "@/components/SaveBar";
import { fileToCompressedDataUrl } from "@/lib/image";
import clsx from "clsx";
import type { FieldType, Currency, GameGenre } from "@/lib/types";
import { FIELD_TYPE_LABELS, GENRE_LABELS } from "@/lib/types";
import { useCurrency, CURRENCY_META } from "@/lib/currencyStore";

const FIELD_TYPE_OPTIONS = Object.keys(FIELD_TYPE_LABELS) as FieldType[];

export default function AdminPage() {
  const {
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
  } = useAdminProducts();
  const { rates, setRate } = useCurrency();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold">Catálogo</h1>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="text-xs font-semibold text-brand-textMuted hover:text-white border border-brand-border rounded-full px-3 py-1.5"
          >
            Restaurar catálogo original
          </button>
          <button
            onClick={() => {
              const newId = addProduct();
              setExpandedId(newId);
              requestAnimationFrame(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
              });
            }}
            className="text-xs font-semibold bg-brand-primary hover:bg-brand-primaryDark text-white rounded-full px-4 py-1.5"
          >
            + Agregar juego
          </button>
        </div>
      </div>
      <p className="text-sm text-brand-textMuted mb-6">
        Los cambios se guardan en tu navegador (localStorage) mientras no tengamos Supabase
        conectado. Cuando esté listo, esto va a guardar directo en la base de datos real.
      </p>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 mb-6">
        <h2 className="font-bold text-sm mb-1">Tasas de cambio (moneda de visualización)</h2>
        <p className="text-xs text-brand-textMuted mb-3">
          Los precios se guardan en USD; esto solo define cómo se muestran al cliente cuando elige
          ver Bolívares o Pesos colombianos en el selector de moneda.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 max-w-md">
          {(Object.keys(CURRENCY_META) as Currency[])
            .filter((c) => c !== "USD")
            .map((c) => (
              <div key={c}>
                <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                  {CURRENCY_META[c].flag} 1 USD = ? {c}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rates[c]}
                  onChange={(e) => setRate(c, parseFloat(e.target.value) || 0)}
                  className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-3">
        {products.map((product) => {
          const isOpen = expandedId === product.id;
          return (
            <div key={product.id} className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : product.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0 bg-brand-surfaceLight">
                  {product.imageUrl && (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{product.name}</div>
                  <div className="text-xs text-brand-textMuted">
                    {product.variations.length} paquetes · {product.fields.length} campos
                  </div>
                </div>
                <span className={clsx("transition-transform text-brand-textMuted", isOpen && "rotate-180")}>
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-brand-border p-4 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                        Nombre del juego
                      </label>
                      <input
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                        className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                        Slug (URL)
                      </label>
                      <input
                        value={product.slug}
                        onChange={(e) => updateProduct(product.id, { slug: e.target.value })}
                        className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                      Categoría (para el filtro del catálogo)
                    </label>
                    <select
                      value={product.genre}
                      onChange={(e) => updateProduct(product.id, { genre: e.target.value as GameGenre })}
                      className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
                    >
                      {(Object.keys(GENRE_LABELS) as GameGenre[]).map((g) => (
                        <option key={g} value={g}>
                          {GENRE_LABELS[g]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={product.description ?? ""}
                      onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                      className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2 text-sm"
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-brand-textMuted">
                        Paquetes / precios
                      </label>
                      <button
                        onClick={() => addVariation(product.id)}
                        className="text-xs font-semibold text-brand-primary"
                      >
                        + Agregar paquete
                      </button>
                    </div>
                    <div className="space-y-2">
                      {product.variations.map((v) => (
                        <div
                          key={v.id}
                          className="bg-brand-surfaceLight border border-brand-border rounded-lg p-2 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <label className="relative shrink-0 cursor-pointer group">
                              <PackageIconDisplay
                                variation={v}
                                className="w-8 h-8 rounded-md border border-brand-border"
                              />
                              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                                ✎
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  // Ícono chico (se ve en tarjetas pequeñas), no
                                  // necesita más de 300px — máxima compresión.
                                  const dataUrl = await fileToCompressedDataUrl(file, {
                                    maxWidth: 300,
                                    maxHeight: 300,
                                    quality: 0.85,
                                  });
                                  updateVariation(product.id, v.id, { iconImageUrl: dataUrl });
                                }}
                              />
                            </label>
                            <input
                              value={v.label}
                              onChange={(e) => updateVariation(product.id, v.id, { label: e.target.value })}
                              className="flex-1 bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
                              placeholder="Nombre del paquete"
                            />
                            <button
                              onClick={() => removeVariation(product.id, v.id)}
                              className="text-red-400 hover:text-red-300 text-xs font-bold px-2 shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pl-1">
                            <div>
                              <label className="block text-[10px] text-brand-textMuted mb-0.5">
                                Precio normal (USD)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={v.priceUsd}
                                onChange={(e) =>
                                  updateVariation(product.id, v.id, {
                                    priceUsd: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-brand-textMuted mb-0.5">
                                Precio PayPal (USD, opcional)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={v.priceUsdPaypal ?? ""}
                                placeholder="igual al normal"
                                onChange={(e) =>
                                  updateVariation(product.id, v.id, {
                                    priceUsdPaypal:
                                      e.target.value === "" ? undefined : parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {product.variations.length === 0 && (
                        <p className="text-xs text-brand-textMuted">Sin paquetes todavía.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-brand-textMuted">
                        Campos que se piden al comprar
                      </label>
                      <button
                        onClick={() => addField(product.id)}
                        className="text-xs font-semibold text-brand-primary"
                      >
                        + Agregar campo
                      </button>
                    </div>
                    <div className="space-y-2">
                      {product.fields.length === 0 && (
                        <p className="text-xs text-brand-textMuted">Ninguno configurado.</p>
                      )}
                      {product.fields.map((f) => (
                        <div
                          key={f.key}
                          className="bg-brand-surfaceLight border border-brand-border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <select
                              value={f.type}
                              onChange={(e) =>
                                updateField(product.id, f.key, { type: e.target.value as FieldType })
                              }
                              className="bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs shrink-0"
                            >
                              {FIELD_TYPE_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {FIELD_TYPE_LABELS[t]}
                                </option>
                              ))}
                            </select>
                            <input
                              value={f.label}
                              onChange={(e) => updateField(product.id, f.key, { label: e.target.value })}
                              className="flex-1 bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
                              placeholder="Etiqueta del campo (ej: ID de Jugador)"
                            />
                            <label className="flex items-center gap-1 text-xs text-brand-textMuted shrink-0">
                              <input
                                type="checkbox"
                                checked={f.required ?? false}
                                onChange={(e) =>
                                  updateField(product.id, f.key, { required: e.target.checked })
                                }
                                className="accent-brand-primary"
                              />
                              Obligatorio
                            </label>
                            <button
                              onClick={() => removeField(product.id, f.key)}
                              className="text-red-400 hover:text-red-300 text-xs font-bold px-1 shrink-0"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2">
                            <input
                              value={f.placeholder ?? ""}
                              onChange={(e) =>
                                updateField(product.id, f.key, { placeholder: e.target.value })
                              }
                              className="bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
                              placeholder="Placeholder (texto de ejemplo)"
                            />
                            <input
                              value={f.helpText ?? ""}
                              onChange={(e) =>
                                updateField(product.id, f.key, { helpText: e.target.value })
                              }
                              className="bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
                              placeholder="Texto de ayuda (opcional)"
                            />
                          </div>

                          {f.type === "select" && (
                            <input
                              value={(f.options ?? []).join(", ")}
                              onChange={(e) =>
                                updateField(product.id, f.key, {
                                  options: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
                              placeholder="Opciones separadas por coma (ej: Servidor A, Servidor B)"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar "${product.name}" del catálogo?`)) deleteProduct(product.id);
                    }}
                    className="text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    Eliminar juego del catálogo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SaveBar />
    </div>
  );
}
