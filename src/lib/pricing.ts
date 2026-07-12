import { site } from "./site";

/**
 * Pricing rules, shared by the client UI and the Stripe API route so the
 * price a customer sees is exactly the price they're charged.
 *
 * There are no volume/pack discounts. The only discount is the pre-order
 * window (site.preorder): while it's enabled, every item in the cart is
 * discounted by the configured rate.
 */

/** Whether the pre-order discount window is currently active. */
export function preorderActive(): boolean {
  return site.preorder.enabled;
}

/**
 * Cart-wide discount rate (0-1). Pass `active` to override the static
 * config with the live admin-dashboard flag; omit it for the static default.
 */
export function discountRate(active: boolean = preorderActive()): number {
  return active ? site.preorder.discount : 0;
}

/** Per-unit price in dollars after the pre-order discount, rounded to cents. */
export function unitPriceFor(baseUnit: number, active?: boolean): number {
  return Math.round(baseUnit * (1 - discountRate(active ?? preorderActive())) * 100) / 100;
}

/** Per-unit price in cents (for Stripe). */
export function unitAmountCents(baseUnit: number, active?: boolean): number {
  return Math.round(baseUnit * (1 - discountRate(active ?? preorderActive())) * 100);
}

/** Line total in dollars after the pre-order discount. */
export function lineTotal(
  baseUnit: number,
  quantity: number,
  active?: boolean,
): number {
  return Math.round(unitPriceFor(baseUnit, active) * quantity * 100) / 100;
}

/** Line total at full price (for strikethrough displays). */
export function compareLineTotal(baseUnit: number, quantity: number): number {
  return Math.round(baseUnit * quantity * 100) / 100;
}
