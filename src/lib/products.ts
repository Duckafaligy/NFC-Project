/**
 * Product catalog (single source of truth).
 *
 * This is a static catalog for the initial build, no database yet.
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
  /** Two accent colors (main, secondary) used for the product visual. */
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
      "Sits by your register. Customers tap their phone and land on your Google review page. No app, no typing.",
    description:
      "The best moment to ask for a review is right after you hand back the card reader. This card makes the ask easy. Your customer taps their phone to it, your Google review page opens, and they post while the receipt prints. We program it to your exact review link before it ships, so it works out of the box. More reviews push you up in Google Maps and win over the customer comparing you to the shop down the street.",
    basePrice: 14.99,
    customUpcharge: 10,
    features: [
      "Instant tap-to-review, no app required",
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
    accent: ["#F97316", "#FBBF24"],
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
      "A weighted counter stand that asks for the review so you don't have to. Every paying customer sees it.",
    description:
      "Some days you're too busy to ask. The stand asks for you. It sits next to your card reader with a clear “Tap here to leave us a review” message, so every paying customer gets the invitation, even during the lunch rush. The weighted base doesn't slide, tip, or walk away. A card can get buried under receipts. The stand can't.",
    basePrice: 29.99,
    customUpcharge: 12,
    features: [
      "Weighted base that stays put",
      "Clear “Tap for Reviews” call to action",
      "Programmed to your Google review link",
      "Acrylic and metal build",
      "Reprogrammable any time",
    ],
    useCases: ["Checkout counters", "Reception desks", "Food trucks", "Bars"],
    specs: [
      { label: "Material", value: "Acrylic + metal base" },
      { label: "Size", value: "100 × 150 mm" },
      { label: "Chip", value: "NTAG215" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#F472B6", "#FB923C"],
    popular: true,
  },
  {
    id: "social-card",
    slug: "social-media-card",
    name: "Social Media Card",
    category: "Social Media",
    formFactor: "Card",
    tagline: "Grow Instagram, TikTok and Facebook in one tap",
    summary:
      "One tap opens your profile so customers can follow you on the spot, not later.",
    description:
      "Nobody remembers a handle they heard once. With this card, a single tap opens your Instagram, TikTok, or Facebook (or a hub with all of them) so customers hit follow before they walk away. Made for events, pop-ups, and any counter where people are already holding their phones.",
    basePrice: 14.99,
    customUpcharge: 10,
    features: [
      "Link one profile or a full link hub",
      "Instant follow, no searching handles",
      "Great for events and pop-ups",
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
    accent: ["#EC4899", "#8B5CF6"],
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
      "The last business card you'll ever print. Tap a phone and share your name, number, email, website, and socials in one go. They save your contact with one button. Update your details whenever they change and the card keeps working. One card, unlimited shares.",
    basePrice: 19.99,
    customUpcharge: 12,
    features: [
      "Contact, website and socials in one tap",
      "Save-to-contacts in a single button",
      "Update your details any time",
      "PVC or brushed metal options",
      "One card, unlimited shares",
    ],
    useCases: ["Sales & real estate", "Consultants", "Networking", "Executives"],
    specs: [
      { label: "Material", value: "PVC or brushed metal" },
      { label: "Size", value: "85.6 × 54 mm (card)" },
      { label: "Chip", value: "NTAG215" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#3B82F6", "#22D3EE"],
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
      "Give guests your menu without printing a single page. Stick these slim tags on tables and a tap opens your up-to-date digital menu. Change prices or items any time without reprinting. Cleaner tables, faster ordering, zero paper waste.",
    basePrice: 9.99,
    customUpcharge: 8,
    features: [
      "Opens your digital menu instantly",
      "Update the menu without reprinting",
      "Slim, table-friendly sticker",
      "Water and spill resistant",
      "Sold individually or in packs",
    ],
    useCases: ["Restaurants", "Cafés & bars", "Food trucks", "Hotels"],
    specs: [
      { label: "Material", value: "Waterproof vinyl" },
      { label: "Size", value: "30 mm round" },
      { label: "Chip", value: "NTAG213" },
      { label: "Range", value: "Up to 3 cm" },
    ],
    accent: ["#10B981", "#84CC16"],
  },
  {
    id: "wifi-tag",
    slug: "wifi-tag",
    name: "WiFi Tag",
    category: "WiFi",
    formFactor: "Sticker",
    tagline: "Guest WiFi with a single tap",
    summary:
      "Guests tap to join your WiFi. No passwords read out loud, no sticky notes on the wall.",
    description:
      "Share guest WiFi the modern way. A tap connects phones to your network automatically. Nobody spells out a password, nobody photographs a note taped to the register. When you change the password, reprogram the tag and keep going.",
    basePrice: 9.99,
    customUpcharge: 8,
    features: [
      "One-tap WiFi join, no typing",
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
    accent: ["#0EA5E9", "#6366F1"],
  },
  {
    id: "keychain-tag",
    slug: "keychain-tag",
    name: "Keychain Tag",
    category: "All-in-One",
    formFactor: "Keychain",
    tagline: "Your link, always on your keys",
    summary:
      "A rugged keychain tag you can tap to any phone, anywhere you work.",
    description:
      "Carry your link everywhere. This keychain tag points to your reviews, socials, website, or a link hub, and you tap it to any customer's phone on the spot. Built with an epoxy coating that survives keys, pockets, and job sites. Made for people whose counter is wherever they're standing.",
    basePrice: 12.99,
    customUpcharge: 9,
    features: [
      "Point it at any link you like",
      "Rugged epoxy-coated build",
      "Clips to your keys",
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
    accent: ["#F59E0B", "#F97316"],
  },
  {
    id: "allinone-card",
    slug: "all-in-one-card",
    name: "All-in-One Link Card",
    category: "All-in-One",
    formFactor: "Card",
    tagline: "Reviews, socials, menu and WiFi on one card",
    summary:
      "A single tap opens a branded hub with every link your business needs.",
    description:
      "One card, every link. A tap opens a branded hub with your Google reviews, Instagram, Facebook, website, menu, and WiFi in one place. Rearrange the links whenever your priorities change. If you can't pick one thing to promote, don't.",
    basePrice: 24.99,
    customUpcharge: 12,
    features: [
      "Branded hub with all your links",
      "Reviews, socials, menu, WiFi and website",
      "Rearrange links any time",
      "PVC or brushed metal options",
      "One tap, everything",
    ],
    useCases: ["Full-service businesses", "Multi-location brands", "Agencies", "Franchises"],
    specs: [
      { label: "Material", value: "PVC or brushed metal" },
      { label: "Size", value: "85.6 × 54 mm (card)" },
      { label: "Chip", value: "NTAG216 (888 bytes)" },
      { label: "Range", value: "Up to 4 cm" },
    ],
    accent: ["#14B8A6", "#3B82F6"],
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
