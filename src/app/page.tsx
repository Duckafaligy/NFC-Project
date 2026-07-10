import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  BadgeCheck,
  RefreshCw,
  Layers,
  Truck,
  MessageCircleHeart,
  X,
  Check,
  Minus,
  Star,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Testimonials } from "@/components/Testimonials";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

const benefits = [
  { icon: Truck, title: "Free shipping over $50", desc: "Standard orders ship in 1-2 days" },
  { icon: ShieldCheck, title: "30-day money back", desc: "Full refund, no restocking fee" },
  { icon: RefreshCw, title: "No subscriptions", desc: "Buy once, own it, reprogram free" },
  { icon: MessageCircleHeart, title: "Real support", desc: "We reply within one business day" },
];

const industries = [
  { img: "/images/barbershop.jpg", name: "Barbershops", line: "Card at the register. Tap while they check the cut.", big: true },
  { img: "/images/cafe.jpg", name: "Cafés", line: "Stand by the pickup counter." },
  { img: "/images/restaurant.jpg", name: "Restaurants", line: "Tag on the check presenter." },
  { img: "/images/salon.jpg", name: "Salons & spas", line: "Hand it over at checkout." },
  { img: "/images/foodtruck.jpg", name: "Food trucks", line: "Sticker by the order window." },
];

const comparison: {
  label: string;
  nfc: boolean | string;
  qr: boolean | string;
  asking: boolean | string;
}[] = [
  { label: "Works in one tap", nfc: true, qr: "Camera out, aim, focus, tap link", asking: false },
  { label: "No typing or searching", nfc: true, qr: true, asking: "They have to find you later" },
  { label: "Feels premium in hand", nfc: true, qr: false, asking: "—" },
  { label: "Survives spills and sun", nfc: true, qr: "Fades and scratches", asking: "—" },
  { label: "Change the link later", nfc: true, qr: "Reprint everything", asking: "—" },
  { label: "Works in dim light", nfc: true, qr: false, asking: true },
];

const faqs = [
  {
    q: "Is this against Google's rules?",
    a: "No. The card just makes it easier to leave an honest review, the same as asking in person. What Google bans is paying for reviews or filtering so only happy customers get asked. Ask everyone, keep it honest, and you're fine.",
  },
  {
    q: "Do my customers need an app?",
    a: "No. NFC is built into iPhones since the iPhone 7 and almost every Android from recent years. They hold their phone near the card and the link opens.",
  },
  {
    q: "Is there a subscription or monthly fee?",
    a: "No. You buy the card once and you own it. There is no monthly fee and no per-tap charge.",
  },
  {
    q: "What if I change my Google page, menu, or WiFi password?",
    a: "Every product can be reprogrammed. Point it somewhere new whenever you want. The card never goes obsolete.",
  },
  {
    q: "How fast will I get it?",
    a: `Standard designs ship in ${site.shipping.handlingDays} and arrive in ${site.shipping.deliveryDays}. Custom designs get a digital proof within 48 hours, and we print after you approve it.`,
  },
];

export default function HomePage() {
  const featured = products.filter((p) => p.popular).slice(0, 4);

  return (
    <>
      {/* ===== BENTO HERO ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Main tile */}
          <Reveal className="lg:col-span-7">
            <div className="card flex h-full flex-col justify-center p-8 sm:p-12">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-900">
                <Star className="h-3.5 w-3.5 fill-neutral-500 text-neutral-500" />
                NFC review cards for local business
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                More Google reviews, one friendly tap away
              </h1>
              <p className="mt-5 max-w-lg text-lg text-neutral-600">
                Put a TapLink card next to your register. A customer taps their
                phone, your review page opens, and they post before the receipt
                finishes printing. No app, no QR code.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/products/google-review-card" size="lg">
                  Get the review card <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink href="/products" size="lg" variant="secondary">
                  Browse all products
                </ButtonLink>
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
                <ShieldCheck className="h-4 w-4 text-neutral-900" />
                {site.guaranteeDays}-day money-back guarantee on every order
              </p>
            </div>
          </Reveal>

          {/* Photo tile */}
          <Reveal delay={0.05} className="lg:col-span-5">
            <div className="card relative h-64 overflow-hidden p-0 lg:h-full">
              <Image
                src="/images/counter-pay.jpg"
                alt="A customer tapping their phone at a shop counter"
                fill
                priority
                className="rounded-md object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-soft">
                The tap, mid-checkout
              </span>
            </div>
          </Reveal>

          {/* Stat tiles */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="h-full rounded-md bg-neutral-900 p-6">
              <p className="font-display text-4xl font-extrabold text-white">
                98%
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                of people read reviews before picking a local business
                (BrightLocal survey)
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.14} className="lg:col-span-3">
            <div className="card h-full p-6">
              <Smartphone className="h-6 w-6 text-neutral-900" />
              <p className="mt-2 font-display text-xl font-extrabold text-neutral-900">
                No app needed
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Works on iPhone and Android out of the box
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.18} className="lg:col-span-3">
            <div className="h-full rounded-md bg-neutral-100 p-6">
              <p className="font-display text-4xl font-extrabold text-orange-600">
                $0
              </p>
              <p className="mt-2 text-sm text-neutral-700">
                per month. Buy the card once and you own it.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.22} className="lg:col-span-3">
            <div className="h-full rounded-md bg-neutral-100 p-6">
              <ShieldCheck className="h-6 w-6 text-neutral-900" />
              <p className="mt-2 font-display text-xl font-extrabold text-neutral-900">
                {site.guaranteeDays}-day returns
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                Full refund if it doesn&apos;t earn its spot
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== BENEFITS STRIP ===== */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100">
                <b.icon className="h-5 w-5 text-neutral-900" />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-900">{b.title}</p>
                <p className="text-xs text-neutral-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT GOES AT THE COUNTER ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Twenty seconds, start to finish</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              How it goes at the counter
            </h2>
            <p className="mt-3 text-neutral-500">
              The best moment to ask for a review is right after you hand back
              the card reader.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "The handoff",
              desc: "You finish the cut, pour the coffee, close the ticket. The customer is happy and their phone is already in their hand.",
            },
            {
              n: "2",
              title: "The tap",
              desc: "You ask once: “Mind leaving us a quick review? Just tap your phone here.” They hold it to the card and your review page opens.",
            },
            {
              n: "3",
              title: "The post",
              desc: "Five stars, two lines, posted while the receipt prints. Not forgotten on the drive home.",
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="card h-full p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-900 font-display text-lg font-extrabold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-neutral-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <div>
              <p className="eyebrow">Shop</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
                Best sellers
              </h2>
              <p className="mt-3 max-w-xl text-neutral-500">
                Buy 3 and save 10%. Buy 5, save 15%. Buy 10, save 20%. Most
                shops take three: counter, door, spare.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 hover:text-neutral-900"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== NFC VS QR VS ASKING ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Honest comparison</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              &ldquo;Why not just print a QR code?&rdquo;
            </h2>
            <p className="mt-3 text-neutral-500">
              We get this question at every door. Here is how the three options
              stack up.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="card mt-10 overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="p-4"> </th>
                  <th className="rounded-t-xl bg-neutral-50 p-4 font-display text-base font-extrabold text-neutral-900">
                    TapLink NFC
                  </th>
                  <th className="p-4 font-semibold text-neutral-500">
                    Paper QR code
                  </th>
                  <th className="p-4 font-semibold text-neutral-500">
                    Just asking
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, ri) => (
                  <tr
                    key={row.label}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="p-4 font-semibold text-neutral-900">
                      {row.label}
                    </td>
                    {[row.nfc, row.qr, row.asking].map((cell, i) => (
                      <td
                        key={i}
                        className={`p-4 text-neutral-500 ${i === 0 ? "bg-neutral-50" : ""} ${i === 0 && ri === comparison.length - 1 ? "rounded-b-xl" : ""}`}
                      >
                        {cell === true ? (
                          <Check className="h-5 w-5 text-neutral-900" />
                        ) : cell === false ? (
                          <X className="h-5 w-5 text-neutral-300" />
                        ) : cell === "—" ? (
                          <Minus className="h-5 w-5 text-neutral-300" />
                        ) : (
                          <span className="text-xs">{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-4 text-center text-xs text-neutral-400">
            Want both? We print a QR code on the back of your card as a
            fallback, free.
          </p>
        </Reveal>
      </section>

      {/* ===== INDUSTRIES BENTO ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Who it&apos;s for</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              Built for places with counters
            </h2>
            <p className="mt-3 text-neutral-500">
              Anywhere customers stand with a phone in hand, the card earns its
              keep.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((biz, i) => (
            <Reveal
              key={biz.name}
              delay={i * 0.05}
              className={biz.big ? "sm:col-span-2 sm:row-span-2" : ""}
            >
              <div
                className={`group relative overflow-hidden rounded-md shadow-soft ${biz.big ? "h-full min-h-[16rem] sm:min-h-[33rem]" : "h-64"}`}
              >
                <Image
                  src={biz.img}
                  alt={biz.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-lg font-extrabold text-white">
                    {biz.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-white/85">{biz.line}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.25}>
            <Link
              href="/contact"
              className="card card-hover flex h-64 flex-col items-center justify-center gap-3 p-6 text-center"
            >
              <span className="font-display text-lg font-extrabold text-neutral-900">
                Your business
              </span>
              <p className="text-sm text-neutral-500">
                Trades, gyms, dentists, real estate. If your customers can hold
                a phone, this works.
              </p>
              <span className="text-sm font-bold text-neutral-900">
                Talk to us →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== CUSTOM DESIGN ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="card grid items-stretch overflow-hidden p-0 lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="eyebrow">Custom design</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
                Your logo on the card
              </h2>
              <p className="mt-4 max-w-md text-neutral-600">
                Upload your artwork, or give us your business name and colors
                and we design it for you. You get a digital proof within 48
                hours. Nothing prints until you approve it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/products">Start customizing</ButtonLink>
                <ButtonLink href="/contact" variant="secondary">
                  Ask about bulk orders
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-6 sm:p-8">
              {[
                { icon: BadgeCheck, title: "Proof first", desc: "You approve the design before we print." },
                { icon: RefreshCw, title: "Reprogram free", desc: "New link, same card, any time." },
                { icon: ShieldCheck, title: "Replace free", desc: "If a card stops scanning, we send a new one." },
                { icon: Layers, title: "Bulk pricing", desc: "Up to 20% off on packs of 10." },
              ].map((p) => (
                <div key={p.title} className="card p-5">
                  <p.icon className="h-6 w-6 text-neutral-900" />
                  <h4 className="mt-3 text-sm font-bold text-neutral-900">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== GUARANTEE ===== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-lg bg-neutral-100 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-white shadow-soft">
                <ShieldCheck className="h-6 w-6 text-neutral-900" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-neutral-900">
                  Try it for {site.guaranteeDays} days, on us
                </h2>
                <p className="mt-1 max-w-xl text-neutral-700">
                  If the card doesn&apos;t earn its spot on your counter, send
                  it back for a full refund. If it ever stops scanning, we
                  replace it free.
                </p>
              </div>
            </div>
            <ButtonLink href="/products" size="lg" className="flex-shrink-0">
              Pick your card <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              Questions everyone asks
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-neutral-900">
                  {f.q}
                  <span className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-900 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-lg bg-neutral-900 p-10 text-center sm:p-16">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl">
              Put a card on your counter this week
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-300">
              Cards from {`$${products[0].basePrice}`}, programmed to your link
              before we ship. At your door in days.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/products" size="lg">
                Shop now <ArrowRight className="h-5 w-5" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
