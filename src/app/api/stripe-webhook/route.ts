import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  claimStripeEvent,
  decrementStock,
  incrementStock,
  logOrder,
  markOrderRefunded,
  type ShipTo,
} from "@/lib/adminStore";

/**
 * Keeps the store in sync with Stripe.
 *
 * - checkout.session.completed: subtracts each product's quantity from its
 *   stock (stock bars/buy buttons update immediately) and logs the order for
 *   the dashboard.
 * - charge.refunded (full refunds only): adds the quantities back and flags
 *   the order refunded in the log. Partial refunds are left for a manual
 *   stock adjustment in the dashboard.
 *
 * Customer receipts/invoices are handled by Stripe itself (invoice_creation
 * on the Checkout session), so this endpoint sends no email of its own.
 *
 * Every event id is claimed in the store first, so Stripe's retries and
 * duplicate deliveries can never subtract stock twice.
 *
 * Setup (one time, in the Stripe dashboard):
 *   Developers > Webhooks > Add endpoint
 *   URL:    https://<your-domain>/api/stripe-webhook
 *   Events: checkout.session.completed, charge.refunded
 * Then copy the endpoint's signing secret into the STRIPE_WEBHOOK_SECRET
 * environment variable in Vercel and redeploy.
 */
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET)." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(key);
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature ?? "",
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Exactly-once: retried/duplicate deliveries are acknowledged but ignored.
  if (!(await claimStripeEvent(event.id))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handlePaidOrder(stripe, event.data.object);
    } else if (event.type === "charge.refunded") {
      await handleRefund(stripe, event.data.object);
    }
  } catch (e) {
    // Log and acknowledge: Stripe retries on non-2xx, and a sync hiccup
    // should not make Stripe flag the endpoint as failing forever.
    console.error(`Webhook handling failed for ${event.type}:`, e);
  }

  return NextResponse.json({ received: true });
}

/** Parse the compact "id:qty,id:qty" metadata into a {id: qty} map. */
function parseProductQtys(raw: string | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const part of raw.split(",")) {
    const [id, q] = part.split(":");
    const n = Math.max(0, Math.round(Number(q)));
    if (id && Number.isFinite(n) && n > 0) out[id] = (out[id] ?? 0) + n;
  }
  return out;
}

async function handlePaidOrder(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  // The delivery address is only on the full Session object, and the rate
  // needs expanding to get its display name — the webhook payload carries
  // neither, so re-fetch rather than log an order we cannot ship.
  let full: Stripe.Checkout.Session = session;
  try {
    full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["shipping_cost.shipping_rate"],
    });
  } catch (e) {
    console.error("Could not expand session for shipping details:", e);
  }

  const shipping = full.collected_information?.shipping_details ?? null;
  const address = shipping?.address ?? null;
  const shipTo: ShipTo = {
    // Fall back to the payer's name when no separate recipient was given.
    name: shipping?.name ?? full.customer_details?.name ?? null,
    phone: full.customer_details?.phone ?? null,
    line1: address?.line1 ?? null,
    line2: address?.line2 ?? null,
    city: address?.city ?? null,
    state: address?.state ?? null,
    postalCode: address?.postal_code ?? null,
    country: address?.country ?? null,
  };

  const rate = full.shipping_cost?.shipping_rate;
  const shippingMethod =
    rate && typeof rate === "object" ? (rate.display_name ?? null) : null;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });
  const quantity = lineItems.data.reduce(
    (sum, li) => sum + (li.quantity ?? 0),
    0,
  );

  // Decrement each product's own stock from the compact metadata map.
  const qtys = parseProductQtys(session.metadata?.product_qtys);
  for (const [pid, q] of Object.entries(qtys)) {
    await decrementStock(pid, q);
  }

  await logOrder({
    id: session.id,
    at: Date.now(),
    email: session.customer_details?.email ?? null,
    total: (session.amount_total ?? 0) / 100,
    quantity,
    items: lineItems.data.map(
      (li) => `${li.description ?? "Card"} ×${li.quantity ?? 1}`,
    ),
    preorder: Boolean(session.metadata?.preorder),
    shipTo,
    shippingPaid: (full.shipping_cost?.amount_total ?? 0) / 100,
    shippingMethod,
  });
}

async function handleRefund(stripe: Stripe, charge: Stripe.Charge) {
  // Only fully-refunded charges restock automatically; partial refunds are
  // a judgement call best made by hand in the dashboard.
  if (!charge.refunded || !charge.payment_intent) return;

  const sessions = await stripe.checkout.sessions.list({
    payment_intent: String(charge.payment_intent),
    limit: 1,
  });
  const session = sessions.data[0];
  if (!session) return;

  // Restock each product from the order's per-product quantity metadata.
  const qtys = parseProductQtys(session.metadata?.product_qtys);
  for (const [pid, q] of Object.entries(qtys)) {
    await incrementStock(pid, q);
  }
  await markOrderRefunded(session.id);
}
