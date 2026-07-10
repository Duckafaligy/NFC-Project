/**
 * Central brand / site configuration.
 * Update values here to rebrand the whole site in one place.
 */
export const site = {
  name: "TapLink",
  tagline: "Tap. Connect. Grow.",
  description:
    "Premium NFC cards and tags that turn a single tap into more Google reviews, more followers, instant WiFi, menus, and links for your business.",
  // Contact + business details — replace with your real info.
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
    handlingDays: "1–2 business days",
    deliveryDays: "3–7 business days",
  },
} as const;

export type Site = typeof site;
