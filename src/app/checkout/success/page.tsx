"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ButtonLink } from "@/components/Button";
import { site } from "@/lib/site";

/**
 * Landing page after a successful Stripe payment.
 * Stripe redirects here with ?session_id=... after the payment is confirmed.
 */
export default function CheckoutSuccessPage() {
  const { clear } = useCart();

  // The order is paid. Empty the local cart.
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <div className="box mx-auto flex h-16 w-16 items-center justify-center bg-mint">
        <CheckCircle2 className="h-9 w-9 text-ink" />
      </div>
      <h1 className="mt-6 font-display text-3xl uppercase text-ink">
        Payment received
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink/70">
        A receipt is on its way to your email. Standard orders ship within{" "}
        {site.shipping.handlingDays}. If you ordered a custom design, we&apos;ll
        email you a proof to approve before anything gets printed.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/products">Keep shopping</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
