import { site } from "./site";

/**
 * Destination + quantity based shipping, derived from site.ts. The checkout
 * page lets the buyer choose a zone; the checkout API binds the zone's rate
 * (for the order quantity) to the Stripe session and restricts the shipping
 * address to the zone's countries, so the amount charged always matches the
 * destination and how many cards ship.
 */
export interface ShippingTier {
  /** Applies to orders of this many cards or more (until the next tier). */
  minQty: number;
  /** Flat shipping price (store currency, CAD) for this bracket. */
  price: number;
}

export interface ShippingZone {
  id: string;
  label: string;
  /** ISO 3166-1 alpha-2 codes this zone covers. */
  countries: string[];
  /** Quantity brackets, sorted by minQty ascending, starting at 1. */
  tiers: ShippingTier[];
  /** Delivery estimate in business days. */
  etaMin: number;
  etaMax: number;
}

// Copy out of the readonly `as const` config into plain mutable arrays so the
// values can be handed to Stripe (which wants mutable arrays) and used as
// ordinary numbers/strings.
export const shippingZones: ShippingZone[] = site.shipping.zones.map((z) => ({
  id: z.id,
  label: z.label,
  countries: [...z.countries],
  tiers: z.tiers.map((t) => ({ minQty: t.minQty, price: t.price })),
  etaMin: z.etaMin,
  etaMax: z.etaMax,
}));

/** Billable shipping units for a cart. Every product ships in the same bracket, one unit per card. */
export function shippingUnitsFor(
  items: { productId: string; quantity: number }[],
): number {
  return items.reduce((sum, item) => {
    return sum + Math.max(0, Math.floor(Number(item.quantity)) || 0);
  }, 0);
}

/** First zone (Canada — home base) is the default selection. */
export const defaultZoneId = shippingZones[0].id;

/** Resolve a zone id to its zone, falling back to the default zone. */
export function getShippingZone(id: string | null | undefined): ShippingZone {
  return shippingZones.find((z) => z.id === id) ?? shippingZones[0];
}

/**
 * Shipping cost for an order: the price of the highest tier whose minQty is
 * <= the billable units (see `shippingUnitsFor`). Everything ships together,
 * so this steps up in brackets rather than charging per item. Empty or
 * invalid quantities are treated as 1.
 */
export function shippingCost(zone: ShippingZone, units: number): number {
  const q = Math.max(1, Math.floor(units) || 1);
  let price = zone.tiers[0]?.price ?? 0;
  for (const tier of zone.tiers) {
    if (q >= tier.minQty) price = tier.price;
    else break;
  }
  return price;
}

/** Human range label for tier `index`, e.g. "1", "2–4", "10+". */
export function tierRangeLabel(zone: ShippingZone, index: number): string {
  const min = zone.tiers[index].minQty;
  const next = zone.tiers[index + 1];
  if (!next) return `${min}+`;
  const max = next.minQty - 1;
  return max > min ? `${min}–${max}` : `${min}`;
}
