import { NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import { unitAmountCents, lineTotal } from "@/lib/pricing";

/**
 * Creates a Stripe Checkout Session from the cart.
 *
 * Security: prices are recomputed here from the product catalog — the client
 * only sends product IDs, design choices, and quantities. A tampered request
 * can never change what gets charged.
 *
 * If STRIPE_SECRET_KEY is not configured (e.g. before the key is added in
 * Vercel), we respond with { demo: true } and the UI falls back to a clearly
 * labelled test-order flow, so the site never hard-crashes.
 */

interface CheckoutItem {
  productId: string;
  designType: "standard" | "custom";
  customMethod?: "upload" | "we-design";
  note?: string;
  quantity: number;
}

export async function POST(request: Request) {
  let body: { items?: CheckoutItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Build validated line items with server-side prices.
  const lines: {
    name: string;
    description: string;
    unitCents: number;
    quantity: number;
    fulfillmentNote: string;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    const quantity = Math.floor(Number(item.quantity));
    if (!product || !Number.isFinite(quantity) || quantity < 1 || quantity > 999) {
      return NextResponse.json({ error: "Invalid item in cart" }, { status: 400 });
    }

    const isCustom = item.designType === "custom";
    const baseUnit = isCustom
      ? product.basePrice + product.customUpcharge
      : product.basePrice;

    const designLabel = isCustom
      ? item.customMethod === "upload"
        ? "Custom design: customer artwork"
        : "Custom design: designed by us"
      : "Standard design";

    const note = (item.note ?? "").slice(0, 400);

    lines.push({
      name: product.name,
      description: note ? `${designLabel} · ${note}` : designLabel,
      unitCents: unitAmountCents(baseUnit, quantity),
      quantity,
      fulfillmentNote: `${product.name} x${quantity} | ${designLabel}${note ? ` | ${note}` : ""}`,
    });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Payments not configured yet — tell the client to use the demo flow.
    return NextResponse.json({ demo: true });
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const baseUnit =
      item.designType === "custom"
        ? product.basePrice + product.customUpcharge
        : product.basePrice;
    return sum + lineTotal(baseUnit, Math.floor(Number(item.quantity)));
  }, 0);

  const freeShipping = subtotal >= site.shipping.freeThreshold;

  try {
    const stripe = new Stripe(key);
    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      site.url;

    // Metadata: one compact entry per line so orders are easy to fulfil
    // straight from the Stripe dashboard. (500-char limit per value.)
    const metadata: Record<string, string> = {};
    lines.forEach((line, i) => {
      metadata[`item_${i + 1}`] = line.fulfillmentNote.slice(0, 500);
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.unitCents,
          product_data: {
            name: line.name,
            description: line.description,
          },
        },
      })),
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "NZ"],
      },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: freeShipping ? "Free shipping" : "Standard shipping",
            type: "fixed_amount",
            fixed_amount: {
              currency: "usd",
              amount: freeShipping
                ? 0
                : Math.round(site.shipping.flatRate * 100),
            },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      metadata,
      // Lets customers enter promo codes (e.g. a WELCOME10 code created in
      // the Stripe dashboard for the newsletter signup offer).
      allow_promotion_codes: true,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Payment session could not be created. Please try again." },
      { status: 500 },
    );
  }
}
