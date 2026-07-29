"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { lineTotal, compareLineTotal } from "@/lib/pricing";
import { useStoreStatus } from "@/context/StoreStatus";

export type DesignType = "standard" | "custom";
export type CustomMethod = "upload" | "we-design";

export interface CartItem {
  /** Unique key for this exact configuration (product + design options). */
  key: string;
  productId: string;
  slug: string;
  name: string;
  designType: DesignType;
  /** Only present when designType === "custom". */
  customMethod?: CustomMethod;
  /** Optional note (design brief or filename reference). */
  note?: string;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; key: string }
  | { type: "SET_QTY"; key: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

// v4: catalog cut to three products (Google review card, Instagram card,
// acrylic stand) and card colourways removed. Bumping the key drops carts
// saved under the old catalog so removed products can't reach checkout.
const STORAGE_KEY = "taplink-cart-v4";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "ADD": {
      const existing = state.items.find((i) => i.key === action.item.key);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.key === action.item.key
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.key !== action.key) };
    case "SET_QTY":
      return {
        items: state.items
          .map((i) =>
            i.key === action.key ? { ...i, quantity: action.quantity } : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  /** Cart total after the pre-order discount. */
  subtotal: number;
  /** Cart total at full price (for showing the discount saved). */
  compareSubtotal: number;
  addItem: (item: Omit<CartItem, "key"> & { key?: string }) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  /** Slide-out mini cart. */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Build a stable key from the config so identical configs stack. */
export function buildCartKey(
  slug: string,
  designType: DesignType,
  customMethod?: CustomMethod,
) {
  return [slug, designType, customMethod ?? "none"].join("::");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const { productPreorder } = useStoreStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        if (Array.isArray(items)) dispatch({ type: "HYDRATE", items });
      }
    } catch {
      // Ignore malformed storage.
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Storage may be unavailable (private mode) — fail silently.
    }
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((n, i) => n + i.quantity, 0);
    // Subtotal applies each product's own pre-order discount per line.
    const subtotal = state.items.reduce(
      (sum, i) =>
        sum +
        lineTotal(i.unitPrice, i.quantity, productPreorder[i.productId] ?? false),
      0,
    );
    const compareSubtotal = state.items.reduce(
      (sum, i) => sum + compareLineTotal(i.unitPrice, i.quantity),
      0,
    );
    return {
      items: state.items,
      itemCount,
      subtotal,
      compareSubtotal,
      addItem: (item) =>
        dispatch({
          type: "ADD",
          item: {
            ...item,
            key:
              item.key ??
              buildCartKey(item.slug, item.designType, item.customMethod),
          },
        }),
      removeItem: (key) => dispatch({ type: "REMOVE", key }),
      setQuantity: (key, quantity) =>
        dispatch({ type: "SET_QTY", key, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    };
  }, [state.items, drawerOpen, productPreorder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
