import type { MetadataRoute } from "next";
import { fetchProductSlugsServer } from "@/lib/homeData.server";

const BASE_URL = "https://topgamerpro.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProductSlugsServer();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/soporte`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/como-recargar`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/politica-reembolso`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politica-privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/productos/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
