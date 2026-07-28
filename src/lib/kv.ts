/**
 * Tiny KV helper shared by the tag hub. Uses Upstash Redis over REST when the
 * env vars are present (KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN),
 * otherwise a process-global in-memory Map (fine for local dev / a single
 * instance; resets on redeploy). Mirrors the approach in lib/adminStore.
 */
const kvUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const kvToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvEnabled = Boolean(kvUrl && kvToken);

const memory = ((
  globalThis as typeof globalThis & { __taplinkKv?: Map<string, string> }
).__taplinkKv ??= new Map<string, string>());

export async function kvGet(key: string): Promise<string | null> {
  if (!kvEnabled) return memory.get(key) ?? null;
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

export async function kvSet(key: string, value: string): Promise<void> {
  if (!kvEnabled) {
    memory.set(key, value);
    return;
  }
  try {
    await fetch(
      `${kvUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`,
      {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: "no-store",
      },
    );
  } catch (e) {
    console.error("KV write failed:", e);
  }
}
