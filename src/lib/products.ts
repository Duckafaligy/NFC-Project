/**
 * Product catalog (single source of truth).
 *
 * Two real products: the Google review card and the Instagram card (both
 * portrait NFC cards, not horizontal business cards). The cards are
 * double-sided — white on one face, black on the other — so there is no
 * colour option to pick; you get both by flipping it.
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

export type ProductCategory = "Google Reviews" | "Instagram";

export type FormFactor = "Card";

/**
 * Which SVG artwork ProductVisual renders for a product (see
 * components/ProductVisual). Each product's real card design.
 */
export type VisualKind = "google" | "instagram";

/** Standard price for the NFC cards. */
export const STANDARD_PRICE = 34.99;
/** Added when the customer chooses a custom design ($42.99 total). */
export const CUSTOM_UPCHARGE = 8;
/**
 * Added on top of the custom price when WE design the card for the customer.
 * Covers the design labour.
 */
export const DESIGN_LABOUR_FEE = 4.99;

/**
 * Default per-product stock. The live number is managed from
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
  /** Which artwork ProductVisual renders. */
  visual: VisualKind;
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
  { label: "Material", value: "Matte PVC, double-sided" },
  { label: "Size", value: "54 × 85.6 mm (portrait card)" },
  { label: "Chip", value: "NTAG215 (504 bytes)" },
  { label: "Tap range", value: "Up to 4 cm" },
];

/** Every card is white on one face and black on the other — flip to switch. */
const REVERSIBLE_NOTE =
  "White on one side, black on the other. Flip it to match your counter — there is no colour to choose, you get both.";

export const products: Product[] = [
  {
    id: "review-card",
    slug: "google-review-card",
    name: "Google Review Card",
    category: "Google Reviews",
    formFactor: "Card",
    tagline: "Turn happy customers into 5-star reviews",
    summary:
      "A portrait tap card for your counter. Customers tap their phone and land on your Google review page. White one side, black the other.",
    description:
      "The best moment to ask for a review is right after you hand back the card reader. The customer is happy, their phone is already in their hand, and the memory is fresh. This card makes that ask take one sentence. They tap their phone to it, your Google review page opens, and they post while the receipt prints. " +
      REVERSIBLE_NOTE +
      " We program the card to your exact review link before it ships, so it works the moment you unbox it.",
    example:
      "A two-chair barbershop keeps one card taped flat next to the card reader. After each cut, one line: “Mind leaving us a quick review? Tap your phone here.” At 15 customers a day, even two yeses a day is around 50 new reviews a month. That moves a 4.2-star page with 30 reviews into a 4.7-star page with hundreds, and that is the difference customers see when they search “barber near me.”",
    basePrice: STANDARD_PRICE,
    // Not customizable by default (sourced ready-made). Turn on from the
    // dashboard by setting a custom price.
    customUpcharge: null,
    features: [
      "Instant tap-to-review, no app required",
      "Double-sided: white one face, black the other",
      "Works with iPhone and Android",
      "Programmed to your exact Google review link before shipping",
      "Waterproof, scratch-resistant matte PVC",
      "Reprogrammable free if your link ever changes",
    ],
    useCases: ["Restaurants & cafés", "Salons & barbershops", "Contractors", "Retail counters"],
    specs: CARD_SPECS,
    box: [
      "1 × portrait NFC card, programmed to your Google review link",
      "Counter-side setup guide with the exact script to use",
      "Adhesive strip for mounting flat on a counter",
    ],
    accent: ["#4285F4", "#FBBF24"],
    visual: "google",
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
      "A portrait tap card in the Instagram gradient. One tap opens your profile so customers follow you on the spot, not later.",
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
    ],
    useCases: ["Creators & influencers", "Pop-up shops", "Events & markets", "Personal brands"],
    specs: CARD_SPECS,
    box: [
      "1 × portrait NFC card, programmed to your Instagram profile",
      "Quick-start guide with three ways to hand it over naturally",
    ],
    accent: ["#DD2A7B", "#F58529"],
    visual: "instagram",
    popular: true,
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

export const categories: ProductCategory[] = ["Google Reviews", "Instagram"];
