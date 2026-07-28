/**
 * Product catalog (single source of truth).
 *
 * Every product is the SAME physical NFC card, just programmed (routed)
 * differently: Google reviews, Instagram, menu, or website. Because of that,
 * stock is one shared pool of cards (CARD_STOCK below), not a per-product
 * count.
 *
 * Pricing: cards are $34.99 standard, $42.99 custom, and "we design it" adds
 * the $4.99 design labour fee on top of custom. Prices here are the catalog
 * defaults — the owner can override each product's price live from
 * /admin-dashboard (see lib/adminStore price overrides). The only automatic
 * discount is the site-wide pre-order window (lib/site.ts).
 *
 * This is a static catalog, no database. The live stock pool, price
 * overrides, and pre-order flag live in lib/adminStore, managed from
 * /admin-dashboard.
 */

export type ProductCategory = "Google Reviews" | "Instagram" | "Menu" | "Website";

export type FormFactor = "Card";

/**
 * Which SVG artwork ProductVisual renders for a product (see
 * components/ProductVisual). Each product's real card design.
 */
export type VisualKind = "google" | "instagram" | "menu" | "website";

/** A physical colourway a product can be printed in (e.g. Google black/white). */
export interface CardColor {
  id: string;
  label: string;
  /** Hex used for the picker swatch and to tint the product visual. */
  swatch: string;
}

/** Standard price for every card. */
export const STANDARD_PRICE = 34.99;
/** Added when the customer chooses a custom design ($42.99 total). */
export const CUSTOM_UPCHARGE = 8;
/**
 * Added on top of the custom price when WE design the card for the customer.
 * Covers the design labour.
 */
export const DESIGN_LABOUR_FEE = 4.99;

/**
 * Shared stock default: all five products draw from ONE pool because they
 * are the same physical card. The live number is managed from
 * /admin-dashboard (lib/adminStore) and decremented automatically by the
 * Stripe webhook when an order is paid; this constant is only the fallback
 * before any admin value exists.
 */
export const DEFAULT_CARD_STOCK = 50;
/** Size of one print run (the stock bar shows the pool out of this). */
export const STOCK_BATCH = 50;
/** At or below this the UI switches to the amber "only N left" state. */
export const LOW_STOCK = 10;

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
  /** A concrete, real-world usage example shown on the detail page. */
  example: string;
  /** Base price for a standard (non-custom) design. */
  basePrice: number;
  /**
   * Extra cost for a custom (own-branding) design. `null` means the product
   * is NOT customizable — the custom option is hidden entirely. The owner can
   * turn custom on/off per product from /admin-dashboard by setting or
   * clearing its custom price.
   */
  customUpcharge: number | null;
  features: string[];
  useCases: string[];
  specs: { label: string; value: string }[];
  /** What arrives in the package. */
  box: string[];
  /** Two accent colors (main, secondary) used for the product visual. */
  accent: [string, string];
  /** Which card artwork ProductVisual renders. */
  visual: VisualKind;
  /**
   * Optional physical colourways the buyer can pick (e.g. the Google card in
   * black or white). First entry is the default. Omit for single-colour cards.
   */
  colors?: CardColor[];
  popular?: boolean;
}

/** A live price override for a product, set from the admin dashboard. */
export interface PriceOverride {
  basePrice: number;
  /** null = custom option disabled for this product. */
  customUpcharge: number | null;
}

/** Whether a product offers a custom (own-branding) option right now. */
export function isCustomizable(customUpcharge: number | null): boolean {
  return customUpcharge != null;
}

/**
 * Apply an admin price override to a product, returning a product with the
 * overridden prices (or the original when there's no override). Keeps price
 * logic identical everywhere — configurator, cards, and the Stripe route all
 * pass the effective product through configuredUnitPrice.
 */
export function withPriceOverride(
  product: Product,
  override?: PriceOverride | null,
): Product {
  if (!override) return product;
  return {
    ...product,
    basePrice: override.basePrice,
    customUpcharge: override.customUpcharge,
  };
}

const CARD_SPECS = [
  { label: "Material", value: "Matte PVC" },
  { label: "Size", value: "85.6 × 54 mm (credit card)" },
  { label: "Chip", value: "NTAG215 (504 bytes)" },
  { label: "Tap range", value: "Up to 4 cm" },
];

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
      "The best moment to ask for a review is right after you hand back the card reader. The customer is happy, their phone is already in their hand, and the memory is fresh. This card makes that ask take one sentence. They tap their phone to it, your Google review page opens, and they post while the receipt prints. We program the card to your exact review link before it ships, so it works the moment you unbox it. More reviews push you up in Google Maps results and win over the customer who is comparing you to the shop down the street.",
    example:
      "A two-chair barbershop keeps one card taped flat next to the card reader. After each cut, one line: “Mind leaving us a quick review? Tap your phone here.” At 15 customers a day, even two yeses a day is around 50 new reviews a month. That moves a 4.2-star page with 30 reviews into a 4.7-star page with hundreds, and that is the difference customers see when they search “barber near me.”",
    basePrice: STANDARD_PRICE,
    // Not customizable by default (sourced ready-made). Turn on from the
    // dashboard by setting a custom price.
    customUpcharge: null,
    features: [
      "Instant tap-to-review, no app required",
      "Choose black or white to match your counter",
      "Works with iPhone and Android",
      "Programmed to your exact Google review link before shipping",
      "Waterproof, scratch-resistant matte PVC",
      "Reprogrammable free if your link ever changes",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Restaurants & cafés", "Salons & barbershops", "Contractors", "Retail counters"],
    specs: CARD_SPECS,
    box: [
      "1 × NFC card, programmed to your Google review link",
      "Counter-side setup guide with the exact script to use",
      "Adhesive strip for mounting flat on a counter",
    ],
    accent: ["#4285F4", "#FBBF24"],
    visual: "google",
    colors: [
      { id: "black", label: "Black", swatch: "#111111" },
      { id: "white", label: "White", swatch: "#FFFFFF" },
    ],
    popular: true,
  },
  {
    id: "instagram-card",
    slug: "instagram-card",
    name: "Instagram Card",
    category: "Instagram",
    formFactor: "Card",
    tagline: "Grow your Instagram in one tap",
    summary:
      "One tap opens your Instagram profile so customers follow you on the spot, not later.",
    description:
      "Nobody remembers a handle they heard once, and nobody searches for it when they get home. This card closes that gap. A single tap opens your Instagram profile with the follow button right there. The follow happens while the customer is still standing in front of you, which is the only moment it reliably happens at all. We program the card to your exact profile before it ships, so it works the moment you unbox it.",
    example:
      "A lash tech finishes an appointment and hands over the card with the mirror: “Tap this if you want to see your set on our page this week.” The client follows on the spot to find her photo later. Every appointment becomes a follower, and every follower sees the next month of openings.",
    basePrice: STANDARD_PRICE,
    // Not customizable by default (sourced ready-made). Turn on from the
    // dashboard by setting a custom price.
    customUpcharge: null,
    features: [
      "Opens your Instagram profile in one tap",
      "Follow happens on the spot, not “later”",
      "Works with iPhone and Android",
      "Programmed to your exact profile before shipping",
      "Durable matte finish that survives a pocket",
      "Reprogrammable free when your handle changes",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Creators & influencers", "Pop-up shops", "Events & markets", "Personal brands"],
    specs: CARD_SPECS,
    box: [
      "1 × NFC card, programmed to your Instagram profile",
      "Quick-start guide with three ways to hand it over naturally",
    ],
    accent: ["#DD2A7B", "#F58529"],
    visual: "instagram",
    popular: true,
  },
  {
    id: "menu-card",
    slug: "menu-card",
    name: "Menu Card",
    category: "Menu",
    formFactor: "Card",
    tagline: "Your menu, one tap away",
    summary:
      "A tap card for tables and counters that opens your digital menu instantly.",
    description:
      "Give guests your menu without printing a single page. The card sits on tables, the counter, or the host stand, and a tap opens your up-to-date digital menu. Raise a price, 86 a dish, add a special: edit the menu once online and every table is current instantly. No reprinting, no laminating, no sticky paper menus that need replacing every month.",
    example:
      "A brunch spot changes its specials every Saturday morning. The owner edits one Google Doc at 7am, and by open, every table's card points to the new list. The old routine was printing, cutting, and swapping 40 paper inserts. The new routine is typing.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Opens your digital menu instantly",
      "Update the menu online, every table is current",
      "Waterproof matte PVC that survives table wipes",
      "Works with iPhone and Android",
      "Reprogrammable free if your menu link changes",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Restaurants", "Cafés & bars", "Food trucks", "Hotels"],
    specs: CARD_SPECS,
    box: [
      "1 × NFC card, programmed to your menu link",
      "Adhesive strip for mounting flat on tables or counters",
      "Placement guide for tables, bars, and host stands",
    ],
    accent: ["#10B981", "#84CC16"],
    visual: "menu",
    popular: true,
  },
  {
    id: "website-card",
    slug: "website-card",
    name: "Website Card",
    category: "Website",
    formFactor: "Card",
    tagline: "Your website, opened in one tap",
    summary:
      "One tap sends customers straight to your website, booking page, or online store.",
    description:
      "Your website only works if people actually get there, and “just search for us” loses most of them on the way. This card removes the trip. A tap opens your homepage, booking calendar, or online store directly on the customer's phone while they are standing in front of you. Point it at whatever page earns you money: bookings during the week, the shop before the holidays, the waitlist when you are slammed. Change the destination any time without touching the card.",
    example:
      "A tattoo artist keeps the card at the front desk. Walk-ins who can't be fitted in today tap it and land on the booking calendar, and the artist watches the empty Tuesday slots fill themselves. Before the card, “book online later” converted almost nobody. Now the booking happens in the shop.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Routes to any page: homepage, booking, or store",
      "Change the destination any time, same card",
      "Works with iPhone and Android",
      "Waterproof, scratch-resistant matte PVC",
      "Reprogrammable free, forever",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Bookings & appointments", "Online stores", "Portfolios", "Waitlists & signups"],
    specs: CARD_SPECS,
    box: [
      "1 × NFC card, programmed to your website or booking page",
      "Setup guide for changing the destination later",
      "Adhesive strip for mounting flat on a counter",
    ],
    accent: ["#0EA5E9", "#6366F1"],
    visual: "website",
  },
];

/**
 * The full (pre-discount) unit price for a configuration. Used by the
 * configurator UI and the Stripe route so both always agree.
 */
export function configuredUnitPrice(
  product: Product,
  designType: "standard" | "custom",
  customMethod?: "upload" | "we-design",
): number {
  let price = product.basePrice;
  // Custom only applies when the product is customizable (has a custom price).
  if (designType === "custom" && product.customUpcharge != null) {
    price += product.customUpcharge;
    if (customMethod === "we-design") price += DESIGN_LABOUR_FEE;
  }
  return Math.round(price * 100) / 100;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return products.map((p) => p.slug);
}

export const categories: ProductCategory[] = [
  "Google Reviews",
  "Instagram",
  "Menu",
  "Website",
];
