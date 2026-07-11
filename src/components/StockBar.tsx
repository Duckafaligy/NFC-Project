"use client";

import { useEffect, useState } from "react";
import { STOCK_BATCH, LOW_STOCK } from "@/lib/products";

/**
 * Availability bar for the product page, following stock-display research:
 * tiered messaging (calm green while stock is healthy, amber with the exact
 * count once it drops to LOW_STOCK or less), specific numbers over vague
 * warnings, and honest data straight from the catalog. The fill animates in
 * on mount; the low state gets a soft pulsing dot for urgency.
 */
export function StockBar({ stock }: { stock: number }) {
  const pct = Math.max(0, Math.min(100, (stock / STOCK_BATCH) * 100));
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setFill(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  const out = stock <= 0;
  const low = !out && stock <= LOW_STOCK;

  return (
    <div className="mt-5 rounded-md bg-neutral-100 p-3.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span
          className={`flex items-center gap-1.5 font-bold ${
            out ? "text-neutral-500" : low ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {low && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-sm bg-amber-500 opacity-60" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-sm ${
                out ? "bg-neutral-400" : low ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </span>
          {out
            ? "Out of stock — next print run coming"
            : low
              ? `Only ${stock} left — almost gone`
              : "In stock — ready to ship"}
        </span>
        <span className="font-semibold text-neutral-400">
          {stock}/{STOCK_BATCH} in this print run
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-neutral-200">
        <div
          className={`h-full rounded-sm transition-[width] duration-700 ease-out ${
            out ? "bg-neutral-300" : low ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
}
