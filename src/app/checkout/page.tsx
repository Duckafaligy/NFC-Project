"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { unitPriceFor, lineTotal, discountRate } from "@/lib/pricing";
import { useStoreStatus } from "@/context/StoreStatus";
import { ProductVisual } from "@/components/ProductVisual";
import { Button, ButtonLink } from "@/components/Button";
import { PaymentBadges } from "@/components/PaymentBadges";
import { getProduct } from "@/lib/products";

type PayState = "idle" | "loading" | "demo-placed" | "error";

export default function CheckoutPage() {
  const { preorder } = useStoreStatus();
  const { items, subtotal, compareSubtotal, setQuantity, removeItem, clear } = useCart();
  const [payState, setPayState] = useState<PayState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const shipping =
    subtotal === 0 || subtotal >= site.shipping.freeThreshold
      ? 0
      : site.shipping.flatRate;
  const total = subtotal + shipping;
  const remaining = site.shipping.freeThreshold - subtotal;
  const progress = Math.min(100, (subtotal / site.shipping.freeThreshold) * 100);

  async function handlePay() {
    setPayState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            designType: i.designType,
            customMethod: i.customMethod,
            note: i.note,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();

      if (data.url) {
        // Off to Stripe's hosted payment page.
        window.location.href = data.url;
        return;
      }
      if (data.demo) {
        // Stripe key not configured yet. Clearly-labelled test order.
        setPayState("demo-placed");
        clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      throw new Error(data.error || "Something went wrong");
    } catch (err) {
      setPayState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  }

  if (payState === "demo-placed") {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-neutral-900">
          Test order placed
        </h1>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          No card was charged: the server did not detect a{" "}
          <code className="rounded bg-neutral-100 px-1 text-sm">
            STRIPE_SECRET_KEY
          </code>{" "}
          environment variable, so this is the test-order fallback. Add the
          key in Vercel (Production environment), redeploy, and this same
          button opens Stripe&apos;s real payment page.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/products">Continue shopping</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Back home
          </ButtonLink>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-neutral-100 text-neutral-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-neutral-900">
          Your cart is empty
        </h1>
        <p className="mt-3 text-neutral-500">Add a card or tag to get started.</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/products">Browse products</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => {
            const product = getProduct(item.slug);
            const discounted = unitPriceFor(item.unitPrice, preorder);
            const hasDiscount = preorder;
            return (
              <div key={item.key} className="card flex gap-4 p-4">
                <div className="w-28 flex-shrink-0 overflow-hidden rounded-md">
                  <ProductVisual
                    name={item.name}
                    accent={product?.accent ?? ["#F97316", "#FBBF24"]}
                    className="aspect-square rounded-md"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-bold text-neutral-900 hover:text-neutral-900"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {item.designType === "custom"
                          ? item.customMethod === "upload"
                            ? "Custom / your artwork"
                            : "Custom / designed by us"
                          : "Standard design"}
                        {" · "}
                        {formatPrice(discounted)} each
                        {hasDiscount && (
                          <span className="ml-1 font-bold text-violet-600">
                            (pre-order price)
                          </span>
                        )}
                      </p>
                      {item.note && (
                        <p className="mt-1 max-w-sm text-xs text-neutral-400">
                          “{item.note}”
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="text-neutral-400 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-1">
                      <button
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {formatPrice(lineTotal(item.unitPrice, item.quantity, preorder))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-neutral-400">
            Pre-order pricing is applied automatically to every item while the
            window is open. {site.preorder.shipNote}.
          </p>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="font-display text-lg font-extrabold text-neutral-900">
              Order summary
            </h2>

            {/* Free shipping progress */}
            <div className="mt-4 rounded-md bg-neutral-50 p-3">
              {remaining > 0 ? (
                <p className="flex items-center gap-1.5 text-xs text-neutral-700">
                  <Truck className="h-4 w-4 text-blue-600" />
                  Add <strong>{formatPrice(remaining)}</strong> more for free
                  shipping
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                  <Truck className="h-4 w-4" /> Free shipping unlocked!
                </p>
              )}
              <div className="mt-2 h-2 overflow-hidden rounded-md bg-white">
                <div
                  className="h-full rounded-md bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              {preorder && (
                <>
                  <div className="flex justify-between text-neutral-600">
                    <dt>Full price</dt>
                    <dd className="line-through">
                      {formatPrice(compareSubtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <dt>
                      Pre-order discount ({Math.round(discountRate(true) * 100)}%)
                    </dt>
                    <dd>-{formatPrice(compareSubtotal - subtotal)}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between text-neutral-600">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-neutral-600">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-extrabold text-neutral-900">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {payState === "error" && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <Button
              onClick={handlePay}
              size="lg"
              className="mt-6 w-full"
              disabled={payState === "loading"}
            >
              <Lock className="h-4 w-4" />
              {payState === "loading" ? "Opening checkout..." : "Pay securely"}
            </Button>

            <p className="mt-3 text-center text-xs text-neutral-400">
              Payment and shipping details are collected on Stripe&apos;s
              encrypted checkout. Promo codes can be entered there too.
            </p>

            <div className="mt-4 border-t border-neutral-200 pt-4">
              <PaymentBadges />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {site.guaranteeDays} days of free maintenance on every order
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
