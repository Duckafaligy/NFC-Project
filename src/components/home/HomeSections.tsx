"use client";

import Link from "next/link";
import { ArrowRight, Check, Minus, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useStoreStatus } from "@/context/StoreStatus";
import { products, DESIGN_LABOUR_FEE } from "@/lib/products";
import { unitPriceFor, discountRate } from "@/lib/pricing";
import { formatPrice, cn } from "@/lib/utils";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Comparison strip                                                    */
/* ------------------------------------------------------------------ */

const ROWS: { label: string; generic: string | false; ours: string }[] = [
  { label: "Design personalization", generic: false, ours: "Built around your brand" },
  { label: "Finish options", generic: "One", ours: "Matte, metal, holographic" },
  { label: "Programmed before shipping", generic: false, ours: "Ready on arrival" },
  { label: "Change the destination later", generic: false, ours: "Any time, no reprint" },
  { label: "Design proof before printing", generic: false, ours: "Within 48 hours" },
  { label: "Support after you buy", generic: "None", ours: `${site.guaranteeDays} days of free maintenance` },
];

export function ComparisonStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
          The difference
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl text-balance">
          Why ours costs more than a blank tag
        </h2>
        <p className="mt-4 max-w-xl text-base text-neutral-400">
          You can buy an unbranded NFC card anywhere. What you can&apos;t buy is
          one designed for your business, programmed before it ships, and backed
          by someone who fixes it if it breaks.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.4fr_1fr_1.3fr] gap-px bg-white/10 text-sm">
            {/* Header */}
            <div className="bg-neutral-950 p-4 sm:p-5" />
            <div className="bg-neutral-950 p-4 text-center sm:p-5">
              <p className="font-bold text-neutral-400">Generic NFC card</p>
            </div>
            <div className="relative bg-[#2E7DFF]/[0.08] p-4 text-center sm:p-5">
              <p className="font-display font-extrabold text-white">
                {site.name} custom card
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
      <div className="bg-neutral-950 p-4 text-neutral-300 sm:p-5">{label}</div>
      <div className="flex items-center justify-center bg-neutral-950 p-4 text-center sm:p-5">
        {generic === false ? (
          <span className="inline-flex items-center gap-1.5 text-neutral-600">
            <Minus className="h-4 w-4" /> No
          </span>
        ) : (
          <span className="text-neutral-500">{generic}</span>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 bg-[#2E7DFF]/[0.08] p-4 text-center sm:p-5">
        <Check className="h-4 w-4 flex-shrink-0 text-[#2E7DFF]" strokeWidth={3} />
        <span className="font-semibold text-white">{ours}</span>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export function PricingTiers() {
  const { prices, productPreorder } = useStoreStatus();

  // Anchor the tiers to the real catalog so the numbers always match checkout.
  const base = products[0];
  const live = prices[base.id];
  const standard = live?.basePrice ?? base.basePrice;
  // The first product that still offers custom defines the custom price.
  const customProduct = products.find(
    (p) => (prices[p.id]?.customUpcharge ?? p.customUpcharge) != null,
  );
  const customUp = customProduct
    ? (prices[customProduct.id]?.customUpcharge ?? customProduct.customUpcharge ?? 0)
    : null;
  const customPrice =
    customProduct && customUp != null
      ? (prices[customProduct.id]?.basePrice ?? customProduct.basePrice) + customUp
      : null;

  const anyPreorder = Object.values(productPreorder).some(Boolean);
  const pct = Math.round(discountRate(true) * 100);

  const tiers = [
    {
      name: "Starter",
      price: standard,
      unit: "per card",
      tagline: "One card, one destination.",
      features: [
        "Ready-made design in your colourway",
        "Programmed to your link before shipping",
        "Re-point it any time from your dashboard",
        "Works on iPhone and Android",
      ],
      cta: "Design Your Card",
      href: "/products",
      featured: false,
    },
    {
      name: "Custom",
      price: customPrice,
      unit: "per card",
      tagline: "Your brand, laid out by us.",
      features: [
        "Everything in Starter",
        "Artwork built around your logo and colours",
        "Digital proof to approve before printing",
        `Add "we design it" for ${formatPrice(DESIGN_LABOUR_FEE)}`,
      ],
      cta: "Design Your Card",
      href: "/products",
      featured: true,
    },
    {
      name: "Business bulk",
      price: null,
      unit: "10+ cards",
      tagline: "Every table, every location.",
      features: [
        "Everything in Custom",
        "Shipping drops per card as quantity climbs",
        "One artwork rolled out across the whole order",
        "Priority turnaround on reorders",
      ],
      cta: "Get Started",
      href: `mailto:${site.email}?subject=Bulk%20order%20enquiry`,
      featured: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative scroll-mt-20 border-y border-white/5 bg-white/[0.015] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7DFF]">
              Pricing
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl text-balance">
              Buy the card once. Own it forever.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-neutral-400">
              No subscription, no per-tap fee. Prices in {site.currency.code}.
              {anyPreorder ? ` Pre-order pricing takes ${pct}% off at checkout.` : ""}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7 sm:p-8",
                  t.featured
                    ? "border-[#2E7DFF]/50 bg-gradient-to-b from-[#2E7DFF]/[0.12] to-transparent"
                    : "border-white/10 bg-white/[0.02]",
                )}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md bg-[#2E7DFF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-extrabold text-white">
                  {t.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-400">{t.tagline}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  {t.price != null ? (
                    <>
                      <span className="font-display text-4xl font-extrabold text-white">
                        {formatPrice(
                          anyPreorder ? unitPriceFor(t.price, true) : t.price,
                        )}
                      </span>
                      {anyPreorder && (
                        <span className="text-base text-neutral-500 line-through">
                          {formatPrice(t.price)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-display text-4xl font-extrabold text-white">
                      Let&apos;s talk
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {t.unit}
                </p>

                <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-300">
                      <Check
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2E7DFF]"
                        strokeWidth={3}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={t.href}
                  className={cn(
                    "group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3.5 text-base font-bold transition-all",
                    t.featured
                      ? "bg-white text-neutral-950 hover:scale-[1.02]"
                      : "border border-white/20 text-white hover:bg-white/5",
                  )}
                >
                  {t.cta}
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
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
      "Swapped 40 paper menu inserts for one card per table. When the specials change I edit the link, not the print run.",
    name: "Sample business",
    role: "Brunch restaurant",
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
            <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl text-balance">
              Counters, chairs and tables
            </h2>
          </div>
          <p className="max-w-xs text-sm text-neutral-500">
            Illustrative examples of how the card gets used day to day — not
            real customer testimonials.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.role} delay={i * 0.08}>
            <figure className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((n) => (
                  <Star
                    key={n}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-neutral-300">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-white/10 pt-4">
                <p className="text-sm font-bold text-white">{q.name}</p>
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
    <section className="relative overflow-hidden border-t border-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[110px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(46,125,255,0.5) 0%, rgba(46,125,255,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:py-32">
        <Reveal>
          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
            Put your card on the
            <br />
            counter this week
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-neutral-400 sm:text-lg">
            Pick a design, send us your link, and we&apos;ll have it programmed
            and on its way. Ships across Canada &amp; the US.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-md bg-white px-8 py-4 text-base font-bold text-neutral-950 transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              Design Your Card
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/5"
            >
              See pricing
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
