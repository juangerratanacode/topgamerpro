import type { MetadataRoute } from "next";

// Convención de Next.js App Router: este archivo se sirve solo en
// /manifest.webmanifest, y Next agrega el <link rel="manifest"> al head
// automáticamente — no hace falta declararlo a mano en metadata.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TopGamerPro",
    short_name: "TopGamerPro",
    description: "Recarga tus juegos favoritos en minutos. Pago Móvil y PayPal.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060F",
    theme_color: "#05060F",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
