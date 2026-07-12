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
  const settings = await getSettings();
  return NextResponse.json({
    settings,
    defaults: {
      preorder: site.preorder.enabled,
      cardStock: DEFAULT_CARD_STOCK,
    },
    persistentStore,
    defaultPassword: usingDefaultPassword(),
  });
}

export async function POST(request: Request) {
  if (!(await authed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { preorder?: boolean | null; cardStock?: unknown };
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

  await saveSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
