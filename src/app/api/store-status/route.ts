import { NextResponse } from "next/server";
import {
  effectivePreorder,
  effectiveCardStock,
  effectivePrices,
} from "@/lib/adminStore";

/**
 * Public storefront status: the pre-order flag, the shared card pool, and the
 * per-product effective prices the site should display right now (admin
 * overrides merged with catalog defaults).
 */
export async function GET() {
  const [preorder, cardStock, prices] = await Promise.all([
    effectivePreorder(),
    effectiveCardStock(),
    effectivePrices(),
  ]);
  return NextResponse.json(
    { preorder, cardStock, prices },
    { headers: { "Cache-Control": "no-store" } },
  );
}
