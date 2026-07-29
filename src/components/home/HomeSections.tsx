"use client";

import Link from "next/link";
import { ArrowRight, Check, Minus, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductVisual } from "@/components/ProductVisual";
import { useStoreStatus } from "@/context/StoreStatus";
import { products } from "@/lib/products";
import { unitPriceFor, discountRate } from "@/lib/pricing";
import { formatPrice, cn } from "@/lib/utils";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Comparison strip                                                    */
/* ------------------------------------------------------------------ */

const ROWS: { label: string; generic: string | false; ours: string }[] = [
  {
    label: "Programmed to your link",
    generic: false,
    ours: "Ready the moment you unbox it",
  },
  {
    label: "Purpose-built review design",
    generic: "Blank card",
    ours: "The ask is printed on it",
  },
  {
    label: "Double-sided colour",
    generic: "One side only",
    ours: "White and black in one card",
  },
  {
    label: "Change the destination later",
    generic: false,
    ours: "Any time, no reprint",
  },
  {
    label: "Support after you buy",
    generic: "None",
    ours: `${site.guaranteeDays} days of free maintenance`,
  },
];

export function ComparisonStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
          The difference
        </p>
        <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          Why ours costs more than a blank tag
        </h2>
        <p className="mt-4 max-w-xl text-base text-neutral-600">
          You can buy an unbranded NFC card anywhere. What you can&apos;t buy is
          one that already asks for the review, arrives programmed to your link,
          and is backed by someone who fixes it if it breaks.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-200">
          <div className="grid grid-cols-[1.4fr_1fr_1.3fr] gap-px bg-neutral-200 text-sm">
            <div className="bg-white p-4 sm:p-5" />
            <div className="bg-white p-4 text-center sm:p-5">
              <p className="font-bold text-neutral-500">Generic NFC card</p>
            </div>
            <div className="bg-[#2E7DFF]/[0.07] p-4 text-center sm:p-5">
              <p className="font-display font-extrabold text-neutral-900">
                {site.name} card
              </p>
            </div>

            {ROWS.map((r) => (
              <RowCells key={r.label} {...r} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function RowCells({
  label,
  generic,
  ours,
}: {
  label: string;
  generic: string | false;
  ours: string;
}) {
  return (
    <>
      <div className="bg-white p-4 font-medium text-neutral-700 sm:p-5">
        {label}
      </div>
      <div className="flex items-center justify-center bg-white p-4 text-center sm:p-5">
        {generic === false ? (
          <span className="inline-flex items-center gap-1.5 text-neutral-400">
            <Minus className="h-4 w-4" /> No
          </span>
        ) : (
          <span className="text-neutral-500">{generic}</span>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 bg-[#2E7DFF]/[0.07] p-4 text-center sm:p-5">
        <Check className="h-4 w-4 flex-shrink-0 text-[#2E7DFF]" strokeWidth={3} />
        <span className="font-semibold text-neutral-900">{ours}</span>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing — the three real products, at their live prices             */
/* ------------------------------------------------------------------ */

export function PricingTiers() {
  const { prices, productPreorder } = useStoreStatus();
  const pct = Math.round(discountRate(true) * 100);
  const anyPreorder = Object.values(productPreorder).some(Boolean);

  return (
    <section
      id="pricing"
      className="relative scroll-mt-20 border-y border-neutral-200 bg-neutral-50 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
              Pricing
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              Buy it once. Own it forever.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-neutral-600">
              No subscription, no per-tap fee. Prices in {site.currency.code}.
              {anyPreorder ? ` Pre-order takes ${pct}% off at checkout.` : ""}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {products.map((p, i) => {
            const base = prices[p.id]?.basePrice ?? p.basePrice;
            const onPreorder = productPreorder[p.id] ?? false;
            const pay = onPreorder ? unitPriceFor(base, true) : base;
            const featured = i === 0;
            return (
              <Reveal key={p.id} delay={i * 0.08}>
                <div
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-7 sm:p-8",
                    featured
                      ? "border-[#2E7DFF]/50 shadow-lift"
                      : "border-neutral-200 shadow-soft",
                  )}
                >
                  {featured && (
                    <span className="absolute left-5 top-5 z-10 rounded-md bg-[#2E7DFF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-soft">
                      Best seller
                    </span>
                  )}

                  <div className="mx-auto w-full max-w-[13rem]">
                    <ProductVisual
                      visual={p.visual}
                      name={p.name}
                      className="rounded-xl bg-neutral-50"
                    />
                  </div>

                  <h3 className="mt-5 font-display text-xl font-extrabold text-neutral-900">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">{p.tagline}</p>

                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold text-neutral-900">
                      {formatPrice(pay)}
                    </span>
                    {onPreorder && (
                      <span className="text-base text-neutral-400 line-through">
                        {formatPrice(base)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    each · {p.formFactor}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-neutral-200 pt-6">
                    {p.features.slice(0, 4).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-neutral-600"
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
                    Design Your Card
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.24}>
          <p className="mt-8 text-center text-sm text-neutral-500">
            Ordering for several locations?{" "}
            <a
              href={`mailto:${site.email}?subject=Bulk%20order%20enquiry`}
              className="font-semibold text-neutral-900 underline"
            >
              Talk to us about bulk
            </a>{" "}
            — shipping drops per card as the quantity climbs.
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
      "We went from asking for reviews and being ignored to 40-odd new ones in two months. The card sits by the till and people just tap it.",
    name: "Sample business",
    role: "Barbershop, 2 chairs",
  },
  {
    quote:
      "I hand it over at the end of every appointment. Clients follow on the spot instead of saying they'll look us up later.",
    name: "Sample business",
    role: "Lash & brow studio",
  },
  {
    quote:
      "The stand sits beside the card reader and does the asking for us. Nobody on the team has to remember a script.",
    name: "Sample business",
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
              As seen tapping in
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              Counters, chairs and tables
            </h2>
          </div>
          <p className="max-w-xs text-sm text-neutral-500">
            Illustrative examples of how the cards get used day to day — not
            real customer testimonials.
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
              <figcaption className="mt-5 border-t border-neutral-200 pt-4">
                <p className="text-sm font-bold text-neutral-900">{q.name}</p>
                <p className="text-xs text-neutral-500">{q.role}</p>
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
        <div className="relative overflow-hidden rounded-2xl bg-neutral-900 px-6 py-20 text-center sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(46,125,255,0.45) 0%, rgba(46,125,255,0) 70%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Put your card on the counter this week
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base text-neutral-300 sm:text-lg">
              Pick a design, send us your link, and we&apos;ll have it
              programmed and on its way. Ships across Canada &amp; the US.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-md bg-white px-8 py-4 text-base font-bold text-neutral-900 transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                Design Your Card
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
