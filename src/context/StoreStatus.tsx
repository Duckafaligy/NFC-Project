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
  preorder: boolean;
  /** Shared card pool — every product is the same physical card. */
  cardStock: number;
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

const StoreStatusContext = createContext<StoreStatus>({
  preorder: site.preorder.enabled,
  cardStock: DEFAULT_CARD_STOCK,
  prices: DEFAULT_PRICES,
  loaded: false,
});

export function StoreStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StoreStatus>({
    preorder: site.preorder.enabled,
    cardStock: DEFAULT_CARD_STOCK,
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
          cardStock: Number.isFinite(Number(data.cardStock))
            ? Math.max(0, Number(data.cardStock))
            : DEFAULT_CARD_STOCK,
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
