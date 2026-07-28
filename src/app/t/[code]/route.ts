import { NextResponse } from "next/server";
import { getTag, recordTap, cleanCode } from "@/lib/tags";

// Never cache: a tap must resolve to the tag's current destination.
export const dynamic = "force-dynamic";

/**
 * The URL every physical tag points to: /t/{code} (code = the chip's UID via
 * UID-mirror, or a printed code). A claimed tag redirects to its destination
 * and counts the tap; an unclaimed one sends the first tapper to the setup
 * page to claim + configure it.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await params;
  const code = cleanCode(raw);
  const origin = new URL(req.url).origin;
  if (!code) return NextResponse.redirect(`${origin}/`, 302);

  const tag = await getTag(code);
  if (tag && tag.claimed && tag.destination) {
    await recordTap(code);
    return NextResponse.redirect(tag.destination, 302);
  }
  return NextResponse.redirect(`${origin}/tag/${code}`, 302);
}
