"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, X } from "lucide-react";
import { useStoreStatus } from "@/context/StoreStatus";
import { discountRate } from "@/lib/pricing";
import { site } from "@/lib/site";

/**
 * Pre-order information modal for the homepage. Appears once the visitor has
 * scrolled a little (so it reads as contextual, not an instant interruption),
 * dims + lightly blurs the page behind it, and stays dismissed after closing.
 *
 * Shows whenever AT LEAST ONE product is on pre-order — pre-order is set per
 * product now, so the global flag alone isn't the right signal.
 */
const DISMISS_KEY = "taplink-preorder-info-dismissed";
/**
 * Wait until the visitor is past the scroll-scrubbed hero (a ~3.2-3.6x
 * viewport track) so the modal never interrupts that animation mid-play.
 */
const HERO_VIEWPORTS = 3.6;

export function PreorderPopup() {
  const { productPreorder, loaded } = useStoreStatus();
  const preorder = Object.values(productPreorder).some(Boolean);
  // Assume dismissed until storage is read, so nothing flashes on load.
  const [dismissed, setDismissed] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    // Unmount after the fade-out so it's gone for the rest of the visit.
    setTimeout(() => setDismissed(true), 250);
  }, []);

  // Open once the visitor scrolls past the trigger point.
  useEffect(() => {
    if (!loaded || !preorder || dismissed) return;
    function onScroll() {
      if (window.scrollY > window.innerHeight * HERO_VIEWPORTS) {
        setOpen(true);
        window.removeEventListener("scroll", onScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // in case the page is already scrolled (e.g. back navigation)
    return () => window.removeEventListener("scroll", onScroll);
  }, [loaded, preorder, dismissed]);

  // Escape to close, and lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!loaded || !preorder || dismissed) return null;

  const pct = Math.round(discountRate(true) * 100);
  // Keep the wording honest: only say "whole cart" when every product is on
  // pre-order, otherwise say it applies to the pre-order items.
  const ids = Object.keys(productPreorder);
  const allOnPreorder = ids.length > 0 && ids.every((id) => productPreorder[id]);

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preorder-modal-title"
    >
      {/* Backdrop: subtle dim + light blur so the page stays visible behind. */}
      <div
        onClick={close}
        className="absolute inset-0 bg-neutral-900/25 backdrop-blur-[4px]"
        aria-hidden
      />

      <div
        className={`card relative w-full max-w-md p-7 text-center shadow-lift transition-all duration-300 sm:p-9 ${
          open ? "translate-y-0 scale-100" : "translate-y-3 scale-[0.98]"
        }`}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X className="h-[1.15rem] w-[1.15rem]" />
        </button>

        {/* The actual cards, so the offer is attached to the product. */}
        <div className="flex items-end justify-center gap-2">
          {[
            { src: "/images/products/google-white.webp", w: 685, rot: "-9deg", big: false },
            { src: "/images/products/instagram.webp", w: 688, rot: "0deg", big: true },
            { src: "/images/products/google-black.webp", w: 636, rot: "9deg", big: false },
          ].map((c) => (
            <Image
              key={c.src}
              src={c.src}
              alt=""
              aria-hidden
              width={c.w}
              height={1100}
              sizes="120px"
              className={`w-auto rounded-md drop-shadow-[0_5px_12px_rgba(0,0,0,0.18)] ${
                c.big ? "z-10 h-28" : "h-24"
              }`}
              style={{ transform: `rotate(${c.rot})` }}
            />
          ))}
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B5FD9]">
          <BadgePercent className="h-4 w-4" />
          Pre-order is open
        </p>
        <h2
          id="preorder-modal-title"
          className="mt-2 font-display text-3xl font-extrabold text-neutral-900"
        >
          {pct}% off {allOnPreorder ? "your whole cart" : "pre-order cards"}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
          {allOnPreorder
            ? "The discount is applied automatically at checkout — no code needed."
            : "Cards marked “Pre-order” are discounted automatically at checkout — no code needed."}{" "}
          {site.preorder.shipNote}. Ships anywhere in Canada.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <Link
            href="/products"
            onClick={close}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-neutral-700"
          >
            Shop the pre-order <ArrowRight className="h-5 w-5" />
          </Link>
          <button
            onClick={close}
            className="w-full py-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
          >
            Keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}
