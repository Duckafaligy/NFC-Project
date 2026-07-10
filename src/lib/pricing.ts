/**
 * Volume pricing — shared by the client UI and the Stripe API route so the
 * price a customer sees is exactly the price they're charged.
 *
 * Tiers apply per line item based on quantity.
 */

export const volumeTiers = [
  { min: 10, discount: 0.2, label: "10+", badge: "Save 20%" },
  { min: 5, discount: 0.15, label: "5", badge: "Save 15%" },
  { min: 3, discount: 0.1, label: "3", badge: "Save 10%" },
] as const;

/** Discount rate (0–1) for a given quantity. */
export function tierDiscount(quantity: number): number {
  for (const tier of volumeTiers) {
    if (quantity >= tier.min) return tier.discount;
  }
  return 0;
}

/** Per-unit price in dollars after volume discount, rounded to cents. */
export function unitPriceFor(baseUnit: number, quantity: number): number {
  return Math.round(baseUnit * (1 - tierDiscount(quantity)) * 100) / 100;
}

/** Per-unit price in cents (for Stripe). */
export function unitAmountCents(baseUnit: number, quantity: number): number {
  return Math.round(baseUnit * (1 - tierDiscount(quantity)) * 100);
}

/** Line total in dollars after volume discount. */
export function lineTotal(baseUnit: number, quantity: number): number {
  return Math.round(unitPriceFor(baseUnit, quantity) * quantity * 100) / 100;
}
