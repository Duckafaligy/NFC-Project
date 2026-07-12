import { NextResponse } from "next/server";
import {
  createSessionToken,
  getClientIp,
  passwordMatches,
  SESSION_COOKIE,
  usingDefaultPassword,
} from "@/lib/adminAuth";
import { getAttempts, saveAttempts } from "@/lib/adminStore";

/**
 * Admin login with Apple-style escalating lockouts per IP:
 * after 10 failed attempts the IP is locked for 1 minute; every further
 * wrong attempt escalates the lock (5 min, 15 min, then 60 min repeating).
 * A correct password resets the counter.
 */

const MAX_FAILS = 10;
const LOCK_STAGES_SECONDS = [60, 300, 900, 3600];

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const rec = await getAttempts(ip);

  if (rec.lockUntil > now) {
    return NextResponse.json(
      {
        error: "locked",
        retryAfter: Math.ceil((rec.lockUntil - now) / 1000),
      },
      { status: 429 },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const candidate = String(body.password ?? "");

  if (!passwordMatches(candidate)) {
    rec.fails += 1;
    if (rec.fails >= MAX_FAILS) {
      const stageIdx = Math.min(rec.stage, LOCK_STAGES_SECONDS.length - 1);
      const lockSeconds = LOCK_STAGES_SECONDS[stageIdx];
      rec.stage += 1;
      rec.lockUntil = now + lockSeconds * 1000;
      await saveAttempts(ip, rec);
      return NextResponse.json(
        { error: "locked", retryAfter: lockSeconds },
        { status: 429 },
      );
    }
    await saveAttempts(ip, rec);
    return NextResponse.json(
      { error: "wrong-password", attemptsLeft: MAX_FAILS - rec.fails },
      { status: 401 },
    );
  }

  // Success: clear the slate for this IP and issue a session cookie.
  await saveAttempts(ip, { fails: 0, stage: 0, lockUntil: 0 });
  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({
    ok: true,
    defaultPassword: usingDefaultPassword(),
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
