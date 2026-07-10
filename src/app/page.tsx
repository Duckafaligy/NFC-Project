import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Truck,
  Smartphone,
  BadgeCheck,
  Palette,
  RefreshCw,
  X,
  Check,
  Minus,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Testimonials } from "@/components/Testimonials";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

const industries = [
  { img: "/images/barbershop.jpg", name: "Barbershops", line: "Card at the register. Tap while they admire the cut." },
  { img: "/images/cafe.jpg", name: "Cafés", line: "Stand by the pickup counter. Tap while the coffee's poured." },
  { img: "/images/restaurant.jpg", name: "Restaurants", line: "Tag on the check presenter. Tap when the bill lands." },
  { img: "/images/salon.jpg", name: "Salons & spas", line: "Hand it over at checkout. Two seconds, done." },
  { img: "/images/foodtruck.jpg", name: "Food trucks", line: "Sticker by the window. Tap while they wait for the order." },
];

const comparison: {
  label: string;
  nfc: boolean | string;
  qr: boolean | string;
  asking: boolean | string;
}[] = [
  { label: "Works in one tap", nfc: true, qr: "Open camera, aim, focus, tap link", asking: false },
  { label: "No typing or searching", nfc: true, qr: true, asking: "They have to find you later" },
  { label: "Feels premium in hand", nfc: true, qr: false, asking: "—" },
  { label: "Survives spills & sun", nfc: true, qr: "Fades and scratches", asking: "—" },
  { label: "Change the link later", nfc: true, qr: "Reprint everything", asking: "—" },
  { label: "Works in dim light", nfc: true, qr: false, asking: true },
];

const faqs = [
  {
    q: "Is this against Google's rules?",
    a: "No. You're simply making it easier for customers to leave an honest review — same as asking in person. What Google prohibits is paying or incentivizing reviews, or filtering so only happy customers get asked. Use the card openly with every customer and you're fine.",
  },
  {
    q: "Do my customers need an app?",
    a: "No app, no setup. NFC reading is built into iPhones (7 and newer) and virtually every Android from the last several years. They hold their phone near the card and the link opens.",
  },
  {
    q: "Is there a subscription or monthly fee?",
    a: "No. You buy the card once and you own it. No monthly platform fee, no per-tap charge, nothing.",
  },
  {
    q: "What if I change my Google page, menu, or WiFi password?",
    a: "Every product is reprogrammable. Point it at a new link whenever you need — the physical card never becomes obsolete.",
  },
  {
    q: "How fast will I get it?",
    a: `Standard designs ship in ${site.shipping.handlingDays} and arrive in ${site.shipping.deliveryDays}. Custom designs get a digital proof within 48 hours — we print after you approve it.`,
  },
];

export default function HomePage() {
  const featured = products.filter((p) => p.popular).slice(0, 4);

  return (
    <>
      {/* ===== HERO — real counter, real moment ===== */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src="/images/counter-pay.jpg"
            alt="A customer tapping their phone at a shop counter"
            fill
            priority
            className="object-cover object-center opacity-80"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pb-32 lg:pt-32">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                NFC review cards & smart tags for local business
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl">
                Turn happy customers into Google reviews — before they walk out
                the door.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg text-slate-200">
                A TapLink card sits at your counter. Your customer taps their
                phone, your review page opens, and twenty seconds later you have
                a new five-star review. No app. No QR hunting. No &ldquo;I&rsquo;ll
                do it when I get home.&rdquo;
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink
                  href="/products/google-review-card"
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  Get the review card <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink
                  href="/products"
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
                >
                  All products
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  {site.guaranteeDays}-day money-back guarantee
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-slate-300" />
                  Ships in {site.shipping.handlingDays}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-slate-300" />
                  iPhone & Android, no app
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== THE PROBLEM, WITH NUMBERS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                Your work is five stars.
                <br />
                Your Google page doesn&apos;t show it.
              </h2>
              <p className="mt-5 text-slate-600">
                Nearly everyone checks reviews before trying a local business —
                BrightLocal&apos;s consumer survey puts it at{" "}
                <strong className="text-slate-900">98% of consumers</strong>.
                And your rating decides whether they pick you or the shop down
                the street.
              </p>
              <p className="mt-4 text-slate-600">
                Here&apos;s the frustrating part: your happiest customers rarely
                leave a review. Not because they don&apos;t want to — because by
                the time they&apos;re home, the moment&apos;s gone. Finding your
                Google listing takes a search, six taps, and memory. TapLink
                cuts it to{" "}
                <strong className="text-slate-900">
                  one tap, at the counter, while they&apos;re still smiling
                </strong>
                .
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { big: "98%", small: "of consumers read reviews for local businesses (BrightLocal)" },
                { big: "1 tap", small: "from happy customer to your review page — no app, no search" },
                { big: "~20 sec", small: "for a customer to tap, type two lines, and post" },
                { big: "$0/mo", small: "no subscription — you buy the card once and own it" },
              ].map((s) => (
                <div
                  key={s.big}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
                >
                  <p className="font-display text-4xl font-extrabold text-blue-600">
                    {s.big}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{s.small}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== THE COUNTER MOMENT ===== */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                It happens at the counter
              </h2>
              <p className="mt-3 text-slate-500">
                The best time to ask for a review is the moment you hand back
                the card reader. Here&apos;s the play, step by step.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "The handoff",
                desc: "You've just finished the cut, poured the coffee, closed the ticket. The customer is at their happiest — and their phone is already in their hand.",
              },
              {
                n: "02",
                title: "The tap",
                desc: "“Would you mind leaving us a quick review? Just tap your phone here.” They hold it to the card and your Google review page opens instantly.",
              },
              {
                n: "03",
                title: "The review",
                desc: "They tap five stars and type a line or two while the receipt prints. Posted before they reach the door — not forgotten on the drive home.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
                  <span className="font-display text-5xl font-extrabold text-slate-100">
                    {s.n}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INDUSTRIES — real places ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                Built for the places you actually work
              </h2>
              <p className="mt-3 max-w-xl text-slate-500">
                Wherever there&apos;s a counter, a register, or a line of
                customers holding phones — that&apos;s where TapLink earns its
                keep.
              </p>
            </div>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((biz, i) => (
            <Reveal key={biz.name} delay={i * 0.05}>
              <div className="group relative h-64 overflow-hidden rounded-2xl shadow-card">
                <Image
                  src={biz.img}
                  alt={biz.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <h3 className="font-display text-lg font-bold text-white">
                    {biz.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-200">{biz.line}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.25}>
            <Link
              href="/contact"
              className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-paper p-5 text-center transition-colors hover:border-blue-500"
            >
              <span className="font-display text-lg font-bold text-slate-900">
                Your business
              </span>
              <p className="text-sm text-slate-500">
                Trades, gyms, dentists, real estate — if customers can hold a
                phone, this works. Ask us how.
              </p>
              <span className="text-sm font-semibold text-blue-600">
                Talk to us →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Reveal>
              <div>
                <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                  Best sellers
                </h2>
                <p className="mt-3 text-slate-500">
                  Buy 3+ and save 10%. 5+ saves 15%. 10+ saves 20% — most shops
                  grab one for the counter, one for the door, one spare.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
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
        </div>
      </section>

      {/* ===== WHY NOT JUST A QR CODE? ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              &ldquo;Why not just print a QR code?&rdquo;
            </h2>
            <p className="mt-3 text-slate-500">
              Fair question — we hear it at every door. Here&apos;s the honest
              comparison.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-paper">
                  <th className="p-4 font-semibold text-slate-500"> </th>
                  <th className="p-4 font-display text-base font-bold text-blue-600">
                    TapLink NFC
                  </th>
                  <th className="p-4 font-semibold text-slate-500">
                    Paper QR code
                  </th>
                  <th className="p-4 font-semibold text-slate-500">
                    Just asking
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="p-4 font-medium text-slate-900">
                      {row.label}
                    </td>
                    {[row.nfc, row.qr, row.asking].map((cell, i) => (
                      <td key={i} className="p-4 text-slate-500">
                        {cell === true ? (
                          <Check className="h-5 w-5 text-emerald-600" />
                        ) : cell === false ? (
                          <X className="h-5 w-5 text-red-400" />
                        ) : cell === "—" ? (
                          <Minus className="h-5 w-5 text-slate-300" />
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
          <p className="mt-4 text-center text-xs text-slate-400">
            Want belt and suspenders? Ask us to print a QR code on the back of
            your card as a fallback — free.
          </p>
        </Reveal>
      </section>

      {/* ===== CUSTOM DESIGN ===== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-950">
            <div className="absolute inset-0">
              <Image
                src="/images/hero-tap.jpg"
                alt="A boutique checkout counter"
                fill
                className="object-cover opacity-30"
                sizes="100vw"
              />
            </div>
            <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  <Palette className="h-3.5 w-3.5" /> Custom design
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
                  Your logo on the card, not ours
                </h2>
                <p className="mt-3 max-w-md text-slate-300">
                  Upload your own artwork, or tell us your business name and
                  colors and our team designs it for you — you get a digital
                  proof within 48 hours and we only print after you approve it.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink
                    href="/products"
                    className="bg-white text-slate-900 hover:bg-slate-100"
                  >
                    Start customizing
                  </ButtonLink>
                  <ButtonLink
                    href="/contact"
                    variant="secondary"
                    className="border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
                  >
                    Ask about bulk orders
                  </ButtonLink>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BadgeCheck, title: "Proof before print", desc: "Nothing is printed until you approve the design." },
                  { icon: RefreshCw, title: "Reprogrammable", desc: "New link, new menu, new WiFi — same card." },
                  { icon: ShieldCheck, title: "Scan-or-replace", desc: "If a card ever stops scanning, we replace it free." },
                  { icon: Star, title: "Bulk pricing", desc: "Save up to 20% on packs — ideal for multi-location." },
                ].map((p) => (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur"
                  >
                    <p.icon className="h-6 w-6 text-white" />
                    <h4 className="mt-3 font-semibold text-white">{p.title}</h4>
                    <p className="mt-1 text-xs text-slate-300">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== GUARANTEE ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center sm:p-14">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </span>
            <h2 className="max-w-2xl font-display text-3xl font-bold text-slate-900">
              Try it at your counter for {site.guaranteeDays} days
            </h2>
            <p className="max-w-xl text-slate-600">
              If it doesn&apos;t earn its spot, send it back for a full refund —
              no forms, no restocking fee. And if a card ever stops scanning, we
              replace it free. That&apos;s the whole policy.
            </p>
            <ButtonLink href="/products" size="lg">
              Pick your card <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            The questions everyone asks
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                  {f.q}
                  <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-10 text-center sm:p-16">
            <div className="grid-texture-invert absolute inset-0 opacity-60" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl">
                The next customer at your counter could be a review
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                Cards from {`$${products[0].basePrice}`}. Programmed to your link
                before we ship. At your door in days.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <ButtonLink
                  href="/products"
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  Shop now <ArrowRight className="h-5 w-5" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
