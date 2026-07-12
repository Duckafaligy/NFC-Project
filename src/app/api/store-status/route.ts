import { NextResponse } from "next/server";
import { effectivePreorder, effectiveCardStock } from "@/lib/adminStore";

/**
 * Public storefront status: the pre-order flag and the shared card pool the
 * site should display right now (admin overrides merged with defaults).
 */
export async function GET() {
  const [preorder, cardStock] = await Promise.all([
    effectivePreorder(),
    effectiveCardStock(),
  ]);
  return NextResponse.json(
    { preorder, cardStock },
    { headers: { "Cache-Control": "no-store" } },
  );
}
