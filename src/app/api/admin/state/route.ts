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
import { products } from "@/lib/products";
import { site } from "@/lib/site";

async function authed(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Current settings plus catalog context for the dashboard UI. */
export async function GET() {
  if (!(await authed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json({
    settings,
    defaults: {
      preorder: site.preorder.enabled,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        catalogStock: p.stock,
      })),
    },
    persistentStore,
    defaultPassword: usingDefaultPassword(),
  });
}

export async function POST(request: Request) {
  if (!(await authed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { preorder?: boolean | null; stock?: Record<string, unknown> };
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

  if (body.stock && typeof body.stock === "object") {
    const validIds = new Set(products.map((p) => p.id));
    const stock: Record<string, number> = {};
    for (const [id, raw] of Object.entries(body.stock)) {
      if (!validIds.has(id)) continue;
      const n = Math.floor(Number(raw));
      if (Number.isFinite(n) && n >= 0 && n <= 100000) stock[id] = n;
    }
    next.stock = stock;
  }

  await saveSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
