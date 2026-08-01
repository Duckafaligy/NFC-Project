import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";

/**
 * GET /api/admin/orders — recent orders, read straight from Stripe.
 *
 * Stripe already stores every order permanently and completely: the delivery
 * address, the recipient, what shipping was paid and every line. Keeping a
 * second copy in KV meant orders could be lost (the in-memory fallback drops
 * everything on a cold start) or drift out of step. So this reads Stripe and
 * keeps nothing of its own.
 *
 * Our operational flags — dispatched, tracking number, refunded — live in the
 * session's own metadata, so they travel with the order rather than sitting
 * in a store that can disappear.
 *
 * Admin-session protected.
 */

const LIMIT = 25;

export async function GET() {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ orders: [], stripeConfigured: false });
  }

  const stripe = new Stripe(key);

  let sessions: Stripe.ApiList<Stripe.Checkout.Session>;
  try {
    sessions = await stripe.checkout.sessions.list({
      limit: LIMIT,
      status: "complete",
      expand: ["data.line_items", "data.shipping_cost.shipping_rate"],
    });
  } catch (err) {
    console.error("Could not list Stripe orders:", err);
    const message =
      err instanceof Stripe.errors.StripeError
        ? `Stripe error: ${err.message}`
        : "Could not reach Stripe.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const orders = sessions.data
    // `complete` covers free/zero-amount sessions too; only show real orders.
    .filter((s) => s.payment_status !== "unpaid")
    .map((s) => {
      const details = s.collected_information?.shipping_details;
      const a = details?.address ?? null;
      const rate = s.shipping_cost?.shipping_rate;
      const fulfilledAt = Number(s.metadata?.fulfilled_at ?? 0) || null;

      return {
        id: s.id,
        at: (s.created ?? 0) * 1000,
        email: s.customer_details?.email ?? null,
        total: (s.amount_total ?? 0) / 100,
        currency: (s.currency ?? "cad").toUpperCase(),
        quantity: (s.line_items?.data ?? []).reduce(
          (n, li) => n + (li.quantity ?? 0),
          0,
        ),
        items: (s.line_items?.data ?? []).map(
          (li) => `${li.description ?? "Item"} ×${li.quantity ?? 1}`,
        ),
        preorder: Boolean(s.metadata?.preorder),
        refunded: s.metadata?.refunded === "yes",
        shipTo: a?.line1
          ? {
              name: details?.name ?? s.customer_details?.name ?? null,
              phone: s.customer_details?.phone ?? null,
              line1: a.line1,
              line2: a.line2 ?? null,
              city: a.city ?? null,
              state: a.state ?? null,
              postalCode: a.postal_code ?? null,
              country: a.country ?? null,
            }
          : undefined,
        shippingPaid: (s.shipping_cost?.amount_total ?? 0) / 100,
        shippingMethod:
          rate && typeof rate === "object" ? (rate.display_name ?? null) : null,
        tax: (s.total_details?.amount_tax ?? 0) / 100,
        fulfilledAt,
        trackingNumber: s.metadata?.tracking || null,
        // Deep link so anything not shown here is one click away.
        stripeUrl: `https://dashboard.stripe.com/${
          s.livemode ? "" : "test/"
        }payments/${typeof s.payment_intent === "string" ? s.payment_intent : ""}`,
      };
    });

  return NextResponse.json({ orders, stripeConfigured: true });
}
