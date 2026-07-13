import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  claimStripeEvent,
  decrementCardStock,
  incrementCardStock,
  logOrder,
  markOrderRefunded,
} from "@/lib/adminStore";
import { LOW_STOCK } from "@/lib/products";
import { site } from "@/lib/site";

/**
 * Keeps the store in sync with Stripe.
 *
 * - checkout.session.completed: subtracts the order's quantity from the
 *   shared card pool (stock bars/buy buttons update immediately), logs the
 *   order for the dashboard, and emails a low-stock alert when the pool
 *   crosses the LOW_STOCK threshold (needs RESEND_API_KEY +
 *   LOW_STOCK_ALERT_EMAIL, otherwise skipped silently).
 * - charge.refunded (full refunds only): adds the quantity back to the pool
 *   and flags the order refunded in the log. Partial refunds are left for a
 *   manual stock adjustment in the dashboard.
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

async function handlePaidOrder(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });
  const quantity = lineItems.data.reduce(
    (sum, li) => sum + (li.quantity ?? 0),
    0,
  );

  if (quantity > 0) {
    const { previous, next } = await decrementCardStock(quantity);
    // Alert exactly once, on the crossing into low territory.
    if (previous > LOW_STOCK && next <= LOW_STOCK) {
      await sendLowStockAlert(next);
    }
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

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });
  const quantity = lineItems.data.reduce(
    (sum, li) => sum + (li.quantity ?? 0),
    0,
  );
  if (quantity > 0) await incrementCardStock(quantity);
  await markOrderRefunded(session.id);
}

/**
 * Low-stock email via Resend's REST API. No-op until RESEND_API_KEY and
 * LOW_STOCK_ALERT_EMAIL are configured. ALERT_FROM_EMAIL optionally sets a
 * verified sender; Resend's onboarding sender works for testing.
 */
async function sendLowStockAlert(stock: number) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LOW_STOCK_ALERT_EMAIL;
  if (!apiKey || !to) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL ?? "TapLink Stock <onboarding@resend.dev>",
      to: [to],
      subject: `Low stock: ${stock} card${stock === 1 ? "" : "s"} left`,
      text:
        `The shared card pool is down to ${stock}. ` +
        `Time to order the next print run.\n\n` +
        `Update stock: ${site.url}/admin-dashboard`,
    }),
  });
  if (!res.ok) {
    console.error("Low-stock alert email failed:", res.status);
  }
}
