import { DEFAULT_CARD_STOCK } from "./products";
import { site } from "./site";

/**
 * Server-side store for admin-controlled settings and login rate limiting.
 *
 * Persistence: if Vercel KV / Upstash env vars are present
 * (KV_REST_API_URL + KV_REST_API_TOKEN) values persist there via plain REST,
 * no SDK needed. Otherwise an in-memory Map is used, which works for local
 * dev and single-instance servers but resets on redeploy/cold start on
 * serverless. For production on Vercel, add the free Upstash KV integration
 * (Storage tab > Create KV) and the env vars appear automatically.
 */

export interface AdminSettings {
  /** null = follow site.ts default. */
  preorder: boolean | null;
  /**
   * Shared card pool override (every product is the same physical card).
   * null = catalog default (DEFAULT_CARD_STOCK).
   */
  cardStock: number | null;
}

export interface AttemptRecord {
  fails: number;
  stage: number;
  lockUntil: number;
}

const SETTINGS_KEY = "taplink:admin:settings";
const ATTEMPT_PREFIX = "taplink:admin:attempts:";

// Shared via globalThis: Next bundles each route separately, so a plain
// module-level Map would give every API route its own copy of the store.
const memory = ((
  globalThis as typeof globalThis & { __taplinkAdminMemory?: Map<string, string> }
).__taplinkAdminMemory ??= new Map<string, string>());

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;

export const persistentStore = Boolean(kvUrl && kvToken);

async function kvGet(key: string): Promise<string | null> {
  if (!persistentStore) return memory.get(key) ?? null;
  const res = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result: string | null };
  return data.result;
}

async function kvSet(key: string, value: string): Promise<void> {
  if (!persistentStore) {
    memory.set(key, value);
    return;
  }
  await fetch(
    `${kvUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`,
    { headers: { Authorization: `Bearer ${kvToken}` }, cache: "no-store" },
  );
}

export async function getSettings(): Promise<AdminSettings> {
  try {
    const raw = await kvGet(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminSettings>;
      return {
        preorder: typeof parsed.preorder === "boolean" ? parsed.preorder : null,
        cardStock:
          typeof parsed.cardStock === "number" &&
          Number.isFinite(parsed.cardStock)
            ? Math.max(0, Math.round(parsed.cardStock))
            : null,
      };
    }
  } catch {
    // Corrupt value: fall through to defaults.
  }
  return { preorder: null, cardStock: null };
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  await kvSet(SETTINGS_KEY, JSON.stringify(settings));
}

/** The pre-order flag the storefront should actually use right now. */
export async function effectivePreorder(): Promise<boolean> {
  const s = await getSettings();
  return s.preorder ?? site.preorder.enabled;
}

/** The shared card pool the storefront should show right now. */
export async function effectiveCardStock(): Promise<number> {
  const s = await getSettings();
  return s.cardStock ?? DEFAULT_CARD_STOCK;
}

/**
 * Subtract a paid order's quantity from the shared pool (called by the
 * Stripe webhook). Clamps at zero.
 */
export async function decrementCardStock(quantity: number): Promise<number> {
  const s = await getSettings();
  const current = s.cardStock ?? DEFAULT_CARD_STOCK;
  const next = Math.max(0, current - Math.max(0, Math.round(quantity)));
  await saveSettings({ ...s, cardStock: next });
  return next;
}

export async function getAttempts(ip: string): Promise<AttemptRecord> {
  try {
    const raw = await kvGet(ATTEMPT_PREFIX + ip);
    if (raw) return JSON.parse(raw) as AttemptRecord;
  } catch {
    // fall through
  }
  return { fails: 0, stage: 0, lockUntil: 0 };
}

export async function saveAttempts(
  ip: string,
  rec: AttemptRecord,
): Promise<void> {
  await kvSet(ATTEMPT_PREFIX + ip, JSON.stringify(rec));
}
