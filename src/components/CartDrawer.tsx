"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/products";
import { site } from "@/lib/site";
import { formatPrice, cn } from "@/lib/utils";
import { lineTotal, preorderActive } from "@/lib/pricing";
import { ProductVisual } from "./ProductVisual";
import { ButtonLink } from "./Button";

/** Slide-out mini cart. Opens when items are added or the cart icon is clicked. */
export function CartDrawer() {
  const {
    items,
    subtotal,
    compareSubtotal,
    itemCount,
    setQuantity,
    removeItem,
    drawerOpen,
    closeDrawer,
  } = useCart();

  const remaining = site.shipping.freeThreshold - subtotal;
  const progress = Math.min(100, (subtotal / site.shipping.freeThreshold) * 100);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-[60] bg-neutral-900/40 transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-lift transition-transform duration-300",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="font-display text-lg font-extrabold text-neutral-900">
            Your cart{itemCount > 0 && ` (${itemCount})`}
          </h2>
          <button
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
          {remaining > 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-neutral-700">
              <Truck className="h-4 w-4 text-blue-600" />
              Add <strong>{formatPrice(remaining)}</strong> more for free
              shipping
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
              <Truck className="h-4 w-4" /> You&apos;ve unlocked free shipping!
            </p>
          )}
          <div className="mt-2 h-2 overflow-hidden rounded-md bg-white">
            <div
              className="h-full rounded-md bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-md bg-neutral-100 text-neutral-400">
                <ShoppingBag className="h-7 w-7" />
              </span>
              <p className="font-semibold text-neutral-900">
                Your cart is empty
              </p>
              <p className="text-sm text-neutral-500">
                Add a card and it&apos;ll show up here.
              </p>
              <button
                onClick={closeDrawer}
                className="mt-2 text-sm font-semibold text-neutral-900 hover:text-neutral-900"
              >
                Keep browsing →
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const product = getProduct(item.slug);
                return (
                  <li key={item.key} className="flex gap-3">
                    <div className="w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200">
                      <ProductVisual
                        name={item.name}
                        accent={product?.accent ?? ["#FB923C", "#F472B6"]}
                        className="aspect-square rounded-none"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.designType === "custom"
                              ? "Custom design"
                              : "Standard design"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-neutral-400 hover:text-red-500"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-md border border-neutral-200 p-0.5">
                          <button
                            onClick={() => setQuantity(item.key, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.key, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">
                          {formatPrice(lineTotal(item.unitPrice, item.quantity))}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 px-5 py-4">
            {preorderActive() && compareSubtotal > subtotal && (
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>Pre-order discount</span>
                <span>-{formatPrice(compareSubtotal - subtotal)}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-display text-lg font-extrabold text-neutral-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Shipping calculated at checkout. Pre-order pricing already
              applied.
            </p>
            <ButtonLink
              href="/checkout"
              size="lg"
              className="mt-4 w-full"
              onClick={closeDrawer}
            >
              Go to checkout
            </ButtonLink>
            <button
              onClick={closeDrawer}
              className="mt-2 w-full text-center text-sm font-semibold text-neutral-500 hover:text-neutral-900"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
