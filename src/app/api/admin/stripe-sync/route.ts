import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import {
  products,
  configuredUnitPrice,
  type Product,
} from "@/lib/products";

/**
 * POST /api/admin/stripe-sync — pushes the site catalog into Stripe.
 *
 * Creates (or updates) one Stripe Product per catalog product, with three
 * one-time Prices each — standard, custom (customer artwork), and custom
 * designed-by-us — identified by stable lookup keys so re-running the sync
 * is idempotent: unchanged prices are left alone, changed amounts create a
 * new Price and archive the old one (Stripe prices are immutable).
 *
 * Checkout itself keeps using inline price_data, because the pre-order
 * discount changes the charged amount dynamically; this sync exists so the
 * catalog is visible and reportable in the Stripe dashboard, and so the
 * products/prices are available to anything else built on the account.
 *
 * Admin-session protected — run it from the dashboard button, where the
 * Vercel-configured STRIPE_SECRET_KEY is available.
 */

interface PriceVariant {
  suffix: string;
  label: string;
  amountCents: number;
}

function variantsFor(product: Product): PriceVariant[] {
  const cents = (d: number) => Math.round(d * 100);
  return [
    {
      suffix: "standard",
      label: "Standard design",
      amountCents: cents(configuredUnitPrice(product, "standard")),
    },
    {
      suffix: "custom-upload",
      label: "Custom design (customer artwork)",
      amountCents: cents(configuredUnitPrice(product, "custom", "upload")),
    },
    {
      suffix: "custom-we-design",
      label: "Custom design (designed by us)",
      amountCents: cents(configuredUnitPrice(product, "custom", "we-design")),
    },
  ];
}

export async function POST() {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured, add it in Vercel first." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(key);
  let productsCreated = 0;
  let productsUpdated = 0;
  let pricesCreated = 0;
  let pricesUnchanged = 0;

  try {
    for (const product of products) {
      const stripeId = `taplink-${product.id}`;
      const productData = {
        name: product.name,
        description: `${product.tagline}. ${product.summary}`,
        metadata: {
          taplink_id: product.id,
          slug: product.slug,
          category: product.category,
        },
      };

      try {
        await stripe.products.create({ id: stripeId, ...productData });
        productsCreated++;
      } catch (err) {
        if (
          err instanceof Stripe.errors.StripeError &&
          err.code === "resource_already_exists"
        ) {
          await stripe.products.update(stripeId, {
            ...productData,
            active: true,
          });
          productsUpdated++;
        } else {
          throw err;
        }
      }

      const existing = await stripe.prices.list({
        product: stripeId,
        active: true,
        limit: 100,
      });

      let defaultPriceId: string | null = null;
      for (const variant of variantsFor(product)) {
        const lookupKey = `${stripeId}-${variant.suffix}`;
        const match = existing.data.find((p) => p.lookup_key === lookupKey);

        if (match && match.unit_amount === variant.amountCents) {
          pricesUnchanged++;
          if (variant.suffix === "standard") defaultPriceId = match.id;
          continue;
        }

        // New variant, or the amount changed: create a fresh Price. The
        // lookup key transfers over; the old price is archived after.
        const created = await stripe.prices.create({
          product: stripeId,
          currency: "usd",
          unit_amount: variant.amountCents,
          nickname: variant.label,
          lookup_key: lookupKey,
          transfer_lookup_key: true,
        });
        pricesCreated++;
        if (variant.suffix === "standard") defaultPriceId = created.id;
        if (match) {
          await stripe.prices.update(match.id, { active: false });
        }
      }

      // The standard price shows as the product's price in the dashboard.
      if (defaultPriceId) {
        await stripe.products.update(stripeId, {
          default_price: defaultPriceId,
        });
      }
    }
  } catch (err) {
    console.error("Stripe catalog sync failed:", err);
    const message =
      err instanceof Stripe.errors.StripeError
        ? `Stripe error: ${err.message}`
        : "Sync failed part-way. Run it again — it picks up where it left off.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    productsCreated,
    productsUpdated,
    pricesCreated,
    pricesUnchanged,
  });
}
