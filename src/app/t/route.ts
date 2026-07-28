import { NextResponse } from "next/server";
import { cleanCode } from "@/lib/tags";

export const dynamic = "force-dynamic";

/**
 * Supports tags encoded with a UID-mirror query, e.g. /t?uid=04A1B2C3.
 * Normalizes to /t/{code} so the [code] handler resolves it.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = cleanCode(url.searchParams.get("uid") ?? "");
  if (!code) return NextResponse.redirect(`${url.origin}/`, 302);
  return NextResponse.redirect(`${url.origin}/t/${code}`, 302);
}
