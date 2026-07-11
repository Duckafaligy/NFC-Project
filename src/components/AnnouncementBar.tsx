"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { preorderActive, discountRate } from "@/lib/pricing";

/**
 * Rotating topbar. Messages roll up every few seconds; arrows let the
 * visitor flip through them, and each message links somewhere useful.
 * Rotation pauses while hovered.
 */
export function AnnouncementBar() {
  const messages = [
    ...(preorderActive()
      ? [
          {
            href: "/products",
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
      href: "/products",
      node: (
        <>Free shipping on orders over {formatPrice(site.shipping.freeThreshold)}</>
      ),
    },
    {
      href: "/legal/returns",
      node: <>{site.guaranteeDays}-day money-back guarantee on every order</>,
    },
    {
      href: "/products",
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
      className="relative bg-neutral-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Timing indicator: refills for each message, freezes on hover */}
      <div
        key={index}
        className="absolute bottom-0 left-0 h-[2px] animate-progressbar bg-white/30"
        style={paused ? { animationPlayState: "paused" } : undefined}
        aria-hidden
      />
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => step(-1)}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative h-9 flex-1 overflow-hidden" aria-live="polite">
          <Link
            key={index}
            href={messages[index].href}
            className="absolute inset-0 flex animate-rollup items-center justify-center text-center text-xs font-medium text-neutral-200 hover:text-white sm:text-[13px]"
          >
            <span>{messages[index].node}</span>
          </Link>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="hidden gap-1 sm:flex" aria-hidden>
            {messages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-1.5 rounded-sm transition-colors ${
                  i === index ? "bg-white" : "bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Announcement ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => step(1)}
            className="flex h-6 w-6 items-center justify-center rounded-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
