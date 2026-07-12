import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * Server-side helpers for the admin dashboard (/admin-dashboard): password
 * check, signed session cookie, Apple-style per-IP lockout, and persistence
 * of src/data/store-state.json (a git commit in production so every change
 * redeploys the site and lands in history; a plain file write in dev).
 *
 * Server-only: never import this from a client component.
 */

/**
 * Owner-set default password. NOTE: because this lives in the source code,
 * anyone with read access to the repository can see it. Setting the
 * ADMIN_PASSWORD environment variable in Vercel overrides it and is the
 * safer option.
 */
const DEFAULT_PASSWORD = "Brendan!202";

/** The admin password. ADMIN_PASSWORD env var wins over the default. */
export function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

/** Constant-time string comparison (hash first so lengths always match). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// ---------------------------------------------------------------------------
// Session cookie: `${expiryMs}.${hmac(expiryMs)}`, keyed off the password so
// changing ADMIN_PASSWORD invalidates every existing session.
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = "taplink_admin";

function signingKey(pw: string): Buffer {
  return createHash("sha256").update(`taplink-admin-session:${pw}`).digest();
}

export function createSessionToken(pw: string, hours = 8): string {
  const exp = Date.now() + hours * 3_600_000;
  const sig = createHmac("sha256", signingKey(pw))
    .update(String(exp))
    .digest("hex");
  return `${exp}.${sig}`;
}

export function verifySessionToken(
  token: string | undefined,
  pw: string | null,
): boolean {
  if (!token || !pw) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || !sig || Date.now() > exp) return false;
  const expected = createHmac("sha256", signingKey(pw))
    .update(expStr)
    .digest("hex");
  return safeEqual(sig, expected);
}

// ---------------------------------------------------------------------------
// Apple-style per-IP lockout. Attempts 1-9 are free; the 10th wrong password
// locks the IP for 1 minute, and each further wrong attempt escalates:
// 5 minutes, 15 minutes, then 1 hour per attempt.
//
// State is in-memory, so on serverless hosting it is per-instance and resets
// on cold starts. That weakens (but does not remove) the brute-force
// protection; move it to a KV store if the stakes ever rise.
// ---------------------------------------------------------------------------

const LOCK_STEPS_MS = [60_000, 300_000, 900_000, 3_600_000];
const FREE_ATTEMPTS = 9;

interface AttemptRecord {
  fails: number;
  lockUntil: number;
  tier: number;
}

const attempts = new Map<string, AttemptRecord>();

export function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Milliseconds left on this IP's lock, 0 when not locked. */
export function getLockRemaining(ip: string): number {
  const a = attempts.get(ip);
  if (!a) return 0;
  return Math.max(0, a.lockUntil - Date.now());
}

export function recordFailure(ip: string): {
  locked: boolean;
  remainingMs: number;
  attemptsLeft: number;
} {
  const a = attempts.get(ip) ?? { fails: 0, lockUntil: 0, tier: -1 };
  a.fails += 1;
  if (a.fails > FREE_ATTEMPTS) {
    a.tier = Math.min(a.tier + 1, LOCK_STEPS_MS.length - 1);
    a.lockUntil = Date.now() + LOCK_STEPS_MS[a.tier];
  }
  attempts.set(ip, a);
  return {
    locked: a.lockUntil > Date.now(),
    remainingMs: Math.max(0, a.lockUntil - Date.now()),
    attemptsLeft: Math.max(0, FREE_ATTEMPTS + 1 - a.fails),
  };
}

export function clearFailures(ip: string): void {
  attempts.delete(ip);
}

// ---------------------------------------------------------------------------
// Persistence for src/data/store-state.json
// ---------------------------------------------------------------------------

export interface StoreState {
  preorderEnabled: boolean;
  /** Cards left in the shared pool (all products are the same card). */
  cardStock: number;
}

const STORE_PATH = "src/data/store-state.json";

function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return {
    token,
    repo: process.env.GITHUB_REPO ?? "Duckafaligy/NFC-Project",
    branch: process.env.GITHUB_BRANCH ?? "main",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "taplink-admin-dashboard",
    },
  };
}

/**
 * Read the LIVE store state (GitHub in production, local file in dev), not
 * the value baked into this deployment. Used by the Stripe webhook so stock
 * decrements are based on the latest committed number.
 */
export async function readCurrentStoreState(): Promise<StoreState> {
  const gh = githubConfig();
  if (gh) {
    const api = `https://api.github.com/repos/${gh.repo}/contents/${STORE_PATH}?ref=${gh.branch}`;
    const res = await fetch(api, { headers: gh.headers, cache: "no-store" });
    if (!res.ok) throw new Error(`Could not read state from GitHub (${res.status}).`);
    const data = (await res.json()) as { content: string };
    return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
  }
  const { readFile } = await import("fs/promises");
  const { join } = await import("path");
  return JSON.parse(await readFile(join(process.cwd(), STORE_PATH), "utf8"));
}

/**
 * Save the new state. Production: commit to GitHub (needs GITHUB_TOKEN with
 * contents read/write on the repo) -> Vercel redeploys -> live in ~2 min.
 * Dev: write the file locally; the dev server hot-reloads it.
 */
export async function persistStoreState(
  state: StoreState,
  message = "Admin dashboard: update stock / pre-order state",
): Promise<{ method: "github" | "file"; note: string }> {
  const content = JSON.stringify(state, null, 2) + "\n";

  const gh = githubConfig();
  if (gh) {
    const api = `https://api.github.com/repos/${gh.repo}/contents/${STORE_PATH}`;

    const current = await fetch(`${api}?ref=${gh.branch}`, {
      headers: gh.headers,
      cache: "no-store",
    });
    if (!current.ok) {
      throw new Error(`Could not read current state from GitHub (${current.status}).`);
    }
    const { sha } = (await current.json()) as { sha: string };

    const put = await fetch(api, {
      method: "PUT",
      headers: gh.headers,
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        sha,
        branch: gh.branch,
      }),
    });
    if (!put.ok) {
      throw new Error(`GitHub rejected the update (${put.status}).`);
    }
    return {
      method: "github",
      note: `Saved and committed to ${gh.branch}. The site redeploys automatically; changes are live in about 2 minutes.`,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    const { writeFile } = await import("fs/promises");
    const { join } = await import("path");
    await writeFile(join(process.cwd(), STORE_PATH), content, "utf8");
    return {
      method: "file",
      note: "Saved locally (dev mode). The dev server reloads the change immediately.",
    };
  }

  throw new Error(
    "GITHUB_TOKEN is not configured, so changes cannot be saved in production. Add it in Vercel > Settings > Environment Variables.",
  );
}

/**
 * Decrement the shared card stock (used by the Stripe webhook after a paid
 * order). Reads the live state first so concurrent updates aren't clobbered
 * by this deployment's stale build-time value.
 */
export async function decrementCardStock(quantity: number): Promise<void> {
  const state = await readCurrentStoreState();
  const next = Math.max(0, Math.round(state.cardStock) - Math.max(0, quantity));
  if (next === state.cardStock) return;
  await persistStoreState(
    { ...state, cardStock: next },
    `Stripe order: card stock ${state.cardStock} -> ${next}`,
  );
}
