import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Crawl rules. The storefront is open; anything that is per-customer or
 * operational is kept out of the index:
 *
 *  - /admin-dashboard — password walled, but no reason to advertise it.
 *  - /api — no crawlable content.
 *  - /checkout — cart state, nothing to rank.
 *  - /t and /tag — a customer's own tag redirect and claim pages. These carry
 *    unguessable codes and must never be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-dashboard", "/api/", "/checkout", "/t/", "/tag/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
