"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "./Button";

/**
 * Email capture with a first-order discount incentive.
 * NOTE: not wired to an email service yet. Before promoting the 10% offer,
 * connect this to your email tool and create a WELCOME10 promotion code in
 * Stripe (checkout already accepts promo codes). See README.
 */
export function Newsletter() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="rounded-3xl bg-orange-100 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft">
          <Mail className="h-6 w-6 text-orange-600" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-extrabold text-stone-900">
          Get 10% off your first order
        </h2>
        <p className="mt-2 max-w-md text-sm text-stone-600">
          Join the list and we&apos;ll send you a discount code, plus occasional
          tips on getting more reviews. No spam, unsubscribe anytime.
        </p>
        {sent ? (
          <p className="mt-6 flex items-center gap-2 font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5" /> You&apos;re in! Check your
            inbox for the code.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@business.com"
              className="h-12 flex-1 rounded-full border border-stone-300 bg-white px-5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <Button type="submit" size="lg">
              Get my code
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
