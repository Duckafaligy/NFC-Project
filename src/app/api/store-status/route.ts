import { NextResponse } from "next/server";
import {
  effectivePreorder,
  effectiveStock,
  effectivePrices,
} from "@/lib/adminStore";

/**
 * Public storefront status: the pre-order flag, per-product stock, and the
 * per-product effective prices the site should display right now (admin
 * overrides merged with catalog defaults).
 */
export async function GET() {
  const [preorder, stock, prices] = await Promise.all([
    effectivePreorder(),
    effectiveStock(),
    effectivePrices(),
  ]);
  return NextResponse.json(
    { preorder, stock, prices },
    { headers: { "Cache-Control": "no-store" } },
  );
}
