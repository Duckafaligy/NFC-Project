import { NextRequest, NextResponse } from "next/server";
import {
  adminPassword,
  verifySessionToken,
  persistStoreState,
  SESSION_COOKIE,
  type StoreState,
} from "@/lib/admin";

export async function POST(req: NextRequest) {
  const authed = verifySessionToken(
    req.cookies.get(SESSION_COOKIE)?.value,
    adminPassword(),
  );
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    preorderEnabled?: unknown;
    cardStock?: unknown;
  } | null;

  const cardStock = Number(body?.cardStock);
  if (
    !body ||
    typeof body.preorderEnabled !== "boolean" ||
    !Number.isFinite(cardStock)
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const state: StoreState = {
    preorderEnabled: body.preorderEnabled,
    cardStock: Math.min(9999, Math.max(0, Math.round(cardStock))),
  };

  try {
    const result = await persistStoreState(state);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed." },
      { status: 500 },
    );
  }
}
