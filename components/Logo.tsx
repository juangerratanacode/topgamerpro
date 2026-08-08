import Image from "next/image";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? 32 : size === "lg" ? 96 : 44;
  return (
    <span className="flex items-center">
      <Image
        src="/logo.png"
        alt="RecargaTuJuego"
        width={h * 5}
        height={h}
        style={{ height: h, width: "auto" }}
        priority
      />
    </span>
  );
}
