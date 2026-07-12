import { NextRequest, NextResponse } from "next/server";
import { adminPassword, verifySessionToken, SESSION_COOKIE } from "@/lib/admin";
import { CARD_STOCK } from "@/lib/products";
import { site } from "@/lib/site";

/** Current state for the dashboard (as baked into this deployment). */
export async function GET(req: NextRequest) {
  const authed = verifySessionToken(
    req.cookies.get(SESSION_COOKIE)?.value,
    adminPassword(),
  );
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    preorderEnabled: site.preorder.enabled,
    cardStock: CARD_STOCK,
    persistence: process.env.GITHUB_TOKEN
      ? "github"
      : process.env.NODE_ENV !== "production"
        ? "file"
        : "none",
  });
}
