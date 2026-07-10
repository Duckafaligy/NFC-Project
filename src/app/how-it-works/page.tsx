import type { Metadata } from "next";
import { Smartphone, Nfc, MousePointerClick, RefreshCw } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Learn how NFC tap technology works and how to use your card to grow reviews, followers, and more.",
};

const steps = [
  {
    icon: Nfc,
    title: "Every product has a smart NFC chip",
    desc: "Inside each card, tag, or stand is a tiny chip we program with the link of your choice — your Google review page, Instagram, menu, WiFi, or a full link hub.",
  },
  {
    icon: MousePointerClick,
    title: "Your customer taps their phone",
    desc: "They hold their phone near the card. No app, no QR scanning, no typing. Modern iPhones and Androids read NFC automatically.",
  },
  {
    icon: Smartphone,
    title: "The link opens instantly",
    desc: "Your destination pops up on their screen right away — ready to leave a review, follow you, join your WiFi, or browse your menu.",
  },
  {
    icon: RefreshCw,
    title: "Change the link any time",
    desc: "Running a new promo or switched platforms? Your card is reprogrammable, so it grows with your business.",
  },
];

const faqs = [
  {
    q: "Do my customers need an app?",
    a: "No. NFC is built into virtually all modern smartphones. They just tap — the link opens automatically.",
  },
  {
    q: "Which phones support tapping?",
    a: "Practically every iPhone from the iPhone 7 onward and nearly all Android phones from the last several years.",
  },
  {
    q: "Can I change where the card points later?",
    a: "Yes. Our cards are reprogrammable, so you can update the destination without buying a new card.",
  },
  {
    q: "What's the difference between standard and custom?",
    a: "Standard uses a clean ready-made design. Custom lets you upload your own artwork or have our team design it around your brand.",
  },
  {
    q: "How is this different from a QR code?",
    a: "No scanning or camera app needed — a tap is faster and feels premium. Many products include a QR fallback too.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            How <span className="text-gradient">tap-to-connect</span> works
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            NFC turns a physical tap into a digital action. Here&apos;s the whole
            thing, start to finish.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-white/10 bg-ink-900 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                <s.icon className="h-6 w-6 text-white" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-white">
            Frequently asked
          </h2>
        </Reveal>
        <div className="mt-8 space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="group rounded-2xl border border-white/10 bg-ink-900 p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-white">
                  {f.q}
                  <span className="ml-4 text-brand-300 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-400">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Reveal>
        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-ink-900 p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white">
            Ready to start tapping?
          </h2>
          <p className="max-w-md text-slate-400">
            Pick a product and we&apos;ll program it for {site.name} — you just
            hand it over and watch it work.
          </p>
          <ButtonLink href="/products" size="lg">
            Browse products
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
