"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock, Minus, Star, X } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductVisual } from "@/components/ProductVisual";
import { useStoreStatus } from "@/context/StoreStatus";
import { products } from "@/lib/products";
import { unitPriceFor, discountRate } from "@/lib/pricing";
import { formatPrice, cn } from "@/lib/utils";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

const ROWS: { label: string; detail: string; generic: string | false; ours: string }[] = [
  {
    label: "Arrives programmed",
    detail: "Your link is written to the chip before it ships",
    generic: false,
    ours: "Works out of the box",
  },
  {
    label: "The ask is printed on it",
    detail: "Customers know what to do without being told",
    generic: "Blank card",
    ours: "Review prompt + stars",
  },
  {
    label: "Two colours in one card",
    detail: "White on one face, black on the other",
    generic: "One side only",
    ours: "Flip to match your counter",
  },
  {
    label: "Change where it points",
    detail: "New review link, new profile, same card",
    generic: false,
    ours: "Any time, no reprint",
  },
  {
    label: "Support after you buy",
    detail: "If it stops scanning we make it right",
    generic: "None",
    ours: `${site.guaranteeDays} days free maintenance`,
  },
];

export function ComparisonStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
            The difference
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            Why ours costs more than a blank tag
          </h2>
          <p className="mt-4 text-base text-neutral-600">
            Anyone can sell you an unbranded chip. Here&apos;s what you get
            instead.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
          {/* Header */}
          <div className="grid grid-cols-[1fr_5.5rem_7.5rem] items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-4 sm:grid-cols-[1fr_9rem_11rem] sm:px-7">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              What you get
            </span>
            <span className="text-center text-xs font-bold uppercase tracking-wider text-neutral-400">
              Generic
            </span>
            <span className="rounded-md bg-[#2E7DFF] px-2 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-white">
              {site.name}
            </span>
          </div>

          {/* Rows */}
          <ul className="divide-y divide-neutral-100">
            {ROWS.map((r) => (
              <li
                key={r.label}
                className="grid grid-cols-[1fr_5.5rem_7.5rem] items-center gap-3 px-5 py-4 transition-colors hover:bg-neutral-50/70 sm:grid-cols-[1fr_9rem_11rem] sm:px-7 sm:py-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900">{r.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                    {r.detail}
                  </p>
                </div>

                <div className="flex justify-center">
                  {r.generic === false ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-center text-xs font-semibold text-neutral-400">
                      <Minus className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">{r.generic}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2E7DFF]/[0.07] px-2 py-2">
                  <Check
                    className="h-4 w-4 flex-shrink-0 text-[#2E7DFF]"
                    strokeWidth={3}
                  />
                  <span className="text-center text-[11px] font-bold leading-tight text-neutral-900 sm:text-xs">
                    {r.ours}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing — the three real products, at their live prices             */
/* ------------------------------------------------------------------ */

export function PricingTiers() {
  const { prices, productPreorder } = useStoreStatus();
  const pct = Math.round(discountRate(true) * 100);

  return (
    <section
      id="pricing"
      className="relative scroll-mt-20 border-y border-neutral-200 bg-neutral-50 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
              Pricing
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              Buy it once. Own it forever.
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              No subscription and no per-tap fee. All prices in{" "}
              {site.currency.code}.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {products.map((p, i) => {
            const base = prices[p.id]?.basePrice ?? p.basePrice;
            const onPreorder = productPreorder[p.id] ?? false;
            const pay = onPreorder ? unitPriceFor(base, true) : base;
            const featured = i === 0;
            return (
              <Reveal key={p.id} delay={i * 0.08}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border bg-white p-6 sm:p-7",
                    featured
                      ? "border-[#2E7DFF]/50 shadow-lift"
                      : "border-neutral-200 shadow-soft",
                  )}
                >
                  {/* Badges live in their own row, so nothing overlaps or clips. */}
                  <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
                    {featured && (
                      <span className="rounded-md bg-[#2E7DFF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        Best seller
                      </span>
                    )}
                    {onPreorder && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">
                        <Clock className="h-3 w-3" />
                        Pre-order · {pct}% off
                      </span>
                    )}
                  </div>

                  <div className="mx-auto mt-3 w-full max-w-[12rem]">
                    <ProductVisual
                      visual={p.visual}
                      name={p.name}
                      className="rounded-xl bg-neutral-50"
                    />
                  </div>

                  <h3 className="mt-5 font-display text-xl font-extrabold text-neutral-900">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    {p.tagline}
                  </p>

                  {/* Price: stacked so a long compare-at never gets clipped. */}
                  <div className="mt-5">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-tight text-neutral-900">
                        {formatPrice(pay)}
                      </span>
                      {onPreorder && (
                        <span className="text-lg font-semibold text-neutral-400 line-through">
                          {formatPrice(base)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      each · {p.formFactor}
                      {onPreorder ? " · pre-order price" : ""}
                    </p>
                  </div>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-neutral-200 pt-6">
                    {p.features.slice(0, 4).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-600"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2E7DFF]"
                          strokeWidth={3}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/products/${p.slug}`}
                    className={cn(
                      "group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3.5 text-base font-bold transition-all",
                      featured
                        ? "bg-neutral-900 text-white hover:bg-neutral-700"
                        : "border border-neutral-300 text-neutral-900 hover:border-neutral-500",
                    )}
                  >
                    Check it out
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.24}>
          <p className="mt-10 text-center text-sm text-neutral-500">
            Kitting out several locations?{" "}
            <a
              href={`mailto:${site.email}?subject=Bulk%20order%20enquiry`}
              className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
            >
              Ask about bulk
            </a>{" "}
            — shipping per card drops as the quantity climbs.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Social proof                                                        */
/* ------------------------------------------------------------------ */

const QUOTES = [
  {
    quote:
      "The card sits by the till and people just tap it. We went from being ignored when we asked to a steady trickle of new reviews every week.",
    role: "Barbershop · 2 chairs",
  },
  {
    quote:
      "I hand it over at the end of every appointment. Clients follow on the spot instead of saying they'll look us up later.",
    role: "Lash & brow studio",
  },
  {
    quote:
      "The stand sits beside the card reader and does the asking for us. Nobody on the team has to remember a script.",
    role: "Neighbourhood café",
  },
];

export function SocialProof() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
              Where it goes
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              Counters, chairs and tables
            </h2>
          </div>
          <p className="max-w-xs text-sm text-neutral-500">
            Illustrative examples of how the cards get used day to day. Real
            customer reviews will replace these as they come in.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.role} delay={i * 0.08}>
            <figure className="card flex h-full flex-col p-6 sm:p-7">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((n) => (
                  <Star key={n} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-neutral-200 pt-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-400">
                  ?
                </span>
                <div>
                  <p className="text-sm font-bold text-neutral-500">
                    Unknown user
                  </p>
                  <p className="text-xs text-neutral-400">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA banner                                                    */
/* ------------------------------------------------------------------ */

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-16 sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full opacity-70 blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, rgba(46,125,255,0.55) 0%, rgba(46,125,255,0) 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse at 30% 50%, black 10%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 30% 50%, black 10%, transparent 70%)",
            }}
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#9CC3FF]">
                Ready in days, not weeks
              </span>
              <h2 className="mt-5 text-balance font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
                Get it on your counter this week
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-neutral-300">
                Pick a product, send us your review link or profile, and
                we&apos;ll program it and ship it. Canada in 3–5 business days,
                the US in 5–10.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-7 py-4 text-base font-bold text-neutral-900 transition-transform hover:scale-[1.02] active:scale-[0.99]"
                >
                  Check it out
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <span className="text-sm text-neutral-400">
                  {site.guaranteeDays} days of free maintenance included
                </span>
              </div>
            </div>

            {/* Product line-up, small */}
            <div className="hidden grid-cols-3 gap-3 lg:grid">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2"
                >
                  <ProductVisual
                    visual={p.visual}
                    name={p.name}
                    className="rounded-lg bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
