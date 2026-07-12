"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { site } from "@/lib/site";

/**
 * Live storefront status controlled from /admin-dashboard.
 * Starts from the static site.ts defaults (so server-rendered HTML matches
 * the first client paint), then refreshes from /api/store-status on mount.
 */
interface StoreStatus {
  preorder: boolean;
  /** Effective stock by product id; missing id = use catalog value. */
  stock: Record<string, number>;
  loaded: boolean;
}

const StoreStatusContext = createContext<StoreStatus>({
  preorder: site.preorder.enabled,
  stock: {},
  loaded: false,
});

export function StoreStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StoreStatus>({
    preorder: site.preorder.enabled,
    stock: {},
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
          stock: data.stock ?? {},
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
