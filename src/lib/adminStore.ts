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
   * Per-product stock overrides, keyed by product id (each design is now its
   * own SKU). Missing product / null = catalog default (DEFAULT_CARD_STOCK).
   */
  stock: Record<string, number> | null;
  /**
   * Per-product pre-order overrides, keyed by product id. Missing product =
   * follow the global pre-order flag below. The global auto-end date still
   * applies to every product that is on pre-order.
   */
  productPreorder: Record<string, boolean> | null;
  /**
   * Auto-end for the pre-order window (ms epoch). When set and passed,
   * effectivePreorder() reports false without anyone touching the toggle.
   * null = stays on until switched off manually.
   */
  preorderEndsAt: number | null;
  /**
   * Per-product price overrides set from the dashboard, keyed by product id.
   * Only the fields present override the catalog default (lib/products).
   * A `customUpcharge` of null explicitly disables the custom option.
   * null / missing product = use the catalog price.
   */
  prices: Record<
    string,
    { basePrice?: number; customUpcharge?: number | null }
  > | null;
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
        stock: sanitizeStock(parsed.stock),
        productPreorder: sanitizeProductPreorder(parsed.productPreorder),
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
  return {
    preorder: null,
    stock: null,
    productPreorder: null,
    preorderEndsAt: null,
    prices: null,
  };
}

/** Keep only boolean per-product pre-order flags. */
function sanitizeProductPreorder(raw: unknown): AdminSettings["productPreorder"] {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, boolean> = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "boolean") out[id] = v;
  }
  return Object.keys(out).length ? out : null;
}

export { sanitizeProductPreorder };

/** Keep only valid per-product stock counts (non-negative integers). */
function sanitizeStock(raw: unknown): AdminSettings["stock"] {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, number> = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0 && n <= 100000) {
      out[id] = Math.round(n);
    }
  }
  return Object.keys(out).length ? out : null;
}

export { sanitizeStock };

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
    const entry: { basePrice?: number; customUpcharge?: number | null } = {};
    if (basePrice !== undefined) entry.basePrice = basePrice;
    // null explicitly disables custom; a number sets the upcharge.
    if (p.customUpcharge === null) {
      entry.customUpcharge = null;
    } else {
      const c = cleanPrice(p.customUpcharge);
      if (c !== undefined) entry.customUpcharge = c;
    }
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
    // customUpcharge override may be null (custom disabled), so detect the
    // key's presence rather than checking for a number.
    const hasCustom =
      o != null && Object.prototype.hasOwnProperty.call(o, "customUpcharge");
    out[p.id] = {
      basePrice: typeof o?.basePrice === "number" ? o.basePrice : p.basePrice,
      customUpcharge: hasCustom ? (o.customUpcharge ?? null) : p.customUpcharge,
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

/**
 * Per-product pre-order state: each product's own override, or the global
 * flag when it has none. The global auto-end date switches any on-pre-order
 * product off once it passes.
 */
export async function effectiveProductPreorder(): Promise<
  Record<string, boolean>
> {
  const s = await getSettings();
  const globalOn = s.preorder ?? site.preorder.enabled;
  const ended = s.preorderEndsAt !== null && Date.now() >= s.preorderEndsAt;
  const overrides = s.productPreorder ?? {};
  const out: Record<string, boolean> = {};
  for (const p of products) {
    let on = p.id in overrides ? overrides[p.id] : globalOn;
    if (on && ended) on = false;
    out[p.id] = on;
  }
  return out;
}

/** Per-product stock the storefront should show right now (override ?? default). */
export async function effectiveStock(): Promise<Record<string, number>> {
  const s = await getSettings();
  const overrides = s.stock ?? {};
  const out: Record<string, number> = {};
  for (const p of products) {
    const o = overrides[p.id];
    out[p.id] = typeof o === "number" ? o : DEFAULT_CARD_STOCK;
  }
  return out;
}

/**
 * Subtract a paid order's quantity from one product's stock (called by the
 * Stripe webhook). Clamps at zero. Returns before/after so callers can detect
 * the low-stock threshold crossing.
 */
export async function decrementStock(
  productId: string,
  quantity: number,
): Promise<{ previous: number; next: number }> {
  const s = await getSettings();
  const stock = { ...(s.stock ?? {}) };
  const previous = typeof stock[productId] === "number" ? stock[productId] : DEFAULT_CARD_STOCK;
  const next = Math.max(0, previous - Math.max(0, Math.round(quantity)));
  stock[productId] = next;
  await saveSettings({ ...s, stock });
  return { previous, next };
}

/** Add stock back to one product (full refunds). Caps at a sane maximum. */
export async function incrementStock(
  productId: string,
  quantity: number,
): Promise<number> {
  const s = await getSettings();
  const stock = { ...(s.stock ?? {}) };
  const current = typeof stock[productId] === "number" ? stock[productId] : DEFAULT_CARD_STOCK;
  const next = Math.min(100000, current + Math.max(0, Math.round(quantity)));
  stock[productId] = next;
  await saveSettings({ ...s, stock });
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
