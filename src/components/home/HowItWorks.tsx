"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Nfc, Smartphone, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useAutoAdvance } from "@/components/home/useAutoAdvance";
import { cn } from "@/lib/utils";

/**
 * Three-step explainer that plays itself. Each step owns a photo, so the panel
 * on the right changes with the step instead of sitting on one static image.
 * The step timer draws as a rail under the copy, driven from
 * `useAutoAdvance` — hovering freezes it rather than snapping it full.
 */
const STEPS = [
  {
    icon: Nfc,
    title: "They tap the card",
    body: "Hold it to the back of any phone. No app, no QR code.",
    aside: "Works through a phone case",
    image: "/images/hero/step-tap.webp",
    alt: "A hand holding a slim black NFC card against the back of a smartphone on a cafe counter",
    caption: "One tap on the back of the phone",
  },
  {
    icon: Smartphone,
    title: "The phone opens your link",
    body: "Your page opens straight in their browser, about a second later.",
    aside: "About a second, start to open",
    image: "/images/hero/step-notify.webp",
    alt: "A phone lighting up in someone's hand at a cafe counter as a page loads",
    caption: "Your page, already on their screen",
  },
  {
    icon: Star,
    title: "They leave the review",
    body: "Thumb already on the screen, nothing left between them and the rating.",
    aside: "Re-point the card any time",
    image: "/images/hero/step-review.webp",
    alt: "A thumb tapping a five-star rating on a phone screen",
    caption: "Five stars before they walk out",
  },
];

const STEP_MS = 5000;

export function HowItWorks() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const { index: active, select, bindBar } = useAutoAdvance({
    count: STEPS.length,
    durationMs: STEP_MS,
    paused,
    enabled: !reduced,
  });
  const step = STEPS[active];

  return (
    <section
      id="how-it-works"
      className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
    >
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
          How it works
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-balance font-display text-[1.75rem] font-extrabold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
            Three seconds, start to finish
          </h2>
          <p className="max-w-md text-base leading-relaxed text-neutral-600">
            Programmed before it ships, so the first tap out of the envelope
            already works.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* Steps */}
        <div
          className="order-2 lg:order-1"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <ol className="space-y-3">
            {STEPS.map((s, i) => {
              const on = i === active;
              return (
                <Reveal key={s.title} delay={i * 0.08}>
                  <li>
                    <button
                      onClick={() => select(i)}
                      aria-pressed={on}
                      className={cn(
                        "group w-full rounded-xl border px-5 py-5 text-left transition-all duration-300 sm:px-6 sm:py-6",
                        on
                          ? "border-[#2E7DFF]/40 bg-[#2E7DFF]/[0.04] shadow-soft"
                          : "border-neutral-200 bg-white hover:border-neutral-300",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={cn(
                            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-300",
                            on
                              ? "bg-[#2E7DFF] text-white"
                              : "bg-neutral-100 text-neutral-500 group-hover:text-neutral-900",
                          )}
                        >
                          <s.icon className="h-5 w-5" strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span
                              className={cn(
                                "font-mono text-xs font-bold transition-colors",
                                on ? "text-[#2E7DFF]" : "text-neutral-400",
                              )}
                            >
                              0{i + 1}
                            </span>
                            <h3 className="font-display text-lg font-bold text-neutral-900">
                              {s.title}
                            </h3>
                          </div>
                          <p
                            className={cn(
                              "mt-1.5 text-sm leading-relaxed transition-colors",
                              on ? "text-neutral-700" : "text-neutral-500",
                            )}
                          >
                            {s.body}
                          </p>

                          {/* Step timer + the one detail worth pulling out. */}
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <span className="h-[3px] w-full overflow-hidden rounded-full bg-neutral-200 sm:flex-1">
                              <span
                                ref={bindBar(i)}
                                style={{ transform: "scaleX(0)" }}
                                className="block h-full w-full origin-left rounded-full bg-[#2E7DFF]"
                              />
                            </span>
                            <span
                              className={cn(
                                "flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider transition-colors sm:text-[11px]",
                                on ? "text-[#1B5FD9]" : "text-neutral-400",
                              )}
                            >
                              {s.aside}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                </Reveal>
              );
            })}
          </ol>

          <p className="mt-5 text-xs leading-relaxed text-neutral-500">
            Compatible with iPhone XR and newer, and any Android phone with NFC
            switched on.
          </p>
        </div>

        {/* Step visual */}
        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-lift">
            <div className="relative aspect-[4/3] w-full">
              {STEPS.map((s, i) => (
                <Image
                  key={s.image}
                  src={s.image}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    i === active ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>

            {/* Caption sits over the photo, so it stays light. */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 sm:p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                Step 0{active + 1}
              </p>
              <p className="mt-1.5 font-display text-lg font-bold text-white sm:text-xl">
                {step.caption}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
