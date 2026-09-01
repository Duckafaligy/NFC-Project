"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

/**
 * Scroll-scrubbed hero: a tall scroll track with a sticky stage. Scroll
 * position drives the card's rotation, scale and position — the card turns
 * face-on, then tilts in to "tap" the phone, which fades up to meet it. It's
 * a short film you scrub by scrolling rather than an autoplaying loop.
 *
 * Deliberately headline-only: no body copy competing with the animation.
 * Respects prefers-reduced-motion by holding a clean static composition.
 */
export function HeroScrub() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // --- card: angled -> face-on -> tilts toward the phone
  const cardRotateY = useTransform(scrollYProgress, [0, 0.45, 1], [-32, 0, 26]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.45, 1], [14, 0, -12]);
  const cardRotateZ = useTransform(scrollYProgress, [0, 0.45, 1], [-8, 0, 6]);
  const cardScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.82, 1.06, 0.72]);
  const cardX = useTransform(scrollYProgress, [0, 0.45, 1], ["0%", "0%", "-24%"]);
  const cardY = useTransform(scrollYProgress, [0, 0.45, 1], ["6%", "0%", "-6%"]);

  // --- phone: slides up to receive the tap in the final third
  const phoneOpacity = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);
  const phoneX = useTransform(scrollYProgress, [0.5, 1], ["36%", "16%"]);
  const phoneY = useTransform(scrollYProgress, [0.5, 1], ["18%", "4%"]);
  const phoneScale = useTransform(scrollYProgress, [0.5, 1], [0.86, 1]);

  // --- tap glow blooms as the two meet
  const glowOpacity = useTransform(scrollYProgress, [0.68, 0.9, 1], [0, 0.85, 0.6]);
  const glowScale = useTransform(scrollYProgress, [0.68, 1], [0.5, 1.25]);

  // --- headline hands off to the payoff line
  const copyOneOpacity = useTransform(scrollYProgress, [0, 0.38, 0.5], [1, 1, 0]);
  const copyOneY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  // Starts as the first line finishes, so a headline is always on screen.
  const copyTwoOpacity = useTransform(scrollYProgress, [0.46, 0.6], [0, 1]);
  const copyTwoY = useTransform(scrollYProgress, [0.46, 0.6], [40, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <div ref={trackRef} className="relative h-[190vh] sm:h-[260vh] md:h-[360vh]">
      {/* pt-16 clears the fixed header so the eyebrow never sits under it. */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-16">
        {/* Ambient blue bloom behind the stage */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.18] blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(46,125,255,0.9) 0%, rgba(46,125,255,0) 65%)",
          }}
        />
        {/* Fine grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,23,23,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,23,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at center, black 20%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 20%, transparent 72%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl gap-4 px-4 sm:gap-8 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8">
          {/* ---------- Copy: headline only ---------- */}
          <div className="relative z-10 flex flex-col justify-center">
            <div className="grid min-h-[9rem] grid-cols-1 grid-rows-1 sm:min-h-[15rem] lg:min-h-[18rem]">
              <motion.div
                style={reduce ? undefined : { opacity: copyOneOpacity, y: copyOneY }}
                className="col-start-1 row-start-1 self-center"
              >
                <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#9A4522] shadow-soft">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C1592E] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C1592E]" />
                  </span>
                  Tap-to-review NFC cards
                </span>
                <h1 className="mt-4 font-display text-[2.4rem] font-extrabold leading-[1.03] tracking-tight text-neutral-900 sm:mt-6 sm:text-6xl lg:text-7xl">
                  One tap.
                  <br />
                  <span className="bg-gradient-to-r from-neutral-900 via-[#C1592E] to-[#E8A876] bg-clip-text text-transparent">
                    More reviews.
                  </span>
                </h1>
              </motion.div>

              <motion.div
                style={
                  reduce ? { opacity: 0 } : { opacity: copyTwoOpacity, y: copyTwoY }
                }
                className="col-start-1 row-start-1 self-center"
              >
                <span className="inline-flex items-center gap-2 rounded-md border border-[#C1592E]/30 bg-[#C1592E]/[0.08] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#9A4522]">
                  Instant, every time
                </span>
                <h2 className="mt-4 font-display text-[2.4rem] font-extrabold leading-[1.03] tracking-tight text-neutral-900 sm:mt-6 sm:text-6xl lg:text-7xl">
                  They tap.
                  <br />
                  <span className="text-[#C1592E]">You&apos;re on their screen.</span>
                </h2>
              </motion.div>
            </div>

            <div className="relative z-10 mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-md bg-neutral-900 px-7 py-4 text-base font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                Shop the cards
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* ---------- Stage ---------- */}
          <div className="relative flex h-[20rem] items-center justify-center sm:h-[24rem] lg:h-[34rem]">
            <div className="relative h-full w-full" style={{ perspective: "1400px" }}>
              {/* Phone */}
              <motion.div
                style={
                  reduce
                    ? { opacity: 1, x: "16%", y: "4%" }
                    : {
                        opacity: phoneOpacity,
                        x: phoneX,
                        y: phoneY,
                        scale: phoneScale,
                      }
                }
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative h-[78%] w-[42%] rounded-[1.75rem] border border-neutral-300 bg-gradient-to-b from-neutral-200 to-neutral-300 p-1.5 shadow-lift">
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[1.4rem] bg-white px-3">
                    <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-neutral-300" />
                    <div className="h-9 w-9 rounded-full bg-[#C1592E]/15 ring-1 ring-[#C1592E]/40" />
                    <div className="h-1.5 w-14 rounded-full bg-neutral-300" />
                    <div className="h-1.5 w-10 rounded-full bg-neutral-200" />
                    <div className="mt-1 h-5 w-16 rounded-md bg-[#C1592E]" />
                  </div>
                </div>
              </motion.div>

              {/* Tap glow */}
              <motion.div
                aria-hidden
                style={
                  reduce
                    ? { opacity: 0.5, scale: 1 }
                    : { opacity: glowOpacity, scale: glowScale }
                }
                className="pointer-events-none absolute left-[52%] top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(46,125,255,0.8) 0%, rgba(46,125,255,0) 70%)",
                  }}
                />
              </motion.div>

              {/* Card */}
              <motion.div
                style={
                  reduce
                    ? undefined
                    : {
                        rotateX: cardRotateX,
                        rotateY: cardRotateY,
                        rotateZ: cardRotateZ,
                        scale: cardScale,
                        x: cardX,
                        y: cardY,
                      }
                }
                className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
              >
                {/* The card itself, cut out, so the scroll rotation turns the
                    product rather than a photograph of a countertop. */}
                <Image
                  src="/images/products/google-white.webp"
                  alt="The TapLink Google review card"
                  width={688}
                  height={1100}
                  priority
                  sizes="(max-width: 1024px) 60vw, 320px"
                  className="h-[88%] max-h-[30rem] w-auto object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.28)]"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          style={reduce ? { opacity: 1 } : { opacity: cueOpacity }}
          className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-neutral-400"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
            Scroll
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
}
