import Image from "next/image";

// Proporción real del archivo (1536x1024px) — antes esto asumía un banner
// ancho (5:1) del logo viejo; con width/height fijos + width:auto en CSS,
// el navegador usa la relación de esos atributos para el layout box, así
// que si no coinciden con la proporción real de la imagen, esta se
// estira/achica para "llenar" esa caja en vez de mantenerse proporcional.
const ASPECT_RATIO = 1536 / 1024;

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? 32 : size === "lg" ? 96 : 44;
  return (
    <span className="flex items-center">
      <Image
        src="/logo.png"
        alt="TopGamerPro"
        width={Math.round(h * ASPECT_RATIO)}
        height={h}
        style={{ height: h, width: "auto" }}
        priority
      />
    </span>
  );
}
