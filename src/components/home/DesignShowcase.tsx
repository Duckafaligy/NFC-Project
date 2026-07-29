"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductVisual } from "@/components/ProductVisual";
import type { VisualKind } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Personalization gallery. Every card is designed around the individual or
 * business ordering it — this shows the range: routing designs (rendered from
 * the real catalog artwork) alongside premium finishes.
 */
interface Slide {
  visual: VisualKind;
  name: string;
  finish: string;
  note: string;
}

const SLIDES: Slide[] = [
  {
    visual: "google",
    name: "Google review card",
    finish: "Double-sided",
    note: "White on one face, black on the other — flip it to match your counter. Tap opens your review page.",
  },
  {
    visual: "instagram",
    name: "Instagram card",
    finish: "Gradient print",
    note: "Your handle, opened with the follow button ready before they walk away.",
  },
  {
    visual: "acrylic",
    name: "Acrylic review stand",
    finish: "Cast acrylic",
    note: "Sits upright by the register on a weighted base, so the ask is always visible.",
  },
];

export function DesignShowcase() {
  const [i, setI] = useState(0);
  const go = (n: number) => setI((p) => (p + n + SLIDES.length) % SLIDES.length);
  const s = SLIDES[i];

  return (
    <section
      id="designs"
      className="relative scroll-mt-20 border-y border-neutral-200 bg-neutral-50 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
            Designed for you
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl text-balance">
              Not a blank card with a chip in it
            </h2>
            <p className="max-w-md text-base leading-relaxed text-neutral-600">
              Three products, each set up for one business: the review card, the
              Instagram card, and the acrylic stand. Send us your link and we
              program it before it ships.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            {/* Stage */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white/[0.06] to-transparent p-6 sm:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[90px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(46,125,255,0.45) 0%, rgba(46,125,255,0) 70%)",
                  }}
                />
                <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
                  <ProductVisual
                    visual={s.visual}
                    name={s.name}
                    className="h-full w-full rounded-xl bg-transparent"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {SLIDES.map((_, n) => (
                    <button
                      key={n}
                      onClick={() => setI(n)}
                      aria-label={`Design ${n + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        n === i ? "w-7 bg-[#2E7DFF]" : "w-3 bg-neutral-300 hover:bg-neutral-400",
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => go(-1)}
                    aria-label="Previous design"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Next design"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit rounded-md border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1B5FD9]">
                {s.finish}
              </span>
              <h3 className="mt-4 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
                {s.name}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-neutral-600">
                {s.note}
              </p>

              <ul className="mt-8 space-y-3 border-t border-neutral-200 pt-8">
                {[
                  "Programmed to your link before it ships",
                  "Cards are double-sided — white and black in one",
                  "Portrait format, built for a counter",
                  "Re-point it any time, no reprint",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-neutral-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2E7DFF]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/products"
                className="group mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-base font-bold text-white transition-transform hover:scale-[1.02]"
              >
                Design Your Card
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
