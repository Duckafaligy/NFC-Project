import { NextResponse } from "next/server";
import { effectivePreorder, effectiveStockMap } from "@/lib/adminStore";

/**
 * Public storefront status: the pre-order flag and per-product stock the
 * site should display right now (admin overrides merged with the catalog).
 */
export async function GET() {
  const [preorder, stock] = await Promise.all([
    effectivePreorder(),
    effectiveStockMap(),
  ]);
  return NextResponse.json(
    { preorder, stock },
    { headers: { "Cache-Control": "no-store" } },
  );
}
