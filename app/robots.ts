import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/staffgate7d3k", "/api", "/mi-cuenta", "/carrito"],
    },
    sitemap: "https://topgamerpro.com/sitemap.xml",
  };
}
