import { NextResponse } from "next/server";
import Stripe from "stripe";
import { decrementCardStock } from "@/lib/admin";

/**
 * Keeps card stock in sync with Stripe. When a checkout is paid, the total
 * quantity across the order's line items is subtracted from the shared card
 * pool in src/data/store-state.json (committed to git, which redeploys the
 * site with the new number).
 *
 * Setup (one time, in the Stripe dashboard):
 *   Developers > Webhooks > Add endpoint
 *   URL:    https://<your-domain>/api/stripe-webhook
 *   Events: checkout.session.completed
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 },
      );
      const quantity = lineItems.data.reduce(
        (sum, li) => sum + (li.quantity ?? 0),
        0,
      );
      if (quantity > 0) await decrementCardStock(quantity);
    } catch (e) {
      // Log and acknowledge: Stripe retries on non-2xx, and a stock-sync
      // hiccup should not make Stripe flag the endpoint as failing forever.
      console.error("Stock sync failed for session", session.id, e);
    }
  }

  return NextResponse.json({ received: true });
}
