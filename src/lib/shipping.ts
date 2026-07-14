import { site } from "./site";

/**
 * Destination-based shipping zones, derived from site.ts. The checkout page
 * lets the buyer choose a zone; the checkout API binds the zone's flat rate
 * to the Stripe session and restricts the shipping address to the zone's
 * countries, so the amount charged always matches the destination.
 */
export interface ShippingZone {
  id: string;
  label: string;
  /** ISO 3166-1 alpha-2 codes this zone covers. */
  countries: string[];
  /** Flat shipping rate in USD. */
  rate: number;
  /** Delivery estimate in business days. */
  etaMin: number;
  etaMax: number;
}

// Copy out of the readonly `as const` config into plain mutable arrays so
// the values can be handed to Stripe (which wants mutable arrays) and used
// as ordinary numbers/strings.
export const shippingZones: ShippingZone[] = site.shipping.zones.map((z) => ({
  id: z.id,
  label: z.label,
  countries: [...z.countries],
  rate: z.rate,
  etaMin: z.etaMin,
  etaMax: z.etaMax,
}));

/** First zone (US) is the default selection. */
export const defaultZoneId = shippingZones[0].id;

/** Resolve a zone id to its zone, falling back to the default zone. */
export function getShippingZone(id: string | null | undefined): ShippingZone {
  return shippingZones.find((z) => z.id === id) ?? shippingZones[0];
}

/** Every country we ship to, across all zones (for address collection). */
export const allShippingCountries: string[] = shippingZones.flatMap(
  (z) => z.countries,
);
