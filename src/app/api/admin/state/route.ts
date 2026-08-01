import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  usingDefaultPassword,
  verifySessionToken,
} from "@/lib/adminAuth";
import {
  getSettings,
  saveSettings,
  persistentStore,
  effectivePrices,
  effectiveStock,
  effectiveProductPreorder,
  sanitizePrices,
  sanitizeStock,
  sanitizeProductPreorder,
  type AdminSettings,
} from "@/lib/adminStore";
import { DEFAULT_CARD_STOCK, products } from "@/lib/products";
import { site, PLACEHOLDER_EMAIL } from "@/lib/site";

async function authed(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Current settings plus defaults for the dashboard UI. */
export async function GET() {
  if (!(await authed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [settings, prices, stock, productPreorder] = await Promise.all([
    getSettings(),
    effectivePrices(),
    effectiveStock(),
    effectiveProductPreorder(),
  ]);
  const productList = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    // Effective (current) prices + stock, plus catalog defaults for a reset hint.
    basePrice: prices[p.id].basePrice,
    customUpcharge: prices[p.id].customUpcharge,
    defaultBasePrice: p.basePrice,
    defaultCustomUpcharge: p.customUpcharge,
    stock: stock[p.id],
    defaultStock: DEFAULT_CARD_STOCK,
    preorder: productPreorder[p.id],
  }));
  return NextResponse.json({
    settings,
    defaults: {
      preorder: site.preorder.enabled,
      cardStock: DEFAULT_CARD_STOCK,
    },
    products: productList,
    persistentStore,
    defaultPassword: usingDefaultPassword(),
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeLiveMode: (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_"),
    taxEnabled: process.env.STRIPE_TAX_ENABLED === "1",
    // Public identity: both feed customer-facing output (metadata, Stripe
    // redirects, product image URLs, invoice footer, legal pages).
    siteUrl: site.url,
    siteUrlConfigured: !site.url.startsWith("http://localhost"),
    contactEmail: site.email,
    contactEmailConfigured: site.email !== PLACEHOLDER_EMAIL,
  });
}

export async function POST(request: Request) {
  if (!(await authed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: {
    preorder?: boolean | null;
    stock?: unknown;
    productPreorder?: unknown;
    preorderEndsAt?: unknown;
    prices?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const current = await getSettings();
  const next: AdminSettings = { ...current };

  if (body.preorder === null || typeof body.preorder === "boolean") {
    next.preorder = body.preorder ?? null;
  }

  if (body.stock !== undefined) {
    next.stock = sanitizeStock(body.stock);
  }

  if (body.productPreorder !== undefined) {
    next.productPreorder = sanitizeProductPreorder(body.productPreorder);
  }

  if (body.preorderEndsAt !== undefined) {
    if (body.preorderEndsAt === null) {
      next.preorderEndsAt = null;
    } else {
      const t = Number(body.preorderEndsAt);
      if (!Number.isFinite(t) || t <= 0) {
        return NextResponse.json(
          { error: "Invalid pre-order end date." },
          { status: 400 },
        );
      }
      next.preorderEndsAt = Math.round(t);
    }
  }

  if (body.prices !== undefined) {
    const sanitized = sanitizePrices(body.prices) ?? {};
    // Keep only values that actually differ from the catalog default, so an
    // unchanged product never gets a "frozen" override.
    const overrides: NonNullable<AdminSettings["prices"]> = {};
    for (const p of products) {
      const patch = sanitized[p.id];
      if (!patch) continue;
      const entry: { basePrice?: number; customUpcharge?: number | null } = {};
      if (patch.basePrice !== undefined && patch.basePrice !== p.basePrice) {
        entry.basePrice = patch.basePrice;
      }
      // customUpcharge may be null (custom disabled); store only if it differs
      // from the catalog default.
      if (
        patch.customUpcharge !== undefined &&
        patch.customUpcharge !== p.customUpcharge
      ) {
        entry.customUpcharge = patch.customUpcharge;
      }
      if (Object.keys(entry).length) overrides[p.id] = entry;
    }
    next.prices = Object.keys(overrides).length ? overrides : null;
  }

  await saveSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
