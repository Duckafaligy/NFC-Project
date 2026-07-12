import { products } from "./products";
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
  /** Overrides by product id. Missing id = catalog default stock. */
  stock: Record<string, number>;
}

export interface AttemptRecord {
  fails: number;
  stage: number;
  lockUntil: number;
}

const SETTINGS_KEY = "taplink:admin:settings";
const ATTEMPT_PREFIX = "taplink:admin:attempts:";

const memory = new Map<string, string>();

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
        stock:
          parsed.stock && typeof parsed.stock === "object" ? parsed.stock : {},
      };
    }
  } catch {
    // Corrupt value: fall through to defaults.
  }
  return { preorder: null, stock: {} };
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  await kvSet(SETTINGS_KEY, JSON.stringify(settings));
}

/** The pre-order flag the storefront should actually use right now. */
export async function effectivePreorder(): Promise<boolean> {
  const s = await getSettings();
  return s.preorder ?? site.preorder.enabled;
}

/** Effective stock for every product (admin override, else catalog value). */
export async function effectiveStockMap(): Promise<Record<string, number>> {
  const s = await getSettings();
  const map: Record<string, number> = {};
  for (const p of products) {
    map[p.id] = s.stock[p.id] ?? p.stock;
  }
  return map;
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
