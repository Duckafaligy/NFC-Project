/**
 * Central brand / site configuration.
 * Update values here to rebrand the whole site in one place.
 */

/** Placeholder markers, so the dashboard can flag anything still unset. */
export const PLACEHOLDER_EMAIL = "hello@taplink.example";

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
   * Customer-facing contact address. It appears on all four legal pages, the
   * order success page and the footer of every Stripe invoice — so leaving it
   * as the placeholder means customers are told to write to an address that
   * does not exist. Set `NEXT_PUBLIC_CONTACT_EMAIL`.
   */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || PLACEHOLDER_EMAIL,
  phone: "(555) 000-0000",
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
    deliveryDays: "3-10 business days",
    /**
     * Destination + quantity based shipping (in the store currency, CAD).
     * Checkout asks which
     * region the buyer is in and how many cards they're ordering, then binds
     * the matching rate to the Stripe session and locks the shipping address
     * to that zone's countries — so the rate always matches where it's going.
     *
     * Rates scale in brackets (`tiers`), not per-card: several cards ship in
     * one mailer, so the price steps up at set quantities instead of adding
     * the same amount for every card. Each tier is `{ minQty, price }`; the
     * charge is the price of the highest tier whose `minQty` is <= the order
     * quantity. Keep tiers sorted by `minQty` ascending, starting at 1.
     *
     * Edit tiers, delivery estimates, and countries here in one place; every
     * country in shipping_address_collection must belong to exactly one zone.
     */
    zones: [
      {
        // Home base: shipping within Canada is domestic (cheapest) and the
        // default selection. Listed first so it's the default zone.
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
      {
        // Cross-border from Canada: a step up from domestic.
        id: "us",
        label: "United States",
        countries: ["US"],
        tiers: [
          { minQty: 1, price: 4.99 },
          { minQty: 2, price: 7.49 },
          { minQty: 5, price: 12.99 },
          { minQty: 10, price: 16.99 },
          { minQty: 25, price: 24.99 },
          { minQty: 50, price: 34.99 },
          { minQty: 100, price: 49.99 },
        ],
        etaMin: 5,
        etaMax: 10,
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
