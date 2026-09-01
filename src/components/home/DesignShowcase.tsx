"use client";

import { useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductVisual } from "@/components/ProductVisual";
import { useAutoAdvance } from "@/components/home/useAutoAdvance";
import { products } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Product gallery. Auto-advances through the three products (pausing while
 * hovered or focused) and can be driven manually. Each slide gets its own
 * description and links straight to that product.
 */
interface Slide {
  id: string;
  slug: string;
  name: string;
  /** Short label for the tab rail under the stage. */
  tab: string;
  badge: string;
  headline: string;
  body: string;
  points: string[];
}

const SLIDES: Slide[] = [
  {
    id: "review-card",
    slug: "google-review-card",
    name: "Google Review Card",
    tab: "Google",
    badge: "Double-sided",
    headline: "The review ask, already made",
    body: "Sits by the register with the prompt facing out. They tap, your review page opens, they post while the receipt prints.",
    points: [
      "White one face, black the other",
      "Programmed to your link before it ships",
      "Re-point it any time, no reprint",
    ],
  },
  {
    id: "instagram-card",
    slug: "instagram-card",
    name: "Instagram Card",
    tab: "Instagram",
    badge: "Gradient print",
    headline: "Followers before they leave",
    body: "Nobody searches for a handle they heard once. Hand this over and the follow happens while you are still standing there.",
    points: [
      "Opens your profile in one tap",
      "The follow happens on the spot, not “later”",
      "Matte finish, survives an apron pocket",
    ],
  },
  {
    id: "acrylic-stand",
    slug: "acrylic-review-stand",
    name: "Acrylic Review Stand",
    tab: "Acrylic",
    badge: "Hand-assembled",
    headline: "Asks for you when you're slammed",
    body: "A card works when you remember to hand it over. The stand works through a rush — angled at the customer, asking without you.",
    points: [
      "Cut and assembled by hand, one at a time",
      "No staff script to remember",
      "Screw-fixed, so the card swaps out",
    ],
  },
];

const SLIDE_MS = 6000;

export function DesignShowcase() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const {
    index: i,
    select,
    next,
    prev,
    bindBar,
  } = useAutoAdvance({
    count: SLIDES.length,
    durationMs: SLIDE_MS,
    paused,
    enabled: !reduced,
  });
  const s = SLIDES[i];
  const product = products.find((p) => p.id === s.id);

  return (
    <section
      id="designs"
      className="relative scroll-mt-20 border-y border-neutral-200 bg-neutral-50 py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C1592E]">
            The lineup
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl text-balance font-display text-[1.75rem] font-extrabold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
              Three ways to get asked
            </h2>
            <p className="max-w-md text-base leading-relaxed text-neutral-600">
              Every one arrives programmed and ready to use.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {/* Stage */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(46,125,255,0.35) 0%, rgba(46,125,255,0) 70%)",
                  }}
                />
                <div key={s.id} className="relative mx-auto aspect-[4/3] w-full max-w-lg animate-[fadeIn_500ms_ease-out]">
                  <ProductVisual
                    visual={product?.visual ?? "google"}
                    name={s.name}
                    className="h-full w-full rounded-xl bg-transparent"
                  />
                </div>
              </div>

              {/* Controls: one named tab per product, each on its own rail.
                  Fixed widths, so nothing reflows as the slide changes. */}
              <div className="mt-5 flex items-end gap-4 sm:gap-6">
                <div className="flex min-w-0 flex-1 gap-2 sm:gap-4">
                  {SLIDES.map((sl, n) => (
                    <button
                      key={sl.id}
                      onClick={() => select(n)}
                      aria-label={`Show ${sl.name}`}
                      aria-current={n === i}
                      className="group min-w-0 flex-1 py-2 text-left"
                    >
                      <span
                        className={cn(
                          "block truncate text-[11px] font-bold uppercase tracking-wider transition-colors sm:text-xs",
                          n === i
                            ? "text-neutral-900"
                            : "text-neutral-400 group-hover:text-neutral-600",
                        )}
                      >
                        {sl.tab}
                      </span>
                      <span className="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-neutral-200 transition-colors group-hover:bg-neutral-300">
                        <span
                          ref={bindBar(n)}
                          style={{ transform: "scaleX(0)" }}
                          className="block h-full w-full origin-left rounded-full bg-[#C1592E]"
                        />
                      </span>
                    </button>
                  ))}
                </div>
                {/* Arrows are desktop-only — on mobile the tabs are the
                    control and the row needs the full width. */}
                <div className="hidden flex-shrink-0 gap-2 sm:flex">
                  <button
                    onClick={prev}
                    aria-label="Previous product"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next product"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Detail */}
            <div key={`${s.id}-detail`} className="flex animate-[fadeIn_500ms_ease-out] flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex w-fit rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#9A4522]">
                  {s.badge}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {s.name}
                </span>
              </div>
              <h3 className="mt-4 text-balance font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
                {s.headline}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-neutral-600">
                {s.body}
              </p>

              <ul className="mt-7 space-y-3 border-t border-neutral-200 pt-7">
                {s.points.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-neutral-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C1592E]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/products/${s.slug}`}
                className="group mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-base font-bold text-white transition-transform hover:scale-[1.02]"
              >
                Get this one
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
