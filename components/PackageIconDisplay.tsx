import Image from "next/image";
import type { ProductVariation } from "@/lib/types";
import PackageIconGraphic from "./PackageIcon";

// Muestra el ícono personalizado que subió el admin para este paquete
// (variation.iconImageUrl); si no hay ninguno subido todavía, cae en el
// set de íconos genéricos como respaldo temporal.
export default function PackageIconDisplay({
  variation,
  className,
}: {
  variation: Pick<ProductVariation, "icon" | "iconImageUrl">;
  className?: string;
}) {
  const cls = className ?? "w-5 h-5";

  if (variation.iconImageUrl) {
    return (
      <span className={`relative inline-block rounded ${cls}`}>
        <Image src={variation.iconImageUrl} alt="" fill className="object-contain" />
      </span>
    );
  }

  return <PackageIconGraphic icon={variation.icon} className={cls} />;
}
