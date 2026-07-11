/**
 * Product catalog (single source of truth).
 *
 * Pricing model: every product is $34.99 standard. Choosing a custom design
 * raises it to $42.99 (customUpcharge of $8). There are no pack discounts;
 * the only discount is the site-wide pre-order window (see lib/site.ts and
 * lib/pricing.ts).
 *
 * This is a static catalog, no database yet. Swap `products` for a CMS/DB
 * fetch later without changing the UI, as long as the `Product` shape stays.
 */

export type ProductCategory =
  | "Google Reviews"
  | "Social Media"
  | "Digital Business Card"
  | "Menu"
  | "WiFi"
  | "All-in-One";

export type FormFactor = "Card" | "Sticker" | "Keychain" | "Stand" | "Band";

/** Every product's standard price. */
export const STANDARD_PRICE = 34.99;
/** Added when the customer chooses a custom design ($42.99 total). */
export const CUSTOM_UPCHARGE = 8;

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
    specs: [
      { label: "Material", value: "Matte PVC" },
      { label: "Size", value: "85.6 × 54 mm (credit card)" },
      { label: "Chip", value: "NTAG215 (504 bytes)" },
      { label: "Tap range", value: "Up to 4 cm" },
    ],
    box: [
      "1 × NFC review card, programmed to your Google review link",
      "Counter-side setup guide with the exact script to use",
      "Adhesive strip for mounting flat on a counter",
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
      "Some days the line is out the door and nobody has time to ask for anything. The stand asks for you. It sits next to your card reader with a clear “Tap here to leave us a review” message facing the customer, so every single checkout carries the invitation even when your staff is slammed. The weighted base keeps it planted through rushes, spills, and cleaning wipes. A loose card can get buried under receipts. The stand cannot.",
    example:
      "A taqueria with a lunch rush puts the stand beside the tip screen. Nobody on staff says a word about reviews. Customers read the stand while their card processes, and the ones who loved the food tap it. The owner checks Google on Sunday and finds the week's reviews came in on their own.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Weighted base that stays planted on a busy counter",
      "Customer-facing “Tap for Reviews” call to action",
      "Programmed to your Google review link before shipping",
      "Wipe-clean acrylic face with metal base",
      "Reprogrammable free if your link ever changes",
      "Optional QR code printed on the face, free",
    ],
    useCases: ["Checkout counters", "Reception desks", "Food trucks", "Bars"],
    specs: [
      { label: "Material", value: "Acrylic + weighted metal base" },
      { label: "Size", value: "100 × 150 mm" },
      { label: "Chip", value: "NTAG215 (504 bytes)" },
      { label: "Tap range", value: "Up to 4 cm" },
    ],
    box: [
      "1 × weighted NFC stand, programmed to your Google review link",
      "Placement guide: where on the counter it converts best",
      "Microfiber cloth for the acrylic face",
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
    specs: [
      { label: "Material", value: "Matte PVC" },
      { label: "Size", value: "85.6 × 54 mm (credit card)" },
      { label: "Chip", value: "NTAG215 (504 bytes)" },
      { label: "Tap range", value: "Up to 4 cm" },
    ],
    box: [
      "1 × NFC social card, programmed to your profile or link hub",
      "Quick-start guide with three ways to hand it over naturally",
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
      "The last business card you will ever print. Tap it to a phone and your name, number, email, website, and socials appear with a save-to-contacts button. No stack of paper cards going soft in a jacket pocket, no “I'll text you my info” that never happens. When your details change, update the card from your dashboard and keep handing over the same one. One card, unlimited shares, always current.",
    example:
      "A real estate agent at an open house taps her card to a couple's phone as they leave. Her listing site, cell number, and Instagram land in their contacts before they reach the car. Two weeks later, when they are ready to make an offer, they do not have to remember her name. She is already in the phone.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Contact, website and socials in one tap",
      "Save-to-contacts in a single button",
      "Update your details any time, same card",
      "Matte PVC, credit-card weight and feel",
      "Reprogrammable free, forever",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Sales & real estate", "Consultants", "Networking", "Executives"],
    specs: [
      { label: "Material", value: "Matte PVC" },
      { label: "Size", value: "85.6 × 54 mm (credit card)" },
      { label: "Chip", value: "NTAG215 (504 bytes)" },
      { label: "Tap range", value: "Up to 4 cm" },
    ],
    box: [
      "1 × NFC business card, programmed to your contact page",
      "Setup guide for editing your details later",
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
      "Give guests your menu without printing a single page. These slim, waterproof tags stick to tables, counters, or the host stand, and a tap opens your up-to-date digital menu. Raise a price, 86 a dish, add a special: edit the menu once online and every table is current instantly. No reprinting, no laminating, no sticky paper menus that need replacing every month.",
    example:
      "A brunch spot changes its specials every Saturday morning. The owner edits one Google Doc at 7am, and by open, every table's tag points to the new list. The old routine was printing, cutting, and swapping 40 paper inserts. The new routine is typing.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Opens your digital menu instantly",
      "Update the menu online, every table is current",
      "Slim, low-profile sticker that survives table wipes",
      "Waterproof and spill-proof vinyl",
      "Reprogrammable free if your menu link changes",
      "Optional QR code printed on the face, free",
    ],
    useCases: ["Restaurants", "Cafés & bars", "Food trucks", "Hotels"],
    specs: [
      { label: "Material", value: "Waterproof vinyl" },
      { label: "Size", value: "30 mm round" },
      { label: "Chip", value: "NTAG213 (144 bytes)" },
      { label: "Tap range", value: "Up to 3 cm" },
    ],
    box: [
      "1 × NFC menu tag, programmed to your menu link",
      "Surface prep wipe for a clean, permanent stick",
      "Placement guide for tables, bars, and host stands",
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
      "Share guest WiFi the modern way. A tap connects the phone to your network automatically. Nobody spells P-a-s-s-w-0-r-d over the espresso machine, nobody photographs a curling sticky note by the register, and staff stop answering the same question forty times a shift. When you rotate the password, reprogram the tag in a minute and keep going.",
    example:
      "A café sticks one tag on the counter and one by the window seats. The barista's script shrinks from reciting a 12-character password to three words: “tap the sticker.” On a laptop-crowd weekday that is dozens of interruptions that simply stop happening.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "One-tap WiFi join, no typing",
      "Staff stop repeating the password all day",
      "Discreet sticker that fits any counter",
      "Waterproof and spill-proof vinyl",
      "Reprogrammable free when your password changes",
      "Optional QR code printed on the face, free",
    ],
    useCases: ["Cafés & lounges", "Salons", "Airbnb & rentals", "Offices"],
    specs: [
      { label: "Material", value: "Waterproof vinyl" },
      { label: "Size", value: "30 mm round" },
      { label: "Chip", value: "NTAG213 (144 bytes)" },
      { label: "Tap range", value: "Up to 3 cm" },
    ],
    box: [
      "1 × NFC WiFi tag, programmed to your network",
      "Surface prep wipe for a clean, permanent stick",
      "Guide for reprogramming when you rotate passwords",
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
      "For businesses whose counter is wherever they are standing. The keychain tag points to your reviews, socials, website, or a link hub, and you tap it to a customer's phone on the spot: at the job site, at the market stall, in the driveway after a detail. The epoxy-coated build shrugs off keys, pockets, rain, and drops. It is the review card for people who do not have a register.",
    example:
      "A mobile detailer finishes a car and does the walkaround with the owner. Before packing up: “If you're happy with it, tap your phone on my keys and it opens our review page.” Job done, review posted, van loaded. His Google page fills up one driveway at a time.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Point it at any link: reviews, socials, site, or hub",
      "Rugged epoxy-coated build, survives real work",
      "Clips to keys, belt loop, or lanyard",
      "Works with iPhone and Android",
      "Reprogrammable free, any time",
    ],
    useCases: ["Trades & field work", "Mobile services", "Market vendors", "Personal use"],
    specs: [
      { label: "Material", value: "Epoxy-coated composite" },
      { label: "Size", value: "32 mm disc" },
      { label: "Chip", value: "NTAG215 (504 bytes)" },
      { label: "Tap range", value: "Up to 3 cm" },
    ],
    box: [
      "1 × NFC keychain tag, programmed to your link",
      "Steel keyring and carabiner clip",
      "Field guide: the one-line ask that works on job sites",
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
      "One card, every link. A tap opens a branded hub page with your Google reviews, Instagram, Facebook, website, menu, and WiFi in one clean list. You choose the order, so whatever matters most this month sits on top: reviews during a push, the holiday menu in December, the booking page in slow season. Rearrange it any time from your dashboard without touching the card.",
    example:
      "A nail salon runs its whole counter from one card. January the hub leads with the booking page, May it leads with Mother's Day gift cards, and all year the second slot is Google reviews. Same card on the same counter, doing a different job every season.",
    basePrice: STANDARD_PRICE,
    customUpcharge: CUSTOM_UPCHARGE,
    features: [
      "Branded hub with every link in one place",
      "Reviews, socials, menu, WiFi and website together",
      "Reorder links any time without touching the card",
      "Matte PVC, credit-card weight and feel",
      "Reprogrammable free, forever",
      "Optional QR code printed on the back, free",
    ],
    useCases: ["Full-service businesses", "Multi-location brands", "Agencies", "Franchises"],
    specs: [
      { label: "Material", value: "Matte PVC" },
      { label: "Size", value: "85.6 × 54 mm (credit card)" },
      { label: "Chip", value: "NTAG216 (888 bytes)" },
      { label: "Tap range", value: "Up to 4 cm" },
    ],
    box: [
      "1 × NFC all-in-one card, programmed to your hub",
      "Hub setup walkthrough (takes about ten minutes)",
      "Adhesive strip for mounting flat on a counter",
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
