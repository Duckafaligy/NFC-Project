import { NextResponse } from "next/server";
import { getTag, claimTag, updateTag, cleanCode } from "@/lib/tags";

export const dynamic = "force-dynamic";

/**
 * Tag status for the setup/manage page.
 * GET  /api/tag/{code}?token=…  → status; full editable details only when the
 *      edit token matches (the token is the tag's per-tag secret).
 * POST /api/tag/{code}          → { action: "claim" | "update", … }.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await params;
  const code = cleanCode(raw);
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const tag = await getTag(code);
  if (!tag || !tag.claimed) {
    return NextResponse.json({ code, claimed: false });
  }
  const owner = Boolean(token) && tag.editToken === token;
  return NextResponse.json({
    code,
    claimed: true,
    preset: tag.preset,
    label: tag.label,
    taps: tag.taps,
    owner,
    // Reveal the destination only to the owner (holds the edit token).
    destination: owner ? tag.destination : null,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await params;
  const code = cleanCode(raw);
  if (!code) {
    return NextResponse.json({ error: "Invalid tag code" }, { status: 400 });
  }

  let body: {
    action?: string;
    preset?: string;
    destination?: string;
    label?: string;
    token?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.action === "claim") {
    const r = await claimTag(code, {
      preset: body.preset ?? "",
      destination: body.destination ?? "",
      label: body.label,
    });
    if (!r.ok) {
      const status = r.error === "already-claimed" ? 409 : 400;
      return NextResponse.json({ error: claimError(r.error) }, { status });
    }
    return NextResponse.json({
      ok: true,
      editToken: r.tag.editToken,
      destination: r.tag.destination,
    });
  }

  if (body.action === "update") {
    const r = await updateTag(code, body.token ?? "", {
      preset: body.preset,
      destination: body.destination,
      label: body.label,
    });
    if (!r.ok) {
      const status =
        r.error === "unauthorized" ? 403 : r.error === "not-found" ? 404 : 400;
      return NextResponse.json({ error: updateError(r.error) }, { status });
    }
    return NextResponse.json({ ok: true, destination: r.tag.destination });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

function claimError(code: string): string {
  if (code === "already-claimed") return "This tag is already set up.";
  if (code === "bad-destination")
    return "Enter a valid web link (starting with https://).";
  return "Pick a valid type.";
}

function updateError(code: string): string {
  if (code === "unauthorized")
    return "You don't have permission to edit this tag. Use your edit link.";
  if (code === "not-found") return "Tag not found.";
  if (code === "bad-destination")
    return "Enter a valid web link (starting with https://).";
  return "Pick a valid type.";
}
