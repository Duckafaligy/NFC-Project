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
  type AdminSettings,
} from "@/lib/adminStore";
import { DEFAULT_CARD_STOCK } from "@/lib/products";
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
  const [settings, orders] = await Promise.all([getSettings(), getOrders()]);
  return NextResponse.json({
    settings,
    defaults: {
      preorder: site.preorder.enabled,
      cardStock: DEFAULT_CARD_STOCK,
    },
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

  await saveSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
