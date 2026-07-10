import type { Metadata } from "next";
import { Smartphone, Nfc, MousePointerClick, RefreshCw } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How NFC tap technology works and how to use your card to grow reviews, followers, and more.",
};

const steps = [
  {
    icon: Nfc,
    title: "Every product has a smart NFC chip",
    desc: "Inside each card, tag, or stand is a chip we program with the link of your choice: your Google review page, Instagram, menu, WiFi, or a full link hub.",
    bg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: MousePointerClick,
    title: "Your customer taps their phone",
    desc: "They hold their phone near the card. No app, no QR scanning, no typing. Modern iPhones and Androids read NFC automatically.",
    bg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    icon: Smartphone,
    title: "The link opens instantly",
    desc: "Your destination pops up on their screen, ready to leave a review, follow you, join your WiFi, or browse your menu.",
    bg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: RefreshCw,
    title: "Change the link any time",
    desc: "New promo, new platform, new menu. Your card is reprogrammable, so it grows with your business.",
    bg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

const faqs = [
  {
    q: "Do my customers need an app?",
    a: "No. NFC is built into virtually all modern smartphones. They just tap and the link opens.",
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
    a: "Standard uses a clean ready-made design. Custom means you upload your own artwork or we design it around your brand.",
  },
  {
    q: "How is this different from a QR code?",
    a: "No scanning, no camera app. A tap is faster and feels premium. We can print a QR fallback on the back too, free.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="max-w-2xl">
          <p className="eyebrow">The tech, minus the jargon</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            How tap-to-connect works
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            NFC turns a physical tap into a digital action. Start to finish,
            here is the whole thing.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <div className={`h-full rounded-2xl p-6 ${s.bg}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft">
                <s.icon className={`h-6 w-6 ${s.iconColor}`} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-stone-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-stone-700">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold text-stone-900">
            Frequently asked
          </h2>
        </Reveal>
        <div className="mt-8 space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-stone-900">
                  {f.q}
                  <span className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-stone-500">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Reveal>
        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl bg-orange-100 p-10 text-center">
          <h2 className="font-display text-2xl font-extrabold text-stone-900">
            Ready to start tapping?
          </h2>
          <p className="max-w-md text-stone-700">
            Pick a product and we program it before it ships. You put it on the
            counter and start asking.
          </p>
          <ButtonLink href="/products" size="lg">
            Browse products
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
