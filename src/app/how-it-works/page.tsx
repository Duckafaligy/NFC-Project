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
    bg: "bg-yolk",
  },
  {
    icon: MousePointerClick,
    title: "Your customer taps their phone",
    desc: "They hold their phone near the card. No app, no QR scanning, no typing. Modern iPhones and Androids read NFC automatically.",
    bg: "bg-white",
  },
  {
    icon: Smartphone,
    title: "The link opens instantly",
    desc: "Your destination pops up on their screen, ready to leave a review, follow you, join your WiFi, or browse your menu.",
    bg: "bg-bubble",
  },
  {
    icon: RefreshCw,
    title: "Change the link any time",
    desc: "New promo, new platform, new menu. Your card is reprogrammable, so it grows with your business.",
    bg: "bg-mint",
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
          <p className="tag text-ink/50">The tech, minus the jargon</p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">
            How tap-to-connect works
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            NFC turns a physical tap into a digital action. Start to finish,
            here is the whole thing.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <div className={`box h-full p-6 ${s.bg}`}>
              <span className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-white">
                <s.icon className="h-6 w-6 text-ink" />
              </span>
              <h3 className="mt-4 font-display text-lg uppercase leading-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-ink/80">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <Reveal>
          <h2 className="font-display text-3xl uppercase text-ink">
            Frequently asked
          </h2>
        </Reveal>
        <div className="mt-8 space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="box group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-ink">
                  {f.q}
                  <span className="ml-4 font-mono text-xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t-2 border-ink pt-3 text-sm text-ink/70">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Reveal>
        <div className="box mt-16 flex flex-col items-center gap-4 bg-yolk p-10 text-center">
          <h2 className="font-display text-2xl uppercase text-ink">
            Ready to start tapping?
          </h2>
          <p className="max-w-md font-medium text-ink/80">
            Pick a product and we program it before it ships. You put it on the
            counter and start asking.
          </p>
          <ButtonLink href="/products" size="lg" variant="secondary">
            Browse products
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
