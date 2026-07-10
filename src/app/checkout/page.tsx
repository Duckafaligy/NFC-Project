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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { ProductVisual } from "@/components/ProductVisual";
import { Button, ButtonLink } from "@/components/Button";
import { getProduct } from "@/lib/products";

export default function CheckoutPage() {
  const { items, subtotal, setQuantity, removeItem, clear } = useCart();
  const [placed, setPlaced] = useState(false);

  const shipping =
    subtotal === 0 || subtotal >= site.shipping.freeThreshold
      ? 0
      : site.shipping.flatRate;
  const total = subtotal + shipping;

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    // No payment backend yet — this simulates a successful order.
    // Integrate Stripe / a checkout provider here later.
    setPlaced(true);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (placed) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-white">
          Order received!
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-300">
          Thanks for your order. We&apos;ll email you a confirmation and, for
          custom designs, a proof to approve before we print and ship.
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-white">
          Your cart is empty
        </h1>
        <p className="mt-3 text-slate-400">
          Add a card or tag to get started.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/products">Browse products</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: items + shipping form */}
        <div className="space-y-8">
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item) => {
              const product = getProduct(item.slug);
              return (
                <div
                  key={item.key}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-ink-900 p-4"
                >
                  <div className="w-28 flex-shrink-0">
                    <ProductVisual
                      name={item.name}
                      accent={product?.accent ?? ["#6d5efc", "#22d3ee"]}
                      className="aspect-square rounded-xl"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-semibold text-white hover:text-brand-200"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {item.designType === "custom"
                            ? item.customMethod === "upload"
                              ? "Custom · uploaded artwork"
                              : "Custom · designed for you"
                            : "Standard design"}
                        </p>
                        {item.note && (
                          <p className="mt-1 max-w-sm text-xs text-slate-500">
                            “{item.note}”
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-slate-500 hover:text-red-400"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                        <button
                          onClick={() =>
                            setQuantity(item.key, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(item.key, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-semibold text-white">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipping form */}
          <form
            id="checkout-form"
            onSubmit={handlePlaceOrder}
            className="rounded-2xl border border-white/10 bg-ink-900 p-6"
          >
            <h2 className="font-display text-lg font-semibold text-white">
              Shipping details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" />
              <Field label="Business name (optional)" name="business" />
              <div className="sm:col-span-2">
                <Field label="Address" name="address" required />
              </div>
              <Field label="City" name="city" required />
              <Field label="State / Province" name="state" required />
              <Field label="ZIP / Postal code" name="zip" required />
              <Field label="Country" name="country" defaultValue="United States" required />
            </div>
          </form>
        </div>

        {/* Right: order summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-white/10 bg-ink-900 p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Order summary
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-300">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-slate-500">
                  Free shipping over {formatPrice(site.shipping.freeThreshold)}.
                </p>
              )}
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              className="mt-6 w-full"
            >
              <Lock className="h-4 w-4" /> Place order
            </Button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Estimated delivery: {site.shipping.deliveryDays}. Custom orders
              ship after proof approval.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none"
      />
    </label>
  );
}
