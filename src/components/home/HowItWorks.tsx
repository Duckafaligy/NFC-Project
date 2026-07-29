"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Nfc, Smartphone, Zap } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/**
 * Three-step explainer that plays itself: the active step advances on a timer
 * and can be driven manually by clicking a step. The timer progress shows as a
 * left-edge accent bar that fills top-to-bottom — clear of the card's own
 * border, so it stays readable (a hairline rail on the border did not).
 */
const STEPS = [
  {
    icon: Nfc,
    title: "Tap the card",
    body: "Hold your card to the back of any phone. No app to download, nothing to pair, no QR code to line up.",
  },
  {
    icon: Smartphone,
    title: "The phone recognises it",
    body: "NFC wakes up instantly and a notification slides in. Works on iPhone and Android straight out of the box.",
  },
  {
    icon: Zap,
    title: "Your review page opens",
    body: "Your Google review page or Instagram profile opens right there — ready to post or follow before they walk away.",
  },
];

const STEP_MS = 4200;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <section
      id="how-it-works"
      className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
          How it works
        </p>
        <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          Three seconds, start to finish
        </h2>
      </Reveal>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Steps */}
        <div
          className="order-2 space-y-3 lg:order-1"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {STEPS.map((s, i) => {
            const on = i === active;
            return (
              <Reveal key={s.title} delay={i * 0.08}>
                <button
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl border pl-6 pr-5 py-5 text-left transition-all duration-300 sm:pl-7 sm:pr-6 sm:py-6",
                    on
                      ? "border-[#2E7DFF]/40 bg-[#2E7DFF]/[0.05] shadow-soft"
                      : "border-neutral-200 bg-white hover:border-neutral-300",
                  )}
                >
                  {/* Timer progress: a left accent bar that fills downward. */}
                  <span className="absolute inset-y-0 left-0 w-[3px] overflow-hidden rounded-l-xl bg-neutral-200">
                    <span
                      key={`${i}-${active}-${paused}`}
                      className={cn(
                        "block w-full bg-[#2E7DFF]",
                        on && !paused && "animate-[growY_4.2s_linear_forwards]",
                      )}
                      style={{ height: on && paused ? "100%" : on ? undefined : "0%" }}
                    />
                  </span>

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
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
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
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Visual */}
        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900">
            <Image
              src="/images/hero/tap-phone.webp"
              alt="A phone being tapped with an NFC card, blue contactless waves radiating from the tap point"
              width={1400}
              height={1050}
              sizes="(max-width: 1024px) 100vw, 600px"
              className="h-full w-full object-cover"
            />
            {/* Step-synced caption sits over the dark photo, so it stays light. */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-5 sm:p-6">
              <div className="flex items-center gap-2">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      i === active ? "w-8 bg-[#2E7DFF]" : "w-4 bg-white/40",
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 font-display text-lg font-bold text-white">
                {STEPS[active].title}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
