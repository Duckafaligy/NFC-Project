"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { preorderActive, discountRate } from "@/lib/pricing";

/**
 * The one rotating banner, below the hero. Replaces the old pair (a static
 * topbar above the navbar + a separate marquee ticker) with a single band:
 * messages crossfade on a timer, a gradient progress bar tracks the timing,
 * arrows/dots let visitors flip through, and it pauses on hover.
 */
export function PromoBanner() {
  const messages = [
    ...(preorderActive()
      ? [
          {
            href: "/products",
            dot: "bg-violet-500",
            node: (
              <>
                <span className="mr-1.5 rounded-sm bg-violet-600 px-1.5 py-0.5 font-bold text-white">
                  Pre-order open
                </span>
                {Math.round(discountRate() * 100)}% off everything, no code
                needed
              </>
            ),
          },
        ]
      : []),
    {
      href: "/products/google-review-card",
      dot: "bg-emerald-500",
      node: <>312 reviews in 6 months at 2 yeses a day</>,
    },
    {
      href: "/products",
      dot: "bg-blue-500",
      node: (
        <>Free shipping on orders over {formatPrice(site.shipping.freeThreshold)}</>
      ),
    },
    {
      href: "/#how-it-works",
      dot: "bg-amber-400",
      node: <>Tap to review in about 20 seconds</>,
    },
    {
      href: "/legal/returns",
      dot: "bg-emerald-500",
      node: <>{site.guaranteeDays}-day money-back guarantee</>,
    },
    {
      href: "/products",
      dot: "bg-violet-500",
      node: <>No subscriptions. Buy the card once, own it forever</>,
    },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      5000,
    );
    return () => clearInterval(id);
  }, [paused, messages.length]);

  const step = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + messages.length) % messages.length);

  return (
    <div
      className="relative overflow-hidden border-y border-white/5 bg-neutral-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        key={index}
        className="absolute bottom-0 left-0 h-[2px] animate-progressbar bg-gradient-to-r from-violet-500 via-emerald-500 to-blue-500"
        style={paused ? { animationPlayState: "paused" } : undefined}
        aria-hidden
      />
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => step(-1)}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative h-6 flex-1 overflow-hidden" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Link
                href={messages[index].href}
                className="flex items-center gap-2 text-center text-xs font-semibold text-neutral-200 transition-colors hover:text-white sm:text-sm"
              >
                <span
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-sm ${messages[index].dot}`}
                  aria-hidden
                />
                {messages[index].node}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="hidden gap-1 sm:flex" aria-hidden>
            {messages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-1.5 rounded-sm transition-colors ${
                  i === index ? "bg-white" : "bg-white/25 hover:bg-white/60"
                }`}
                aria-label={`Message ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => step(1)}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
