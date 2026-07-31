import { NextResponse } from "next/server";
import {
  effectivePreorder,
  effectiveProductPreorder,
  effectiveStock,
  effectivePrices,
} from "@/lib/adminStore";

/**
 * Public storefront status: the global pre-order flag (for banners), the
 * per-product pre-order map, per-product stock, and per-product effective
 * prices — admin overrides merged with catalog defaults — plus whether
 * Stripe Tax is on, so checkout can say tax is added at payment.
 */
export async function GET() {
  const [preorder, productPreorder, stock, prices] = await Promise.all([
    effectivePreorder(),
    effectiveProductPreorder(),
    effectiveStock(),
    effectivePrices(),
  ]);
  return NextResponse.json(
    {
      preorder,
      productPreorder,
      stock,
      prices,
      taxEnabled: process.env.STRIPE_TAX_ENABLED === "1",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
