import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * Admin auth helpers: password check + stateless signed session cookie.
 *
 * The password comes from the ADMIN_PASSWORD env var; until that is set the
 * owner-chosen default below is used. NOTE: the default lives in source, so
 * anyone with read access to the repository can see it — the dashboard
 * shows a reminder until ADMIN_PASSWORD is set in Vercel > Settings >
 * Environment Variables (setting it also invalidates existing sessions).
 */

const DEFAULT_PASSWORD = "Brendan!202";
export const SESSION_COOKIE = "taplink_admin_session";
const SESSION_HOURS = 2;

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

function sessionSecret(): Buffer {
  return createHash("sha256")
    .update("taplink-admin-session-v1:" + adminPassword())
    .digest();
}

export function passwordMatches(candidate: string): boolean {
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(adminPassword()).digest();
  return timingSafeEqual(a, b);
}

/** Returns a session token valid for SESSION_HOURS. */
export function createSessionToken(): { token: string; maxAge: number } {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const sig = createHmac("sha256", sessionSecret())
    .update(String(exp))
    .digest("hex");
  return { token: `${exp}.${sig}`, maxAge: SESSION_HOURS * 3600 };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now() || !sig) return false;
  const expected = createHmac("sha256", sessionSecret())
    .update(expStr)
    .digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
