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
    bg: "bg-neutral-100",
    iconColor: "text-neutral-900",
  },
  {
    icon: MousePointerClick,
    title: "Your customer taps their phone",
    desc: "They hold their phone near the card. No app, no QR scanning, no typing. Modern iPhones and Androids read NFC automatically.",
    bg: "bg-neutral-100",
    iconColor: "text-neutral-900",
  },
  {
    icon: Smartphone,
    title: "The link opens instantly",
    desc: "Your destination pops up on their screen, ready to leave a review, follow you, join your WiFi, or browse your menu.",
    bg: "bg-neutral-100",
    iconColor: "text-neutral-900",
  },
  {
    icon: RefreshCw,
    title: "Change the link any time",
    desc: "New promo, new platform, new menu. Your card is reprogrammable, so it grows with your business.",
    bg: "bg-neutral-100",
    iconColor: "text-neutral-900",
  },
];

const faqs = [
  {
    q: "Do my customers need an app?",
    a: "No. NFC is built into virtually all modern smartphones. They just tap and the link opens.",
  },
  {
    q: "Which phones support tapping?",
    a: "iPhone XS (2018) and newer read tags automatically in the background. iPhone 7 through X can read them through the camera or a scanner app. Nearly all Android phones with NFC read tags natively. Every card also carries a free QR code fallback if you want one.",
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
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            How tap-to-connect works
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            NFC turns a physical tap into a digital action. Start to finish,
            here is the whole thing.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <div className={`h-full rounded-md p-6 ${s.bg}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white shadow-soft">
                <s.icon className={`h-6 w-6 ${s.iconColor}`} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-700">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold text-neutral-900">
            Frequently asked
          </h2>
        </Reveal>
        <div className="mt-8 space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-neutral-900">
                  {f.q}
                  <span className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-900 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-neutral-500">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Reveal>
        <div className="mt-16 flex flex-col items-center gap-4 rounded-lg bg-neutral-100 p-10 text-center">
          <h2 className="font-display text-2xl font-extrabold text-neutral-900">
            Ready to start tapping?
          </h2>
          <p className="max-w-md text-neutral-700">
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
