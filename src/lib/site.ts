/**
 * Central brand / site configuration.
 * Update values here to rebrand the whole site in one place.
 */

/** Default contact address, overridable per-environment (see `site.email`). */
export const CONTACT_EMAIL = "brendanhllau@gmail.com";

/**
 * Public base URL. Resolution order:
 *
 *  1. `NEXT_PUBLIC_SITE_URL` — set this once you have a custom domain.
 *  2. `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` — Vercel fills this in
 *     automatically when "Automatically expose System Environment Variables"
 *     is enabled in project settings, so the production domain is correct
 *     without configuring anything.
 *  3. localhost, for `next dev`.
 *
 * This matters beyond metadata: it is the fallback origin for Stripe's
 * success/cancel redirects and for the product image URLs handed to Stripe,
 * which must be publicly fetchable.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const site = {
  name: "TapLink",
  tagline: "NFC cards that get you Google reviews",
  description:
    "NFC review cards and smart tags for local businesses. A customer taps their phone on the card and your Google review page opens. No app, no QR code. More reviews, more followers, instant menus and bookings.",
  /**
   * Customer-facing contact address, shown on all four legal pages, the order
   * success page and the footer of every Stripe invoice. Override with
   * `NEXT_PUBLIC_CONTACT_EMAIL` when a support@ address on a custom domain
   * exists — no code change needed, and nothing else has to be touched.
   */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || CONTACT_EMAIL,
  /**
   * No phone support. Left blank rather than shown as a placeholder, since a
   * number nobody answers is worse than none — `site.phone` is not rendered
   * anywhere while it is empty.
   */
  phone: "",
  url: resolveSiteUrl(),
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
  },
  /**
   * Store currency. `code` is the ISO 4217 currency Stripe charges in and
   * every price is formatted in. `locale` drives Intl formatting: en-US with
   * CAD renders prices as "CA$34.99" so it's unambiguous these are Canadian
   * dollars (helpful for US shoppers too). Change `code` to switch
   * the whole store's currency in one place; product prices in products.ts
   * are plain numbers interpreted in this currency.
   */
  currency: {
    code: "CAD",
    locale: "en-US",
  },
  // Shipping / fulfilment defaults surfaced across the store.
  shipping: {
    handlingDays: "1-2 business days",
    deliveryDays: "3-5 business days",
    /**
     * Quantity-based shipping (in the store currency, CAD).
     *
     * Canada only. Checkout binds this zone's rate for the order's billable
     * units to the Stripe session and locks the shipping address to the
     * zone's countries, so nothing outside Canada can be ordered.
     *
     * Rates scale in brackets (`tiers`), not per-card: several cards ship in
     * one mailer, so the price steps up at set quantities instead of adding
     * the same amount for every card. Each tier is `{ minQty, price }`; the
     * charge is the price of the highest tier whose `minQty` is <= the order
     * quantity. Keep tiers sorted by `minQty` ascending, starting at 1.
     *
     * Edit tiers, delivery estimates, and countries here in one place. Adding
     * a second zone brings back the destination picker at checkout on its
     * own — nothing else needs changing.
     */
    zones: [
      {
        // The only zone we ship to. Domestic Canada Post.
        id: "ca",
        label: "Canada",
        countries: ["CA"],
        tiers: [
          { minQty: 1, price: 2.49 },
          { minQty: 2, price: 3.98 },
          { minQty: 5, price: 7.47 },
          { minQty: 10, price: 9.99 },
          { minQty: 25, price: 14.99 },
          { minQty: 50, price: 19.99 },
          { minQty: 100, price: 29.99 },
        ],
        etaMin: 3,
        etaMax: 5,
      },
    ],
  },
  // Free maintenance window (days), surfaced across the store. No refunds:
  // within this window we correct any problem free, by return shipping or
  // an in-person visit.
  guaranteeDays: 30,
  /**
   * Pre-order window default. The LIVE flag is toggled from
   * /admin-dashboard (lib/adminStore) and overrides this; this value is the
   * fallback until an admin choice exists and the first-paint default.
   */
  preorder: {
    enabled: true,
    discount: 0.2,
    label: "Pre-order",
    shipNote: "Pre-orders ship in 2-3 weeks, in the order they were placed",
  },
} as const;

export type Site = typeof site;
