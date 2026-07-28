"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { site } from "@/lib/site";
import {
  DEFAULT_CARD_STOCK,
  products,
  type PriceOverride,
} from "@/lib/products";

/**
 * Live storefront status controlled from /admin-dashboard.
 * Starts from the static defaults (so server-rendered HTML matches the
 * first client paint), then refreshes from /api/store-status on mount.
 */
interface StoreStatus {
  /** Global pre-order window state (for the banner / popup). */
  preorder: boolean;
  /** Per-product pre-order state (drives each product's badge + discount). */
  productPreorder: Record<string, boolean>;
  /** Effective per-product stock (admin overrides merged with defaults). */
  stock: Record<string, number>;
  /** Effective per-product prices (admin overrides merged with defaults). */
  prices: Record<string, PriceOverride>;
  loaded: boolean;
}

// Catalog defaults, used before /api/store-status resolves.
const DEFAULT_PRICES: Record<string, PriceOverride> = Object.fromEntries(
  products.map((p) => [
    p.id,
    { basePrice: p.basePrice, customUpcharge: p.customUpcharge },
  ]),
);
const DEFAULT_STOCK: Record<string, number> = Object.fromEntries(
  products.map((p) => [p.id, DEFAULT_CARD_STOCK]),
);
const DEFAULT_PRODUCT_PREORDER: Record<string, boolean> = Object.fromEntries(
  products.map((p) => [p.id, site.preorder.enabled]),
);

const StoreStatusContext = createContext<StoreStatus>({
  preorder: site.preorder.enabled,
  productPreorder: DEFAULT_PRODUCT_PREORDER,
  stock: DEFAULT_STOCK,
  prices: DEFAULT_PRICES,
  loaded: false,
});

export function StoreStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StoreStatus>({
    preorder: site.preorder.enabled,
    productPreorder: DEFAULT_PRODUCT_PREORDER,
    stock: DEFAULT_STOCK,
    prices: DEFAULT_PRICES,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/store-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setStatus({
          preorder: Boolean(data.preorder),
          productPreorder:
            data.productPreorder && typeof data.productPreorder === "object"
              ? { ...DEFAULT_PRODUCT_PREORDER, ...data.productPreorder }
              : DEFAULT_PRODUCT_PREORDER,
          stock:
            data.stock && typeof data.stock === "object"
              ? { ...DEFAULT_STOCK, ...data.stock }
              : DEFAULT_STOCK,
          prices:
            data.prices && typeof data.prices === "object"
              ? { ...DEFAULT_PRICES, ...data.prices }
              : DEFAULT_PRICES,
          loaded: true,
        });
      })
      .catch(() => {
        // Offline or route missing: keep static defaults.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StoreStatusContext.Provider value={status}>
      {children}
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus() {
  return useContext(StoreStatusContext);
}
