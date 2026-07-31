import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import {
  products,
  configuredUnitPrice,
  withPriceOverride,
  type Product,
} from "@/lib/products";
import { effectivePrices } from "@/lib/adminStore";
import {
  shippingZones,
  tierRangeLabel,
  SHIPPING_UNITS,
} from "@/lib/shipping";
import { site } from "@/lib/site";

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
  const variants: PriceVariant[] = [
    {
      suffix: "standard",
      label: "Standard design",
      amountCents: cents(configuredUnitPrice(product, "standard")),
    },
  ];
  // Only sync custom prices when the product actually offers custom.
  if (product.customUpcharge != null) {
    variants.push(
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
    );
  }
  return variants;
}

/** Product artwork, so Stripe's dashboard, payment page and invoices show it. */
const IMAGES: Record<string, string> = {
  "review-card": "/images/products/google-white.webp",
  "instagram-card": "/images/products/instagram.webp",
  "acrylic-stand": "/images/products/google-white.webp",
};

export async function POST(request: Request) {
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
  const currency = site.currency.code.toLowerCase();
  const liveMode = key.startsWith("sk_live_") || key.startsWith("rk_live_");
  // Absolute origin, so the images we hand Stripe actually resolve.
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    site.url;
  // Sync the live (admin-overridden) prices, not just the catalog defaults.
  const prices = await effectivePrices();
  let productsCreated = 0;
  let productsUpdated = 0;
  let pricesCreated = 0;
  let pricesUnchanged = 0;
  let pricesArchived = 0;
  let shippingRatesCreated = 0;
  let shippingRatesUnchanged = 0;

  try {
    for (const product of products) {
      const stripeId = `taplink-${product.id}`;
      const image = IMAGES[product.id];
      const productData = {
        name: product.name,
        description: `${product.tagline}. ${product.summary}`,
        ...(image ? { images: [`${origin}${image}`] } : {}),
        shippable: true,
        unit_label: product.formFactor.toLowerCase(),
        // General tangible goods, so Stripe Tax can rate these correctly.
        tax_code: "txcd_99999999",
        metadata: {
          taplink_id: product.id,
          slug: product.slug,
          category: product.category,
          form_factor: product.formFactor,
          shipping_units: String(SHIPPING_UNITS[product.formFactor]),
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
      const wantedKeys = new Set<string>();
      for (const variant of variantsFor(
        withPriceOverride(product, prices[product.id]),
      )) {
        const lookupKey = `${stripeId}-${variant.suffix}`;
        wantedKeys.add(lookupKey);
        const match = existing.data.find((p) => p.lookup_key === lookupKey);

        if (
          match &&
          match.unit_amount === variant.amountCents &&
          match.currency === currency
        ) {
          pricesUnchanged++;
          if (variant.suffix === "standard") defaultPriceId = match.id;
          continue;
        }

        // New variant, or the amount/currency changed: create a fresh Price.
        // The lookup key transfers over; the old price is archived after.
        const created = await stripe.prices.create({
          product: stripeId,
          currency,
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

      // Retire prices for variants this product no longer offers — e.g. when
      // custom design is switched off, its prices must stop being live.
      for (const stale of existing.data) {
        if (
          stale.lookup_key &&
          stale.lookup_key.startsWith(`${stripeId}-`) &&
          !wantedKeys.has(stale.lookup_key) &&
          stale.id !== defaultPriceId
        ) {
          await stripe.prices.update(stale.id, { active: false });
          pricesArchived++;
        }
      }
    }

    // Shipping rates, one per zone/bracket. Checkout binds its own inline
    // rate (the amount depends on the cart), but having these in the account
    // means refunds, manual invoices and reporting all use the same numbers.
    const existingRates = await stripe.shippingRates.list({
      active: true,
      limit: 100,
    });
    for (const zone of shippingZones) {
      for (let i = 0; i < zone.tiers.length; i++) {
        const tier = zone.tiers[i];
        const amount = Math.round(tier.price * 100);
        const displayName = `${zone.label} — ${tierRangeLabel(zone, i)} cards`;
        const match = existingRates.data.find(
          (r) => r.metadata?.taplink_key === `${zone.id}-${tier.minQty}`,
        );
        if (
          match &&
          match.fixed_amount?.amount === amount &&
          match.fixed_amount?.currency === currency
        ) {
          shippingRatesUnchanged++;
          continue;
        }
        // Shipping rate amounts are immutable too: supersede and archive.
        await stripe.shippingRates.create({
          display_name: displayName,
          type: "fixed_amount",
          fixed_amount: { amount, currency },
          delivery_estimate: {
            minimum: { unit: "business_day", value: zone.etaMin },
            maximum: { unit: "business_day", value: zone.etaMax },
          },
          metadata: { taplink_key: `${zone.id}-${tier.minQty}` },
        });
        shippingRatesCreated++;
        if (match) {
          await stripe.shippingRates.update(match.id, { active: false });
        }
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
    liveMode,
    currency: currency.toUpperCase(),
    productsCreated,
    productsUpdated,
    pricesCreated,
    pricesUnchanged,
    pricesArchived,
    shippingRatesCreated,
    shippingRatesUnchanged,
  });
}
