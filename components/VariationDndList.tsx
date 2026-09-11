"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableVariationRow from "./SortableVariationRow";
import type { ProductVariation } from "@/lib/types";

interface VariationDndListProps {
  productId: string;
  variations: ProductVariation[];
  onUpdateVariation: (productId: string, variationId: string, patch: Partial<ProductVariation>) => void;
  onRemoveVariation: (productId: string, variationId: string) => void;
  onReorderVariations: (productId: string, orderedIds: string[]) => void;
}

export default function VariationDndList({
  productId,
  variations,
  onUpdateVariation,
  onRemoveVariation,
  onReorderVariations,
}: VariationDndListProps) {
  // PointerSensor solo (no MouseSensor + TouchSensor por separado): cubre
  // mouse y touch a la vez. Un pequeño umbral de distancia evita que un
  // simple tap para editar el nombre/precio se interprete como el inicio
  // de un arrastre.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = variations.findIndex((v) => v.id === active.id);
    const newIndex = variations.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(variations, oldIndex, newIndex);
    onReorderVariations(productId, reordered.map((v) => v.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={variations.map((v) => v.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {variations.map((v) => (
            <SortableVariationRow
              key={v.id}
              variation={v}
              onUpdate={(patch) => onUpdateVariation(productId, v.id, patch)}
              onRemove={() => onRemoveVariation(productId, v.id)}
            />
          ))}
          {variations.length === 0 && <p className="text-xs text-brand-textMuted">Sin paquetes todavía.</p>}
        </div>
      </SortableContext>
    </DndContext>
  );
}
