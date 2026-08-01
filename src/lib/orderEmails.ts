import type Stripe from "stripe";
import { sendEmail, money } from "./email";
import { site } from "./site";

/**
 * The two emails a physical-goods store actually owes a customer: "we have
 * your order" and "it is on its way". Both are built from the Stripe session,
 * which is where order data lives.
 *
 * Stripe's own invoice email (if enabled in its dashboard) is a receipt, not
 * a fulfilment update — these do not duplicate it.
 */

function addressLines(session: Stripe.Checkout.Session): string[] {
  const details = session.collected_information?.shipping_details;
  const a = details?.address;
  if (!a?.line1) return [];
  return [
    details?.name ?? session.customer_details?.name ?? "",
    a.line1,
    a.line2 ?? "",
    [a.city, a.state, a.postal_code].filter(Boolean).join(" "),
    a.country ?? "",
  ].filter(Boolean);
}

function reference(session: Stripe.Checkout.Session): string {
  return session.id.slice(-8).toUpperCase();
}

/** Sent from the webhook once payment completes. */
export async function sendOrderConfirmation(
  session: Stripe.Checkout.Session,
  lines: Stripe.LineItem[],
) {
  const to = session.customer_details?.email;
  if (!to) return "skipped";

  const items = lines
    .map((li) => `  ${li.description ?? "Item"} x${li.quantity ?? 1}`)
    .join("\n");
  const address = addressLines(session);
  const preorder = Boolean(session.metadata?.preorder);

  const body = [
    `Thanks for your order.`,
    ``,
    `Order ${reference(session)}`,
    items,
    ``,
    `Total paid: ${money((session.amount_total ?? 0) / 100)}`,
    ...(address.length ? [``, `Shipping to:`, ...address.map((l) => `  ${l}`)] : []),
    ``,
    preorder
      ? `This is a pre-order. ${site.preorder.shipNote}, in the order they were placed — we will email you the moment yours ships.`
      : `Your cards are programmed to your link before they ship, usually within ${site.shipping.handlingDays}. We will email you when it is on its way.`,
    ``,
    `Reply to this email if anything needs changing — the address especially, while it is still easy to fix.`,
    ``,
    site.name,
  ].join("\n");

  return sendEmail({
    to,
    subject: `Order ${reference(session)} confirmed`,
    body,
  });
}

/** Sent from the dashboard when an order is marked shipped. */
export async function sendShippedEmail(
  session: Stripe.Checkout.Session,
  tracking: string,
) {
  const to = session.customer_details?.email;
  if (!to) return "skipped";

  const address = addressLines(session);
  const zone = session.shipping_cost?.shipping_rate;
  const eta =
    zone && typeof zone === "object" && zone.delivery_estimate
      ? `${zone.delivery_estimate.minimum?.value ?? ""}-${zone.delivery_estimate.maximum?.value ?? ""} business days`
      : site.shipping.deliveryDays;

  const body = [
    `Your order is on its way.`,
    ``,
    `Order ${reference(session)}`,
    ...(tracking ? [`Tracking: ${tracking}`] : []),
    `Estimated delivery: ${eta}`,
    ...(address.length ? [``, `Shipping to:`, ...address.map((l) => `  ${l}`)] : []),
    ``,
    `Tap the card on the back of any phone once it arrives — it is already programmed to your link, so there is nothing to set up.`,
    ``,
    `Anything wrong with it, reply here: we correct problems free for ${site.guaranteeDays} days.`,
    ``,
    site.name,
  ].join("\n");

  return sendEmail({
    to,
    subject: `Order ${reference(session)} has shipped`,
    body,
  });
}
