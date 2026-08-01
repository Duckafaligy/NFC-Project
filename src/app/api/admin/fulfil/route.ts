import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";

/**
 * POST /api/admin/fulfil — marks an order dispatched, or clears that.
 *
 * Body: { id: "cs_...", fulfilled: boolean, tracking?: string }
 *
 * Written into the Checkout Session's metadata rather than our own store, so
 * fulfilment state lives with the order in Stripe and survives anything that
 * happens to this deployment. It is also then visible on the payment in the
 * Stripe dashboard.
 *
 * Admin-session protected.
 */
export async function POST(request: Request) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  let body: { id?: string; fulfilled?: boolean; tracking?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const fulfilled = Boolean(body.fulfilled);
  const tracking =
    typeof body.tracking === "string" ? body.tracking.trim().slice(0, 64) : "";

  try {
    const stripe = new Stripe(key);
    await stripe.checkout.sessions.update(id, {
      metadata: {
        // Empty string clears the key in Stripe.
        fulfilled_at: fulfilled ? String(Date.now()) : "",
        tracking: fulfilled ? tracking : "",
      },
    });
  } catch (err) {
    console.error("Could not update fulfilment:", err);
    const message =
      err instanceof Stripe.errors.StripeError
        ? `Stripe error: ${err.message}`
        : "Could not reach Stripe.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
