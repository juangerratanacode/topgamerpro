"use client";

import { useState } from "react";
import Image from "next/image";
import { useAdminProducts } from "@/lib/adminStore";
import PackageIconDisplay from "@/components/PackageIconDisplay";
import SaveBar from "@/components/SaveBar";
import { fileToUploadedUrl } from "@/lib/image";
import clsx from "clsx";
import type { FieldType, Currency, GameGenre } from "@/lib/types";
import { FIELD_TYPE_LABELS, GENRE_LABELS } from "@/lib/types";
import { useCurrency, CURRENCY_META } from "@/lib/currencyStore";

const FIELD_TYPE_OPTIONS = Object.keys(FIELD_TYPE_LABELS) as FieldType[];

export default function AdminPage() {
  const {
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
  } = useAdminProducts();
  const { rates, setRate } = useCurrency();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-brand-textMuted">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold">Catálogo</h1>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setReloading(true);
              await reload();
              setReloading(false);
            }}
            disabled={reloading}
            className="text-xs font-semibold text-brand-textMuted hover:text-white border border-brand-border rounded-full px-3 py-1.5 disabled:opacity-50"
          >
            {reloading ? "Recargando..." : "↻ Recargar catálogo"}
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
        Los cambios quedan solo en esta pantalla hasta que tocas "Guardar cambios" abajo — ahí se
        escriben de verdad en la base de datos.
      </p>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl p-4 mb-6">
          <strong>No se pudo cargar el catálogo real de la base de datos:</strong> {loadError}
          <br />
          Lo que ves abajo es un catálogo de ejemplo, no tus datos reales — el guardado está
          bloqueado hasta que recargues la página o le des a "↻ Recargar catálogo".
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 mb-6">
        <h2 className="font-bold text-sm mb-1">Tasas de cambio (moneda de visualización)</h2>
        <p className="text-xs text-brand-textMuted mb-3">
          Los precios se guardan en USD; esto solo define cómo se muestran al cliente cuando elige
          ver Bolívares en el selector de moneda. (PayPal no usa una tasa fija — se calcula
          automáticamente con la comisión de cada paquete, ver más abajo "Precio PayPal"). Esta tasa
          es global — se guarda sola un segundo después de que dejás de escribir, sin necesidad de
          tocar "Guardar cambios".
        </p>
        <div className="grid sm:grid-cols-2 gap-3 max-w-md">
          {(Object.keys(CURRENCY_META) as Currency[])
            .filter((c) => c !== "USD" && c !== "PAYPAL")
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
        {products.map((product, productIndex) => {
          const isOpen = expandedId === product.id;
          return (
            <div key={product.id} className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
              <div className="w-full flex items-center gap-3 p-4">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveProductUp(product.id);
                    }}
                    disabled={productIndex === 0}
                    className="w-6 h-6 rounded border border-brand-border text-brand-textMuted hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center text-xs"
                    aria-label="Subir"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveProductDown(product.id);
                    }}
                    disabled={productIndex === products.length - 1}
                    className="w-6 h-6 rounded border border-brand-border text-brand-textMuted hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center text-xs"
                    aria-label="Bajar"
                  >
                    ▼
                  </button>
                </div>

                <button
                  onClick={() => setExpandedId(isOpen ? null : product.id)}
                  className="flex-1 flex items-center gap-4 text-left min-w-0"
                >
                  <label
                    className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-brand-surfaceLight cursor-pointer group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.imageUrl && (
                      <Image src={product.imageUrl} alt={product.name} fill sizes="56px" className="object-cover" />
                    )}
                    <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                      Cambiar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await fileToUploadedUrl(file, {
                            maxWidth: 800,
                            maxHeight: 800,
                            quality: 0.85,
                          });
                          updateProduct(product.id, { imageUrl: url });
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "No se pudo subir la imagen.");
                        }
                      }}
                    />
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{product.name}</div>
                    <div className="text-xs text-brand-textMuted">
                      {product.variations.length} paquetes · {product.fields.length} campos
                    </div>
                  </div>
                  <span className={clsx("transition-transform text-brand-textMuted shrink-0", isOpen && "rotate-180")}>
                    ▾
                  </span>
                </button>
              </div>

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
                      Descripción corta
                    </label>
                    <textarea
                      value={product.shortDescription ?? ""}
                      onChange={(e) => updateProduct(product.id, { shortDescription: e.target.value })}
                      className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2.5 text-sm leading-relaxed resize-y"
                      rows={2}
                      placeholder="Una o dos líneas — se ve junto al producto, arriba de los paquetes."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                      Descripción completa
                    </label>
                    <textarea
                      value={product.description ?? ""}
                      onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                      className="w-full bg-brand-surfaceLight border border-brand-border rounded-lg px-3 py-2.5 text-sm leading-relaxed resize-y"
                      rows={6}
                      placeholder="Explicá en detalle cómo funciona la recarga, requisitos de la cuenta, etc. — se muestra en su propia sección debajo del botón de compra."
                    />
                    <p className="text-[11px] text-brand-textMuted mt-1">
                      Los saltos de línea (Enter) se respetan tal cual en la página del producto —
                      usalos para separar párrafos.
                    </p>
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
                                  try {
                                    const url = await fileToUploadedUrl(file, {
                                      maxWidth: 300,
                                      maxHeight: 300,
                                      quality: 0.85,
                                    });
                                    updateVariation(product.id, v.id, { iconImageUrl: url });
                                  } catch (err) {
                                    alert(err instanceof Error ? err.message : "No se pudo subir la imagen.");
                                  }
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

                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted mb-1">
                      Productos relacionados (hasta 4 — se muestran al final de la página de este
                      producto)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {products
                        .filter((p) => p.id !== product.id)
                        .map((p) => {
                          const related = product.relatedSlugs ?? [];
                          const checked = related.includes(p.slug);
                          return (
                            <label
                              key={p.id}
                              className="flex items-center gap-1.5 text-xs text-brand-textMuted bg-brand-surfaceLight border border-brand-border rounded px-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={!checked && related.length >= 4}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...related, p.slug]
                                    : related.filter((s) => s !== p.slug);
                                  updateProduct(product.id, { relatedSlugs: next });
                                }}
                                className="accent-brand-primary shrink-0"
                              />
                              <span className="truncate">{p.name}</span>
                            </label>
                          );
                        })}
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

      <SaveBar onSave={save} saving={saving} error={saveError} />
    </div>
  );
}
