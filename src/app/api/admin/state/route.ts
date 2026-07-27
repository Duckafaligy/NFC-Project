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
  getOrders,
  persistentStore,
  effectivePrices,
  sanitizePrices,
  type AdminSettings,
} from "@/lib/adminStore";
import { DEFAULT_CARD_STOCK, products } from "@/lib/products";
import { site } from "@/lib/site";

async function authed(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Current settings plus defaults for the dashboard UI. */
export async function GET() {
  if (!(await authed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [settings, orders, prices] = await Promise.all([
    getSettings(),
    getOrders(),
    effectivePrices(),
  ]);
  const productList = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    // Effective (current) prices, plus the catalog defaults for a "reset" hint.
    basePrice: prices[p.id].basePrice,
    customUpcharge: prices[p.id].customUpcharge,
    defaultBasePrice: p.basePrice,
    defaultCustomUpcharge: p.customUpcharge,
  }));
  return NextResponse.json({
    settings,
    defaults: {
      preorder: site.preorder.enabled,
      cardStock: DEFAULT_CARD_STOCK,
    },
    products: productList,
    orders,
    persistentStore,
    defaultPassword: usingDefaultPassword(),
    alertsConfigured: Boolean(
      process.env.RESEND_API_KEY && process.env.LOW_STOCK_ALERT_EMAIL,
    ),
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeLiveMode: (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_"),
  });
}

export async function POST(request: Request) {
  if (!(await authed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: {
    preorder?: boolean | null;
    cardStock?: unknown;
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

  if (body.cardStock !== undefined) {
    const n = Math.floor(Number(body.cardStock));
    if (!Number.isFinite(n) || n < 0 || n > 100000) {
      return NextResponse.json(
        { error: "Invalid stock amount." },
        { status: 400 },
      );
    }
    next.cardStock = n;
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
      const entry: { basePrice?: number; customUpcharge?: number } = {};
      if (patch.basePrice !== undefined && patch.basePrice !== p.basePrice) {
        entry.basePrice = patch.basePrice;
      }
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
