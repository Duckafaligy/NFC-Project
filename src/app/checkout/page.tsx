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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { unitPriceFor, lineTotal, tierDiscount } from "@/lib/pricing";
import { ProductVisual } from "@/components/ProductVisual";
import { Button, ButtonLink } from "@/components/Button";
import { getProduct } from "@/lib/products";

type PayState = "idle" | "loading" | "demo-placed" | "error";

export default function CheckoutPage() {
  const { items, subtotal, setQuantity, removeItem, clear } = useCart();
  const [payState, setPayState] = useState<PayState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const shipping =
    subtotal === 0 || subtotal >= site.shipping.freeThreshold
      ? 0
      : site.shipping.flatRate;
  const total = subtotal + shipping;
  const awayFromFree = site.shipping.freeThreshold - subtotal;

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
        // Stripe key not configured yet — clearly-labelled test order.
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-slate-900">
          Test order placed
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Payments aren&apos;t switched on yet, so no card was charged — this
          confirms the checkout flow works end to end. Once the Stripe key is
          added, this same button takes customers to a real payment page.
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-paper text-slate-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-slate-900">
          Your cart is empty
        </h1>
        <p className="mt-3 text-slate-500">Add a card or tag to get started.</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/products">Browse products</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Checkout
      </h1>
      {awayFromFree > 0 && (
        <p className="mt-2 text-sm text-slate-500">
          You&apos;re {formatPrice(awayFromFree)} away from free shipping.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => {
            const product = getProduct(item.slug);
            const discounted = unitPriceFor(item.unitPrice, item.quantity);
            const hasDiscount = tierDiscount(item.quantity) > 0;
            return (
              <div
                key={item.key}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <div className="w-28 flex-shrink-0">
                  <ProductVisual
                    name={item.name}
                    accent={product?.accent ?? ["#2563eb", "#0ea5e9"]}
                    className="aspect-square rounded-xl"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-slate-900 hover:text-blue-700"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.designType === "custom"
                          ? item.customMethod === "upload"
                            ? "Custom · your artwork"
                            : "Custom · designed by us"
                          : "Standard design"}
                        {" · "}
                        {formatPrice(discounted)} each
                        {hasDiscount && (
                          <span className="ml-1 font-semibold text-emerald-600">
                            (pack discount applied)
                          </span>
                        )}
                      </p>
                      {item.note && (
                        <p className="mt-1 max-w-sm text-xs text-slate-400">
                          “{item.note}”
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white p-1">
                      <button
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatPrice(lineTotal(item.unitPrice, item.quantity))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-slate-400">
            Buy 3+ of a product and save 10% · 5+ saves 15% · 10+ saves 20%.
            Discounts apply automatically.
          </p>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Order summary
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {payState === "error" && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
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
              {payState === "loading"
                ? "Opening secure checkout…"
                : "Pay securely"}
            </Button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Payment and shipping details are collected on Stripe&apos;s
              encrypted checkout — we never see your card number.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {site.guaranteeDays}-day money-back guarantee on every order
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
