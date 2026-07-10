/**
 * Product catalog (single source of truth).
 *
 * This is a static catalog for the initial build — no database yet.
 * Swap `products` for a CMS/DB fetch later without changing the UI, as long
 * as the shape of `Product` stays the same.
 */

export type ProductCategory =
  | "Google Reviews"
  | "Social Media"
  | "Digital Business Card"
  | "Menu"
  | "WiFi"
  | "All-in-One";

export type FormFactor = "Card" | "Sticker" | "Keychain" | "Stand" | "Band";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  formFactor: FormFactor;
  tagline: string;
  /** Short description used on cards/grids. */
  summary: string;
  /** Long description used on the product detail page. */
  description: string;
  /** Base price for a standard (non-custom) design. */
  basePrice: number;
  /** Additional cost when the customer chooses a custom design. */
  customUpcharge: number;
  features: string[];
  useCases: string[];
  specs: { label: string; value: string }[];
  /** Two-stop gradient (from, to) used for the cinematic product visual. */
  accent: [string, string];
  popular?: boolean;
}

export const products: Product[] = [
  {
    id: "review-card",
    slug: "google-review-card",
    name: "Google Review Card",
    category: "Google Reviews",
    formFactor: "Card",
    tagline: "Turn happy customers into 5-star reviews",
    summary:
      "A premium tap card that sends customers straight to your Google review page — no app, no typing.",
    description:
      "The fastest way to grow your Google rating. Customers tap the card with their phone and land directly on your review page. More reviews mean higher search ranking, more trust, and more walk-ins. Perfect for the counter, the checkout, or handing out after a great interaction.",
    basePrice: 14.99,
    customUpcharge: 10,
    features: [
      "Instant tap-to-review — no app required",
      "Works on virtually all modern smartphones",
      "Direct link to your Google Business review page",
      "Waterproof, scratch-resistant PVC",
      "Reprogrammable if your link changes",
    ],
    useCases: ["Restaurants & cafés", "Salons & barbershops", "Contractors", "Retail counters"],
    specs: [
      { label: "Material", value: "Matte PVC" },
      { label: "Size", value: "85.6 × 54 mm (card)" },
      { label: "Chip", value: "NTAG215 (504 bytes)" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#f59e0b", "#ef4444"],
    popular: true,
  },
  {
    id: "review-stand",
    slug: "google-review-stand",
    name: "Google Review Stand",
    category: "Google Reviews",
    formFactor: "Stand",
    tagline: "A “Tap for Reviews” display for your counter",
    summary:
      "A weighted tabletop stand that invites every customer to leave a review as they pay.",
    description:
      "Put reviews on autopilot. This weighted acrylic stand sits on your counter with a clear “Tap here to leave us a review” call to action. Every customer who pays sees it — and tapping takes two seconds. Ideal for high-traffic counters where a card can get lost.",
    basePrice: 29.99,
    customUpcharge: 12,
    features: [
      "Weighted base — won’t tip or slide",
      "Eye-catching “Tap for Reviews” design",
      "Programmed to your Google review link",
      "Premium acrylic + metal finish",
      "Reprogrammable any time",
    ],
    useCases: ["Checkout counters", "Reception desks", "Food trucks", "Bars"],
    specs: [
      { label: "Material", value: "Acrylic + metal base" },
      { label: "Size", value: "100 × 150 mm" },
      { label: "Chip", value: "NTAG215" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#f97316", "#db2777"],
    popular: true,
  },
  {
    id: "social-card",
    slug: "social-media-card",
    name: "Social Media Card",
    category: "Social Media",
    formFactor: "Card",
    tagline: "Grow your Instagram, TikTok & Facebook in one tap",
    summary:
      "One tap opens your social profile so customers can follow you on the spot.",
    description:
      "Stop losing followers to forgotten handles. A single tap opens your Instagram, TikTok, or Facebook — or a link hub with all of them — so customers follow you before they walk away. Great for events, pop-ups, and anywhere you want to build an audience.",
    basePrice: 14.99,
    customUpcharge: 10,
    features: [
      "Link one profile or a full link hub",
      "Instant follow — no searching handles",
      "Perfect for events and pop-ups",
      "Durable matte finish",
      "Reprogrammable in seconds",
    ],
    useCases: ["Creators & influencers", "Pop-up shops", "Events & markets", "Personal brands"],
    specs: [
      { label: "Material", value: "Matte PVC" },
      { label: "Size", value: "85.6 × 54 mm (card)" },
      { label: "Chip", value: "NTAG215" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#8b5cf6", "#ec4899"],
  },
  {
    id: "business-card",
    slug: "digital-business-card",
    name: "Digital Business Card",
    category: "Digital Business Card",
    formFactor: "Card",
    tagline: "Share everything about you with one tap",
    summary:
      "A smart business card that shares your contact, website, and socials instantly.",
    description:
      "The last business card you’ll ever need. Tap a phone and share your name, phone, email, website, and socials instantly — they can save your contact with one button. Never run out, never reprint. Looks premium and impossible to lose.",
    basePrice: 19.99,
    customUpcharge: 12,
    features: [
      "Share contact, website & socials in one tap",
      "Save-to-contacts in a single button",
      "Update your details any time",
      "Premium metal or PVC options",
      "One card, unlimited shares",
    ],
    useCases: ["Sales & real estate", "Consultants", "Networking", "Executives"],
    specs: [
      { label: "Material", value: "PVC or brushed metal" },
      { label: "Size", value: "85.6 × 54 mm (card)" },
      { label: "Chip", value: "NTAG215" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#6d5efc", "#22d3ee"],
    popular: true,
  },
  {
    id: "menu-tag",
    slug: "menu-tag",
    name: "Menu Tag",
    category: "Menu",
    formFactor: "Sticker",
    tagline: "Your menu, one tap away",
    summary:
      "A slim tap sticker for tables that opens your digital menu instantly.",
    description:
      "Give guests your menu without printing a single page. Stick these slim tags on tables, and a tap opens your up-to-date digital menu — change prices or items any time without reprinting. Cleaner tables, happier guests, zero waste.",
    basePrice: 9.99,
    customUpcharge: 8,
    features: [
      "Opens your digital menu instantly",
      "Update the menu without reprinting",
      "Slim, table-friendly sticker",
      "Water- and spill-resistant",
      "Sold individually or in packs",
    ],
    useCases: ["Restaurants", "Cafés & bars", "Food trucks", "Hotels"],
    specs: [
      { label: "Material", value: "Waterproof vinyl" },
      { label: "Size", value: "30 mm round" },
      { label: "Chip", value: "NTAG213" },
      { label: "Range", value: "Up to 3 cm" },
    ],
    accent: ["#10b981", "#14b8a6"],
  },
  {
    id: "wifi-tag",
    slug: "wifi-tag",
    name: "WiFi Tag",
    category: "WiFi",
    formFactor: "Sticker",
    tagline: "Guest WiFi with a single tap",
    summary:
      "Guests tap to join your WiFi — no passwords typed, no photos of a sticky note.",
    description:
      "Share guest WiFi the modern way. A tap connects phones to your network automatically — no more spelling out passwords or taping notes to the wall. Perfect for cafés, salons, offices, and rentals.",
    basePrice: 9.99,
    customUpcharge: 8,
    features: [
      "One-tap WiFi join — no password typing",
      "Great for guests and customers",
      "Discreet sticker form factor",
      "Reprogrammable when your password changes",
      "Sold individually or in packs",
    ],
    useCases: ["Cafés & lounges", "Salons", "Airbnb & rentals", "Offices"],
    specs: [
      { label: "Material", value: "Waterproof vinyl" },
      { label: "Size", value: "30 mm round" },
      { label: "Chip", value: "NTAG213" },
      { label: "Range", value: "Up to 3 cm" },
    ],
    accent: ["#22d3ee", "#3b82f6"],
  },
  {
    id: "keychain-tag",
    slug: "keychain-tag",
    name: "Keychain Tag",
    category: "All-in-One",
    formFactor: "Keychain",
    tagline: "Your link, always on your keys",
    summary:
      "A durable keychain tag you can hand-tap anywhere to share any link.",
    description:
      "Carry your link everywhere. This rugged keychain tag can point to your reviews, socials, website, or a link hub — tap it to any phone, any time. Built to survive keys, pockets, and daily life.",
    basePrice: 12.99,
    customUpcharge: 9,
    features: [
      "Point it at any link you like",
      "Rugged epoxy-coated build",
      "Always with you — clips to keys",
      "Reprogrammable any time",
      "Great giveaway item",
    ],
    useCases: ["On-the-go creators", "Trades & field work", "Giveaways", "Personal use"],
    specs: [
      { label: "Material", value: "Epoxy-coated" },
      { label: "Size", value: "32 mm disc" },
      { label: "Chip", value: "NTAG215" },
      { label: "Range", value: "Up to 3 cm" },
    ],
    accent: ["#a855f7", "#6366f1"],
  },
  {
    id: "allinone-card",
    slug: "all-in-one-card",
    name: "All-in-One Link Card",
    category: "All-in-One",
    formFactor: "Card",
    tagline: "Reviews, socials, menu & WiFi — one card",
    summary:
      "A single tap opens a branded hub with every link your business needs.",
    description:
      "Why choose? This card opens a branded link hub with everything at once — Google reviews, Instagram, Facebook, your website, menu, and WiFi. One card does it all, and you can rearrange links any time from your dashboard.",
    basePrice: 24.99,
    customUpcharge: 12,
    features: [
      "Branded hub with all your links",
      "Reviews, socials, menu, WiFi & website",
      "Rearrange links any time",
      "Premium finish options",
      "One tap, everything",
    ],
    useCases: ["Full-service businesses", "Multi-location brands", "Agencies", "Franchises"],
    specs: [
      { label: "Material", value: "PVC or brushed metal" },
      { label: "Size", value: "85.6 × 54 mm (card)" },
      { label: "Chip", value: "NTAG216 (888 bytes)" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#6d5efc", "#22d3ee"],
    popular: true,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return products.map((p) => p.slug);
}

export const categories: ProductCategory[] = [
  "Google Reviews",
  "Social Media",
  "Digital Business Card",
  "Menu",
  "WiFi",
  "All-in-One",
];
