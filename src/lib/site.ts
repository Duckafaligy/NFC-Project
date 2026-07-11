/**
 * Central brand / site configuration.
 * Update values here to rebrand the whole site in one place.
 */
export const site = {
  name: "TapLink",
  tagline: "NFC cards that get you Google reviews",
  description:
    "NFC review cards and smart tags for local businesses. A customer taps their phone on the card and your Google review page opens. No app, no QR code. More reviews, more followers, instant WiFi and menus.",
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
    flatRate: 4.99,
    freeThreshold: 50,
    handlingDays: "1-2 business days",
    deliveryDays: "3-7 business days",
  },
  // Money-back guarantee window (days), surfaced across the store.
  guaranteeDays: 30,
  /**
   * Pre-order window. While enabled, the discount applies to the whole cart
   * (shown in the UI and recomputed server-side for Stripe). Flip `enabled`
   * to false when the pre-order period ends and full pricing takes over.
   */
  preorder: {
    enabled: true,
    discount: 0.2,
    label: "Pre-order",
    shipNote: "Pre-orders ship in 2-3 weeks, in the order they were placed",
  },
} as const;

export type Site = typeof site;
