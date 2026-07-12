import { NextResponse } from "next/server";
import {
  adminPassword,
  safeEqual,
  createSessionToken,
  getIp,
  getLockRemaining,
  recordFailure,
  clearFailures,
  SESSION_COOKIE,
} from "@/lib/admin";

export async function POST(req: Request) {
  const pw = adminPassword();
  if (!pw) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 503 },
    );
  }

  const ip = getIp(req);

  const lockedMs = getLockRemaining(ip);
  if (lockedMs > 0) {
    return NextResponse.json(
      { error: "locked", remainingMs: lockedMs },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}) as { password?: unknown });
  const supplied = typeof body.password === "string" ? body.password : "";

  if (!supplied || !safeEqual(supplied, pw)) {
    const r = recordFailure(ip);
    if (r.locked) {
      return NextResponse.json(
        { error: "locked", remainingMs: r.remainingMs },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "wrong", attemptsLeft: r.attemptsLeft },
      { status: 401 },
    );
  }

  clearFailures(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(pw), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 3600,
  });
  return res;
}
