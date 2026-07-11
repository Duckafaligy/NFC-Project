import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  BadgeCheck,
  RefreshCw,
  Layers,
  MousePointerClick,
  Nfc,
  X,
  Check,
  Minus,
  Star,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Testimonials } from "@/components/Testimonials";
import { ContactSection } from "@/components/ContactSection";
import { GrowthChart } from "@/components/GrowthChart";
import { ReviewCalculator } from "@/components/ReviewCalculator";
import { CountUp } from "@/components/CountUp";
import { PromoBanner } from "@/components/PromoBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

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
    a: "No. iPhones from the XS (2018) onward read NFC tags automatically in the background, and nearly every Android sold in recent years does the same. The customer holds their phone near the card and the link pops up. Older iPhones (7 through X) can read tags too but need the camera or a scanner app, which is why we also print a free QR code on the back as a fallback.",
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
    q: "How does pre-order pricing work?",
    a: `While the pre-order window is open, everything in your cart is ${Math.round(site.preorder.discount * 100)}% off, no code needed. ${site.preorder.shipNote}. When the window closes, pricing returns to standard and orders ship on the normal schedule.`,
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
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
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
              <p className="font-display text-4xl font-extrabold text-blue-600">
                $0
              </p>
              <p className="mt-2 text-sm text-neutral-700">
                per month. Buy the card once and you own it.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.22} className="lg:col-span-3">
            <div className="h-full rounded-md bg-neutral-100 p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
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

      {/* ===== ROTATING BANNER ===== */}
      <PromoBanner />

      {/* ===== RESULTS: CHART + CALCULATOR + COUNTERS ===== */}
      <section className="bg-neutral-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            n="01"
            dark
            eyebrow="The numbers"
            title="What one tap adds up to"
          />
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <GrowthChart />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <ReviewCalculator />
          </Reveal>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Reveal delay={0.1}>
            <div className="h-full rounded-md border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="font-display text-4xl font-extrabold text-emerald-500">
                <CountUp value={312} />
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                reviews in 6 months at 2 yeses a day
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="h-full rounded-md border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="font-display text-4xl font-extrabold text-blue-400">
                <CountUp value={20} suffix=" sec" />
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                from tap to posted review
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="h-full rounded-md border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="font-display text-4xl font-extrabold text-white">
                <CountUp value={98} suffix="%" />
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                read reviews before choosing (BrightLocal)
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="h-full rounded-md border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="font-display text-4xl font-extrabold text-violet-400">
                <CountUp value={0} prefix="$" />
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                monthly fees, forever
              </p>
            </div>
          </Reveal>
        </div>
      </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <SectionHeader
              n="02"
              align="left"
              eyebrow="Shop"
              title="Best sellers"
              sub="Every product is $34.99, or $42.99 with your own branding. Pre-order now and 20% comes off your whole cart at checkout."
            />
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

      {/* ===== HOW IT GOES AT THE COUNTER ===== */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            n="03"
            eyebrow="Twenty seconds, start to finish"
            title="How it goes at the counter"
            sub="The best moment to ask for a review is right after you hand back the card reader."
          />
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
      </div>
      </section>

      {/* ===== HOW THE TECH WORKS ===== */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
      >
        <Reveal>
          <SectionHeader
            n="04"
            eyebrow="The tech, minus the jargon"
            title="How tap-to-connect works"
          />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Nfc,
              title: "A chip in every card",
              desc: "We program it with the link of your choice before it ships: reviews, socials, menu, WiFi, or a hub.",
              color: "text-blue-600",
            },
            {
              icon: MousePointerClick,
              title: "The customer taps",
              desc: "They hold their phone near the card. No app, no scanning, no typing.",
              color: "text-emerald-600",
            },
            {
              icon: Smartphone,
              title: "The link opens",
              desc: "Your page pops up on their screen, ready for the review, follow, or order.",
              color: "text-amber-500",
            },
            {
              icon: RefreshCw,
              title: "Change it any time",
              desc: "The card is reprogrammable, so it grows with your business.",
              color: "text-violet-600",
            },
          ].map((t, i) => (
            <Reveal key={t.title} delay={i * 0.05}>
              <div className="h-full rounded-md bg-neutral-100 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white shadow-soft">
                  <t.icon className={`h-5 w-5 ${t.color}`} />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-neutral-900">
                  {t.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-600">{t.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== NFC VS QR VS ASKING ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            n="05"
            eyebrow="Honest comparison"
            title="&ldquo;Why not just print a QR code?&rdquo;"
            sub="We get this question at every door. Here is how the three options stack up."
          />
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
          <SectionHeader
            n="06"
            eyebrow="Who it&apos;s for"
            title="Built for places with counters"
            sub="Anywhere customers stand with a phone in hand, the card earns its keep."
          />
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
          <Reveal delay={0.25} className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/#contact"
              className="card card-hover flex flex-col items-center justify-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left"
            >
              <div>
                <span className="font-display text-lg font-extrabold text-neutral-900">
                  Your business
                </span>
                <p className="mt-1 text-sm text-neutral-500">
                  Trades, gyms, dentists, real estate. If your customers can
                  hold a phone, this works.
                </p>
              </div>
              <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-sm font-bold text-neutral-900">
                Talk to us <ArrowRight className="h-4 w-4" />
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
                <ButtonLink href="/#contact" variant="secondary">
                  Ask about bulk orders
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-6 sm:p-8">
              {[
                { icon: BadgeCheck, title: "Proof first", desc: "You approve the design before we print." },
                { icon: RefreshCw, title: "Reprogram free", desc: "New link, same card, any time." },
                { icon: ShieldCheck, title: "Replace free", desc: "If a card stops scanning, we send a new one." },
                { icon: Layers, title: "QR fallback", desc: "Free QR code printed on the back if you want it." },
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

      {/* ===== WHAT TO SAY ===== */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            n="07"
            eyebrow="Steal these scripts"
            title="What to actually say"
            sub="The card does the technical part. One rehearsed sentence does the rest. These are the asks that work, word for word."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              setting: "Barbershop, at the register",
              script:
                "“While I ring you up, would you mind tapping your phone here? It opens our Google page. Takes about twenty seconds.”",
              why: "The customer is waiting anyway. You are filling dead time, not asking for extra time.",
            },
            {
              setting: "Restaurant, dropping the check",
              script:
                "“If you enjoyed tonight, there's a card on the stand that opens our reviews with a tap. It genuinely helps a small place like ours.”",
              why: "“Small place like ours” converts. People want to help a business they can picture.",
            },
            {
              setting: "Mobile trades, wrapping the job",
              script:
                "“Before I pack up, could I ask a quick favor? Tap your phone on my keychain and it opens our review page. Two lines is plenty.”",
              why: "“Two lines is plenty” removes the biggest excuse: not knowing what to write.",
            },
          ].map((c, i) => (
            <Reveal key={c.setting} delay={i * 0.06}>
              <div className="card flex h-full flex-col p-6">
                <p className="eyebrow">{c.setting}</p>
                <blockquote className="mt-3 flex-1 font-display text-base font-bold leading-relaxed text-neutral-900">
                  {c.script}
                </blockquote>
                <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                  Why it works: {c.why}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== GUARANTEE ===== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-lg bg-neutral-100 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-white shadow-soft">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
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

      {/* ===== REFERENCES ===== */}
      <section className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="border-t border-neutral-200 pt-6">
          <p className="eyebrow">Sources</p>
          <ul className="mt-3 space-y-1.5 text-xs text-neutral-500">
            <li>
              98% figure:{" "}
              <a
                href="https://www.brightlocal.com/research/local-consumer-review-survey/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-700 underline hover:text-neutral-900"
              >
                BrightLocal, Local Consumer Review Survey
              </a>
            </li>
            <li>
              Review rules (honest reviews yes, paying for reviews no):{" "}
              <a
                href="https://support.google.com/contributionpolicy/answer/7400114"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-700 underline hover:text-neutral-900"
              >
                Google Maps content policies
              </a>
            </li>
            <li>
              Background NFC tag reading on iPhone XS and later:{" "}
              <a
                href="https://support.apple.com/guide/iphone/use-nfc-tag-reader-iph30d73c78d/ios"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-700 underline hover:text-neutral-900"
              >
                Apple iPhone User Guide
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <ContactSection />

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-lg bg-neutral-900 p-10 text-center sm:p-16">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl">
              Put a card on your counter this week
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-300">
              Every card $34.99, custom designs $42.99. Pre-order now and 20%
              comes off your whole cart.
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
