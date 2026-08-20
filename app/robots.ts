import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/mi-cuenta", "/carrito"],
    },
    sitemap: "https://topgamerpro.com/sitemap.xml",
  };
}
