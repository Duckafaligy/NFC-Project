"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, X } from "lucide-react";
import { useStoreStatus } from "@/context/StoreStatus";
import { discountRate } from "@/lib/pricing";

/**
 * A small, dismissible information tab on the homepage that surfaces the live
 * pre-order offer (20% off the whole cart). Only appears while the pre-order
 * window is actually open (StoreStatus), slides in after a short delay so it
 * isn't jarring, and stays dismissed once closed.
 */
const DISMISS_KEY = "taplink-preorder-info-dismissed";

export function PreorderPopup() {
  const { preorder, loaded } = useStoreStatus();
  // Assume dismissed until we've read storage, so nothing flashes on load.
  const [dismissed, setDismissed] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !preorder || dismissed) return;
    const t = setTimeout(() => setShow(true), 1400);
    return () => clearTimeout(t);
  }, [loaded, preorder, dismissed]);

  function close() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    // Unmount after the slide-out finishes so it's gone for the rest of the visit.
    setTimeout(() => setDismissed(true), 500);
  }

  if (!loaded || !preorder || dismissed) return null;

  const pct = Math.round(discountRate(true) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 z-[55] w-[calc(100%-2rem)] max-w-sm transition-all duration-500 ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="card relative border-violet-200 p-4 shadow-lift">
        <button
          onClick={close}
          aria-label="Dismiss"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-violet-600 text-white">
            <BadgePercent className="h-5 w-5" />
          </span>
          <div className="pr-5">
            <p className="text-sm font-extrabold text-neutral-900">
              Pre-order is open — {pct}% off
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
              {pct}% comes off your whole cart at checkout, no code needed. Ships
              across Canada &amp; the US.
            </p>
            <Link
              href="/products"
              onClick={close}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900"
            >
              Shop the pre-order <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
