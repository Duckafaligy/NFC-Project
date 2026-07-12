import storeState from "@/data/store-state.json";

/**
 * Product catalog (single source of truth).
 *
 * Every product is the SAME physical NFC card, just programmed (routed)
 * differently: menu, website, Google reviews, social media, or the digital
 * business card hub. Because of that, stock is one shared pool of cards
 * (CARD_STOCK below), not a per-product count.
 *
 * Pricing: routing cards are $34.99 standard, $42.99 custom. The Digital
 * Business Card is the all-in-one flagship: $49.99 standard, $56.99 custom.
 * "We design it" adds the $4.99 design labour fee on top of custom.
 * The only discount is the site-wide pre-order window (lib/site.ts).
 *
 * This is a static catalog, no database. Stock and the pre-order flag live
 * in src/data/store-state.json, managed from /admin-dashboard.
 */

export type ProductCategory =
  | "Google Reviews"
  | "Social Media"
  | "Menu"
  | "Website"
  | "Digital Business Card";

export type FormFactor = "Card";

/** Standard price for every routing card. */
export const STANDARD_PRICE = 34.99;
/** Added when the customer chooses a custom design ($42.99 total). */
export const CUSTOM_UPCHARGE = 8;
/** Digital Business Card (all-in-one flagship) pricing. */
export const BUSINESS_PRICE = 49.99;
/** Its custom upcharge ($56.99 total). */
export const BUSINESS_CUSTOM_UPCHARGE = 7;
/**
 * Added on top of the custom price when WE design the card for the customer.
 * Covers the design labour.
 */
export const DESIGN_LABOUR_FEE = 4.99;

/**
 * Shared stock: how many cards are left in the current print run. All five
 * products draw from this one pool because they are the same physical card.
 * Managed from /admin-dashboard; decremented automatically by the Stripe
 * webhook (api/stripe-webhook) when an order is paid.
 */
export const CARD_STOCK = Math.max(0, Math.round(storeState.cardStock));
/** Size of one print run (the stock bar shows CARD_STOCK out of this). */
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
  /** Additional cost when the customer chooses a custom design. */
  customUpcharge: number;
  features: string[];
  useCases: string[];
  specs: { label: string; value: string }[];
  /** What arrives in the package. */
  box: string[];
  /** Two accent colors (main, secondary) used for the product visual. */
  accent: [string, string];
  popular?: boolean;
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
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Instant tap-to-review, no app required",
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
    accent: ["#F97316", "#FBBF24"],
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
      "One tap opens your profile so customers follow you on the spot, not later.",
    description:
      "Nobody remembers a handle they heard once, and nobody searches for it when they get home. This card closes that gap. A single tap opens your Instagram, TikTok, or Facebook profile with the follow button right there, or a link hub with all three if you want everything in one place. The follow happens while the customer is still standing in front of you, which is the only moment it reliably happens at all.",
    example:
      "A lash tech finishes an appointment and hands over the card with the mirror: “Tap this if you want to see your set on our page this week.” The client follows on the spot to find her photo later. Every appointment becomes a follower, and every follower sees the next month of openings.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Link one profile or a hub with all of them",
      "Follow happens on the spot, not “later”",
      "Works with iPhone and Android",
      "Durable matte finish that survives a pocket",
      "Reprogrammable free when your links change",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Creators & influencers", "Pop-up shops", "Events & markets", "Personal brands"],
    specs: CARD_SPECS,
    box: [
      "1 × NFC card, programmed to your profile or link hub",
      "Quick-start guide with three ways to hand it over naturally",
    ],
    accent: ["#EC4899", "#8B5CF6"],
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
  },
  {
    id: "business-card",
    slug: "digital-business-card",
    name: "Digital Business Card",
    category: "Digital Business Card",
    formFactor: "Card",
    tagline: "Everything about you, on one card",
    summary:
      "The all-in-one: contact details, website, socials, reviews and more in a single tap.",
    description:
      "The flagship, and the last business card you will ever print. Tap it to a phone and a branded hub opens with your name, number, email, save-to-contacts button, website, socials, Google reviews, menu, anything you want, in the order you want. Reviews on top during a push, the holiday menu in December, the booking page in slow season. When your details change, update the hub and keep handing over the same card. One card, unlimited shares, always current.",
    example:
      "A real estate agent at an open house taps her card to a couple's phone as they leave. Her listing site, cell number, and Instagram land in their contacts before they reach the car. Two weeks later, when they are ready to make an offer, they do not have to remember her name. She is already in the phone.",
    basePrice: BUSINESS_PRICE,
    customUpcharge: BUSINESS_CUSTOM_UPCHARGE,
    features: [
      "Branded hub: contact, website, socials, reviews and more",
      "Save-to-contacts in a single button",
      "Reorder or update your links any time, same card",
      "Matte PVC, credit-card weight and feel",
      "Reprogrammable free, forever",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Sales & real estate", "Consultants", "Full-service businesses", "Executives"],
    specs: CARD_SPECS,
    box: [
      "1 × NFC card, programmed to your personal hub",
      "Hub setup walkthrough (takes about ten minutes)",
      "Setup guide for editing your details later",
    ],
    accent: ["#3B82F6", "#22D3EE"],
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
  if (designType === "custom") {
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
  "Social Media",
  "Menu",
  "Website",
  "Digital Business Card",
];
