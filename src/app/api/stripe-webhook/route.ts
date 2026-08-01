import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  claimStripeEvent,
  decrementStock,
  incrementStock,
} from "@/lib/adminStore";
import { emailConfigured } from "@/lib/email";
import { sendOrderConfirmation } from "@/lib/orderEmails";

/**
 * Keeps the store in sync with Stripe.
 *
 * - checkout.session.completed: subtracts each product's quantity from its
 *   stock (stock bars/buy buttons update immediately) and sends the order
 *   confirmation email.
 * - charge.refunded (full refunds only): adds the quantities back and flags
 *   the session refunded. Partial refunds are left for a manual stock
 *   adjustment in the dashboard.
 *
 * Orders themselves are not stored here — the dashboard reads them from
 * Stripe. Receipts/invoices are Stripe's (invoice_creation on the session);
 * this only sends the confirmation, and the shipped notice comes from
 * /api/admin/fulfil.
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
  // No order is copied out of Stripe: the dashboard reads orders (and their
  // delivery addresses) from Stripe directly, so there is no second copy to
  // keep in step or lose. Stock is the one thing Stripe cannot track for us.
  const qtys = parseProductQtys(session.metadata?.product_qtys);
  for (const [pid, q] of Object.entries(qtys)) {
    await decrementStock(pid, q);
  }

  // Confirmation email. Skips silently when Resend is not configured, and a
  // failure here must never cost us the stock adjustment above.
  if (emailConfigured) {
    try {
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });
      await sendOrderConfirmation(full, full.line_items?.data ?? []);
    } catch (e) {
      console.error("Order confirmation email failed:", e);
    }
  }
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

  // Flag it on the session itself, so the dashboard sees the refund without
  // us keeping an order log of our own.
  try {
    await stripe.checkout.sessions.update(session.id, {
      metadata: { refunded: "yes" },
    });
  } catch (e) {
    console.error("Could not flag session refunded:", e);
  }
}
