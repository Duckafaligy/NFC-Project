import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { setOrderFulfilled } from "@/lib/adminStore";

/**
 * POST /api/admin/fulfil — marks an order dispatched, or clears that.
 *
 * Body: { id: "cs_...", fulfilled: boolean, tracking?: string }
 *
 * Fulfilment state lives in our own store rather than Stripe, because it is
 * about the physical order (encoded, packed, posted), not the payment.
 * Admin-session protected.
 */
export async function POST(request: Request) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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

  const ok = await setOrderFulfilled(
    id,
    Boolean(body.fulfilled),
    typeof body.tracking === "string" ? body.tracking : null,
  );
  if (!ok) {
    return NextResponse.json(
      { error: "That order is no longer in the log." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
