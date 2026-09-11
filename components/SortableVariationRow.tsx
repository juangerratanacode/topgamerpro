"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PackageIconDisplay from "./PackageIconDisplay";
import { fileToUploadedUrl } from "@/lib/image";
import type { ProductVariation } from "@/lib/types";

interface SortableVariationRowProps {
  variation: ProductVariation;
  onUpdate: (patch: Partial<ProductVariation>) => void;
  onRemove: () => void;
}

// Una fila de paquete del admin, arrastrable — mismo contenido que antes
// (ícono, nombre, precios), solo que ahora vive en su propio componente
// porque useSortable (el hook que hace posible arrastrarla) tiene que
// llamarse una vez por ítem, no se puede meter directo adentro de un
// .map() en el componente padre.
export default function SortableVariationRow({ variation: v, onUpdate, onRemove }: SortableVariationRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: v.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-brand-surfaceLight border border-brand-border rounded-lg p-2 space-y-1.5"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 text-brand-textMuted hover:text-white cursor-grab active:cursor-grabbing touch-none px-1"
          aria-label="Arrastrar para reordenar"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
            <path d="M7 4a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6-12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
        </button>
        <label className="relative shrink-0 cursor-pointer group">
          <PackageIconDisplay variation={v} className="w-8 h-8 rounded-md border border-brand-border" />
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
                const url = await fileToUploadedUrl(file, { maxWidth: 300, maxHeight: 300, quality: 0.85 });
                onUpdate({ iconImageUrl: url });
              } catch (err) {
                alert(err instanceof Error ? err.message : "No se pudo subir la imagen.");
              }
            }}
          />
        </label>
        <input
          value={v.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="flex-1 bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
          placeholder="Nombre del paquete"
        />
        <button onClick={onRemove} className="text-red-400 hover:text-red-300 text-xs font-bold px-2 shrink-0">
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 pl-1">
        <div>
          <label className="block text-[10px] text-brand-textMuted mb-0.5">Precio normal (USD)</label>
          <input
            type="number"
            step="0.01"
            value={v.priceUsd}
            onChange={(e) => onUpdate({ priceUsd: parseFloat(e.target.value) || 0 })}
            className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] text-brand-textMuted mb-0.5">Precio PayPal (USD, opcional)</label>
          <input
            type="number"
            step="0.01"
            value={v.priceUsdPaypal ?? ""}
            placeholder="igual al normal"
            onChange={(e) =>
              onUpdate({ priceUsdPaypal: e.target.value === "" ? undefined : parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-brand-bg border border-brand-border rounded px-2 py-1.5 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
