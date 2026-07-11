"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent,
  Infinity as InfinityIcon,
  ShieldCheck,
  Timer,
  TrendingUp,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { preorderActive, discountRate } from "@/lib/pricing";

interface Item {
  href: string;
  icon: LucideIcon;
  color: string;
  label: string;
}

/**
 * The one rotating banner, below the hero. Shows a set of offers spread
 * across the full band (1 on phones, 2 on tablets, 3 on desktop), each with
 * a semantic icon, and rotates to the next set on a timer. Pauses on hover;
 * the gradient progress line tracks the timing.
 */
export function PromoBanner() {
  const items: Item[] = [
    ...(preorderActive()
      ? [
          {
            href: "/products",
            icon: BadgePercent,
            color: "text-violet-400",
            label: `Pre-order open: ${Math.round(discountRate() * 100)}% off everything, no code needed`,
          },
        ]
      : []),
    {
      href: "/products/google-review-card",
      icon: TrendingUp,
      color: "text-emerald-400",
      label: "312 reviews in 6 months at 2 yeses a day",
    },
    {
      href: "/products",
      icon: Truck,
      color: "text-blue-400",
      label: `Free shipping on orders over ${formatPrice(site.shipping.freeThreshold)}`,
    },
    {
      href: "/#how-it-works",
      icon: Timer,
      color: "text-amber-400",
      label: "Tap to review in about 20 seconds",
    },
    {
      href: "/legal/returns",
      icon: ShieldCheck,
      color: "text-emerald-400",
      label: `${site.guaranteeDays}-day money-back guarantee`,
    },
    {
      href: "/products",
      icon: InfinityIcon,
      color: "text-violet-400",
      label: "No subscriptions. Buy the card once, own it forever",
    },
  ];

  // Rotate through the items three at a time.
  const groups: Item[][] = [];
  for (let i = 0; i < items.length; i += 3) groups.push(items.slice(i, i + 3));

  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setPage((p) => (p + 1) % groups.length), 5000);
    return () => clearInterval(id);
  }, [paused, groups.length]);

  return (
    <div
      className="relative overflow-hidden border-y border-white/5 bg-neutral-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Timing indicator: refills for each set, freezes on hover */}
      <div
        key={page}
        className="absolute bottom-0 left-0 h-[2px] animate-progressbar bg-gradient-to-r from-violet-500 via-emerald-500 to-blue-500"
        style={paused ? { animationPlayState: "paused" } : undefined}
        aria-hidden
      />
      <div className="mx-auto h-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex h-full items-center"
            aria-live="polite"
          >
            {groups[page].map((item, i) => (
              <div
                key={item.label}
                className={`flex-1 justify-center ${
                  i === 0
                    ? "flex"
                    : i === 1
                      ? "hidden sm:flex"
                      : "hidden lg:flex"
                }`}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-center text-xs font-semibold text-neutral-200 transition-colors hover:text-white lg:text-sm"
                >
                  <item.icon
                    className={`h-4 w-4 flex-shrink-0 ${item.color}`}
                    aria-hidden
                  />
                  {item.label}
                </Link>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
