import { DEFAULT_CARD_STOCK, products, type PriceOverride } from "./products";
import { site } from "./site";

/**
 * Server-side store for admin-controlled settings and login rate limiting.
 *
 * Persistence: if Upstash Redis env vars are present (KV_REST_API_URL +
 * KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 * values persist there via plain REST, no SDK needed. Otherwise an
 * in-memory Map is used, which works for local dev and single-instance
 * servers but resets on redeploy/cold start on serverless. For production
 * on Vercel: Storage tab > "Upstash for Redis" — the env vars appear
 * automatically.
 */

export interface AdminSettings {
  /** null = follow site.ts default. */
  preorder: boolean | null;
  /**
   * Shared card pool override (every product is the same physical card).
   * null = catalog default (DEFAULT_CARD_STOCK).
   */
  cardStock: number | null;
  /**
   * Auto-end for the pre-order window (ms epoch). When set and passed,
   * effectivePreorder() reports false without anyone touching the toggle.
   * null = stays on until switched off manually.
   */
  preorderEndsAt: number | null;
  /**
   * Per-product price overrides set from the dashboard, keyed by product id.
   * Only the fields present override the catalog default (lib/products).
   * null / missing product = use the catalog price.
   */
  prices: Record<string, { basePrice?: number; customUpcharge?: number }> | null;
}

/** One fulfilled Stripe order, logged by the webhook for the dashboard. */
export interface OrderRecord {
  /** Stripe checkout session id. */
  id: string;
  /** ms epoch when the webhook processed it. */
  at: number;
  email: string | null;
  /** Dollars actually charged. */
  total: number;
  /** Cards in the order (what was subtracted from the pool). */
  quantity: number;
  /** Human line summaries, e.g. "Google Review Card ×2". */
  items: string[];
  preorder: boolean;
  refunded?: boolean;
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

// Vercel's old KV product used KV_REST_API_*; the current "Upstash for
// Redis" marketplace integration uses UPSTASH_REDIS_REST_*. Accept both.
const kvUrl =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const kvToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const persistentStore = Boolean(kvUrl && kvToken);

// Both helpers fail soft: a KV outage degrades persistence for a moment
// instead of turning admin login or the Stripe webhook into 500s.
async function kvGet(key: string): Promise<string | null> {
  if (!persistentStore) return memory.get(key) ?? null;
  try {
    const res = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: string | null };
    return data.result;
  } catch (e) {
    console.error("KV read failed:", e);
    return null;
  }
}

async function kvSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  if (!persistentStore) {
    memory.set(key, value);
    return;
  }
  try {
    const url =
      `${kvUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}` +
      (ttlSeconds ? `?EX=${ttlSeconds}` : "");
    await fetch(url, {
      headers: { Authorization: `Bearer ${kvToken}` },
      cache: "no-store",
    });
  } catch (e) {
    console.error("KV write failed:", e);
  }
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
        preorderEndsAt:
          typeof parsed.preorderEndsAt === "number" &&
          Number.isFinite(parsed.preorderEndsAt)
            ? parsed.preorderEndsAt
            : null,
        prices: sanitizePrices(parsed.prices),
      };
    }
  } catch {
    // Corrupt value: fall through to defaults.
  }
  return { preorder: null, cardStock: null, preorderEndsAt: null, prices: null };
}

/** A price in dollars, rounded to cents, within a sane 0–100000 range. */
function cleanPrice(v: unknown): number | undefined {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return undefined;
  return Math.round(n * 100) / 100;
}

/** Keep only recognized numeric price fields from stored/submitted overrides. */
function sanitizePrices(
  raw: unknown,
): AdminSettings["prices"] {
  if (!raw || typeof raw !== "object") return null;
  const out: NonNullable<AdminSettings["prices"]> = {};
  for (const [id, patch] of Object.entries(raw as Record<string, unknown>)) {
    if (!patch || typeof patch !== "object") continue;
    const p = patch as { basePrice?: unknown; customUpcharge?: unknown };
    const basePrice = cleanPrice(p.basePrice);
    const customUpcharge = cleanPrice(p.customUpcharge);
    const entry: { basePrice?: number; customUpcharge?: number } = {};
    if (basePrice !== undefined) entry.basePrice = basePrice;
    if (customUpcharge !== undefined) entry.customUpcharge = customUpcharge;
    if (Object.keys(entry).length) out[id] = entry;
  }
  return Object.keys(out).length ? out : null;
}

export { sanitizePrices };

/**
 * The effective price for every product right now: the admin override merged
 * over the catalog default. The storefront (via /api/store-status) and the
 * Stripe checkout route both read this so displayed and charged prices agree.
 */
export async function effectivePrices(): Promise<Record<string, PriceOverride>> {
  const s = await getSettings();
  const overrides = s.prices ?? {};
  const out: Record<string, PriceOverride> = {};
  for (const p of products) {
    const o = overrides[p.id];
    out[p.id] = {
      basePrice: typeof o?.basePrice === "number" ? o.basePrice : p.basePrice,
      customUpcharge:
        typeof o?.customUpcharge === "number"
          ? o.customUpcharge
          : p.customUpcharge,
    };
  }
  return out;
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  await kvSet(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * The pre-order flag the storefront should actually use right now,
 * honouring the optional auto-end date.
 */
export async function effectivePreorder(): Promise<boolean> {
  const s = await getSettings();
  const on = s.preorder ?? site.preorder.enabled;
  if (on && s.preorderEndsAt !== null && Date.now() >= s.preorderEndsAt) {
    return false;
  }
  return on;
}

/** The shared card pool the storefront should show right now. */
export async function effectiveCardStock(): Promise<number> {
  const s = await getSettings();
  return s.cardStock ?? DEFAULT_CARD_STOCK;
}

/**
 * Subtract a paid order's quantity from the shared pool (called by the
 * Stripe webhook). Clamps at zero. Returns before/after so callers can
 * detect the low-stock threshold crossing.
 */
export async function decrementCardStock(
  quantity: number,
): Promise<{ previous: number; next: number }> {
  const s = await getSettings();
  const previous = s.cardStock ?? DEFAULT_CARD_STOCK;
  const next = Math.max(0, previous - Math.max(0, Math.round(quantity)));
  await saveSettings({ ...s, cardStock: next });
  return { previous, next };
}

/** Add cards back to the pool (full refunds). Caps at a sane maximum. */
export async function incrementCardStock(quantity: number): Promise<number> {
  const s = await getSettings();
  const current = s.cardStock ?? DEFAULT_CARD_STOCK;
  const next = Math.min(100000, current + Math.max(0, Math.round(quantity)));
  await saveSettings({ ...s, cardStock: next });
  return next;
}

// ---------------------------------------------------------------------------
// Stripe webhook support: event de-duplication + order log
// ---------------------------------------------------------------------------

const EVENT_PREFIX = "taplink:stripe:event:";
const ORDERS_KEY = "taplink:admin:orders";
const ORDERS_KEPT = 50;

/**
 * Claim a Stripe event id so retried/duplicate webhook deliveries are
 * processed exactly once. Returns false when the id was already handled.
 * Claims expire after 7 days (Stripe never retries older events).
 */
export async function claimStripeEvent(eventId: string): Promise<boolean> {
  const key = EVENT_PREFIX + eventId;
  if (await kvGet(key)) return false;
  await kvSet(key, "1", 7 * 24 * 3600);
  return true;
}

/** Most recent orders first. */
export async function getOrders(): Promise<OrderRecord[]> {
  try {
    const raw = await kvGet(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as OrderRecord[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupt value: treat as empty.
  }
  return [];
}

/** Prepend an order, keeping the most recent ORDERS_KEPT. */
export async function logOrder(order: OrderRecord): Promise<void> {
  const orders = await getOrders();
  const next = [order, ...orders.filter((o) => o.id !== order.id)].slice(
    0,
    ORDERS_KEPT,
  );
  await kvSet(ORDERS_KEY, JSON.stringify(next));
}

/** Flag a logged order as refunded (if it is still in the log). */
export async function markOrderRefunded(sessionId: string): Promise<void> {
  const orders = await getOrders();
  let changed = false;
  const next = orders.map((o) => {
    if (o.id === sessionId && !o.refunded) {
      changed = true;
      return { ...o, refunded: true };
    }
    return o;
  });
  if (changed) await kvSet(ORDERS_KEY, JSON.stringify(next));
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
