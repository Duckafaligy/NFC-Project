"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductVisual } from "@/components/ProductVisual";
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
    badge: "Double-sided",
    headline: "The review ask, already made",
    body: "Sits flat by the register with the prompt facing the customer. They tap, your Google review page opens, and they post while the receipt prints — no app, no QR code to line up. White on one face and black on the other, so it suits a bright counter or a dark one without ordering twice.",
    points: [
      "Opens your exact Google review page in one tap",
      "White one face, black the other — both in one card",
      "Programmed to your link before it ships",
      "Re-point it any time from your dashboard, no reprint",
    ],
  },
  {
    id: "instagram-card",
    slug: "instagram-card",
    name: "Instagram Card",
    badge: "Gradient print",
    headline: "Followers before they leave",
    body: "Nobody searches for a handle they heard once. Hand this over at the end of an appointment and their phone opens your profile with the follow button right there — while you are still standing in front of them. That is the only moment it reliably happens.",
    points: [
      "Opens your Instagram profile in one tap",
      "The follow happens on the spot, not “later”",
      "Programmed to your exact profile before shipping",
      "Matte finish that survives an apron pocket",
    ],
  },
  {
    id: "acrylic-stand",
    slug: "acrylic-review-stand",
    name: "Acrylic Review Stand",
    badge: "Cast acrylic",
    headline: "Asks for you when you're slammed",
    body: "A card works when you remember to hand it over. The stand works through a rush. It sits upright beside the terminal with the prompt facing out, so customers read it while their payment processes. Weighted base, wipes clean at close.",
    points: [
      "Upright on a weighted base — always visible",
      "Tap the face to open your Google review page",
      "No staff script to remember",
      "Cast acrylic, wipes clean",
    ],
  },
];

const SLIDE_MS = 6000;

export function DesignShowcase() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (n: number) => setI((p) => (p + n + SLIDES.length) % SLIDES.length);
  const s = SLIDES[i];
  const product = products.find((p) => p.id === s.id);

  // Auto-advance, pausing on hover/focus so reading is never interrupted.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((p) => (p + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, paused]);

  return (
    <section
      id="designs"
      className="relative scroll-mt-20 border-y border-neutral-200 bg-neutral-50 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
            The lineup
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              Three ways to get asked
            </h2>
            <p className="max-w-md text-base leading-relaxed text-neutral-600">
              Every one arrives programmed to your link and ready to use. Pick
              the one that fits where your customers actually stand.
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

              {/* Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {SLIDES.map((sl, n) => (
                    <button
                      key={sl.id}
                      onClick={() => setI(n)}
                      aria-label={`Show ${sl.name}`}
                      aria-current={n === i}
                      className="group relative h-1.5 overflow-hidden rounded-full bg-neutral-300 transition-all"
                      style={{ width: n === i ? "2.25rem" : "0.75rem" }}
                    >
                      {n === i && (
                        <span
                          key={`${n}-${paused}`}
                          className={cn(
                            "absolute inset-y-0 left-0 bg-[#2E7DFF]",
                            paused ? "w-full" : "animate-[grow_6s_linear_forwards]",
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => go(-1)}
                    aria-label="Previous product"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Next product"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Detail */}
            <div key={`${s.id}-detail`} className="flex animate-[fadeIn_500ms_ease-out] flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex w-fit rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1B5FD9]">
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
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2E7DFF]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/products/${s.slug}`}
                className="group mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-base font-bold text-white transition-transform hover:scale-[1.02]"
              >
                Check it out
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
