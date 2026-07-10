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
        <div className="box mx-auto flex h-16 w-16 items-center justify-center bg-mint">
          <CheckCircle2 className="h-9 w-9 text-ink" />
        </div>
        <h1 className="mt-6 font-display text-3xl uppercase text-ink">
          Test order placed
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink/70">
          Payments aren&apos;t switched on yet, so no card was charged. This
          confirms the checkout flow works end to end. Once the Stripe key is
          added, this same button opens a real payment page.
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
        <div className="box mx-auto flex h-16 w-16 items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-ink" />
        </div>
        <h1 className="mt-6 font-display text-3xl uppercase text-ink">
          Your cart is empty
        </h1>
        <p className="mt-3 text-ink/60">Add a card or tag to get started.</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/products">Browse products</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl uppercase text-ink sm:text-4xl">
        Checkout
      </h1>
      {awayFromFree > 0 && (
        <p className="mt-2 inline-block border-2 border-ink bg-yolk px-2 py-1 text-sm font-bold text-ink">
          {formatPrice(awayFromFree)} away from free shipping
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
              <div key={item.key} className="box flex gap-4 p-4">
                <div className="w-28 flex-shrink-0 border-2 border-ink">
                  <ProductVisual
                    name={item.name}
                    accent={product?.accent ?? ["#FFC700", "#FF90E8"]}
                    className="aspect-square"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-bold text-ink underline-offset-2 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-ink/60">
                        {item.designType === "custom"
                          ? item.customMethod === "upload"
                            ? "Custom / your artwork"
                            : "Custom / designed by us"
                          : "Standard design"}
                        {" · "}
                        {formatPrice(discounted)} each
                        {hasDiscount && (
                          <span className="ml-1 font-bold text-ink">
                            (pack discount)
                          </span>
                        )}
                      </p>
                      {item.note && (
                        <p className="mt-1 max-w-sm font-mono text-xs text-ink/50">
                          “{item.note}”
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="flex h-8 w-8 items-center justify-center border-2 border-ink bg-white text-ink hover:bg-bubble"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border-2 border-ink bg-white">
                      <button
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center border-r-2 border-ink text-ink hover:bg-cream"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center font-mono text-sm font-bold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center border-l-2 border-ink text-ink hover:bg-cream"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-mono text-lg font-bold text-ink">
                      {formatPrice(lineTotal(item.unitPrice, item.quantity))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="font-mono text-xs text-ink/50">
            3+ of a product saves 10% · 5+ saves 15% · 10+ saves 20%. Applied
            automatically.
          </p>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="box p-6">
            <h2 className="font-display text-lg uppercase text-ink">
              Order summary
            </h2>
            <dl className="mt-4 space-y-3 font-mono text-sm">
              <div className="flex justify-between text-ink/70">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink/70">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "FREE" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t-2 border-ink pt-3 text-base font-bold text-ink">
                <dt>TOTAL</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {payState === "error" && (
              <div className="mt-4 flex items-start gap-2 border-2 border-ink bg-bubble p-3 text-xs font-bold text-ink">
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

            <p className="mt-3 text-center font-mono text-xs text-ink/50">
              Payment and shipping details are collected on Stripe&apos;s
              encrypted checkout. We never see your card number.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 border-t-2 border-ink pt-4 text-xs font-bold text-ink">
              <ShieldCheck className="h-4 w-4" />
              {site.guaranteeDays}-day money-back guarantee on every order
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
