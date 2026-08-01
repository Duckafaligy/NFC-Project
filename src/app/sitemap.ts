import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

/**
 * Sitemap for search engines. Product pages carry the highest priority since
 * they are what people search for; the legal pages are listed so they are
 * indexed but ranked low.
 *
 * URLs come from `site.url`, which resolves to the real production domain on
 * Vercel — see `resolveSiteUrl` in lib/site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...products.map((p) => ({
      url: `${site.url}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...["terms", "privacy", "shipping", "returns"].map((slug) => ({
      url: `${site.url}/legal/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
