import { kvGet, kvSet } from "./kv";

/**
 * The tag hub: each physical NFC tag carries a fixed URL to /t/{code}
 * (the code is the chip's UID via UID-mirror, or a printed code). The first
 * person to tap an unclaimed tag configures where it points; after that, a
 * tap redirects there. The owner edits the destination anytime with the
 * tag's edit token — no re-touching the card.
 */
export interface Tag {
  code: string;
  claimed: boolean;
  /** Which preset the owner picked (guides copy; all presets redirect). */
  preset: string;
  /** The http(s) URL a tap opens. */
  destination: string;
  label: string;
  /** Secret that authorizes edits (handed to the claimer once). */
  editToken: string;
  taps: number;
  createdAt: number;
  claimedAt: number | null;
}

export const TAG_PRESETS = [
  {
    id: "review",
    label: "Google review",
    help: "Paste your Google review link — a tap opens your review page.",
    placeholder: "https://g.page/r/…/review",
  },
  {
    id: "instagram",
    label: "Instagram",
    help: "Your Instagram profile URL.",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    id: "menu",
    label: "Menu",
    help: "A link to your digital menu.",
    placeholder: "https://…",
  },
  {
    id: "website",
    label: "Website",
    help: "Any page — homepage, booking, or store.",
    placeholder: "https://…",
  },
  {
    id: "link",
    label: "Anything",
    help: "Any link you want the tap to open.",
    placeholder: "https://…",
  },
] as const;

export function isValidPreset(id: string): boolean {
  return TAG_PRESETS.some((p) => p.id === id);
}

const KEY = (code: string) => `taplink:tag:${code}`;

/** Only allow safe characters in a code (it comes off a physical tag/UID). */
export function cleanCode(raw: string): string {
  return (raw || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
}

/**
 * Validate + normalize a destination. http/https only (blocks javascript:,
 * data:, etc. — an open redirect to those would be an XSS/phishing vector).
 * Bare domains get https:// prepended. Returns null when invalid.
 */
export function cleanDestination(raw: string): string | null {
  const s = (raw || "").trim();
  if (!s || s.length > 2000) return null;
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    try {
      url = new URL("https://" + s);
    } catch {
      return null;
    }
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url.toString();
}

export async function getTag(code: string): Promise<Tag | null> {
  const raw = await kvGet(KEY(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Tag;
  } catch {
    return null;
  }
}

async function saveTag(tag: Tag): Promise<void> {
  await kvSet(KEY(tag.code), JSON.stringify(tag));
}

type ClaimInput = { preset: string; destination: string; label?: string };
type ClaimResult =
  | { ok: true; tag: Tag }
  | { ok: false; error: "already-claimed" | "bad-destination" | "bad-preset" };

export async function claimTag(
  code: string,
  input: ClaimInput,
): Promise<ClaimResult> {
  const existing = await getTag(code);
  if (existing && existing.claimed) return { ok: false, error: "already-claimed" };
  if (!isValidPreset(input.preset)) return { ok: false, error: "bad-preset" };
  const dest = cleanDestination(input.destination);
  if (!dest) return { ok: false, error: "bad-destination" };

  const tag: Tag = {
    code,
    claimed: true,
    preset: input.preset,
    destination: dest,
    label: (input.label ?? "").slice(0, 80),
    editToken: crypto.randomUUID().replace(/-/g, ""),
    taps: existing?.taps ?? 0,
    createdAt: existing?.createdAt ?? Date.now(),
    claimedAt: Date.now(),
  };
  await saveTag(tag);
  return { ok: true, tag };
}

type UpdateResult =
  | { ok: true; tag: Tag }
  | { ok: false; error: "not-found" | "unauthorized" | "bad-destination" | "bad-preset" };

export async function updateTag(
  code: string,
  token: string,
  patch: { preset?: string; destination?: string; label?: string },
): Promise<UpdateResult> {
  const tag = await getTag(code);
  if (!tag || !tag.claimed) return { ok: false, error: "not-found" };
  if (!token || tag.editToken !== token) return { ok: false, error: "unauthorized" };

  if (patch.preset !== undefined) {
    if (!isValidPreset(patch.preset)) return { ok: false, error: "bad-preset" };
    tag.preset = patch.preset;
  }
  if (patch.destination !== undefined) {
    const dest = cleanDestination(patch.destination);
    if (!dest) return { ok: false, error: "bad-destination" };
    tag.destination = dest;
  }
  if (patch.label !== undefined) tag.label = patch.label.slice(0, 80);
  await saveTag(tag);
  return { ok: true, tag };
}

/** Best-effort tap counter (called on redirect). */
export async function recordTap(code: string): Promise<void> {
  const tag = await getTag(code);
  if (!tag) return;
  tag.taps = (tag.taps ?? 0) + 1;
  await saveTag(tag);
}
