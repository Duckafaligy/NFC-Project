/**
 * Central brand / site configuration.
 * Update values here to rebrand the whole site in one place.
 */
export const site = {
  name: "TapLink",
  tagline: "NFC cards that get you Google reviews",
  description:
    "NFC review cards and smart tags for local businesses. A customer taps their phone on the card and your Google review page opens. No app, no QR code. More reviews, more followers, instant menus and bookings.",
  // Contact + business details. Replace with your real info.
  email: "hello@taplink.example",
  phone: "(555) 000-0000",
  // Base URL used for metadata (set to your Vercel/production domain).
  url: "https://taplink.example",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
  },
  // Shipping / fulfilment defaults surfaced across the store.
  shipping: {
    handlingDays: "1-2 business days",
    deliveryDays: "3-14 business days",
    /**
     * Destination-based flat rates (USD). Checkout asks the buyer which
     * region they're in, then binds the matching rate to the Stripe session
     * and restricts the shipping address to that zone's countries — so the
     * rate charged always matches where it's going. Edit rates, delivery
     * estimates, and covered countries here in one place; every country in
     * shipping_address_collection must belong to exactly one zone.
     */
    zones: [
      {
        id: "us",
        label: "United States",
        countries: ["US"],
        rate: 4.99,
        etaMin: 3,
        etaMax: 5,
      },
      {
        id: "ca",
        label: "Canada",
        countries: ["CA"],
        rate: 9.99,
        etaMin: 5,
        etaMax: 10,
      },
      {
        id: "intl",
        label: "UK, Australia & New Zealand",
        countries: ["GB", "AU", "NZ"],
        rate: 14.99,
        etaMin: 7,
        etaMax: 14,
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
