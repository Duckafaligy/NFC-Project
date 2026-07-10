import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  BadgeCheck,
  RefreshCw,
  Layers,
  X,
  Check,
  Minus,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { Testimonials } from "@/components/Testimonials";
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
            <div className="box flex h-full flex-col justify-center p-8 sm:p-12">
              <p className="tag text-ink/50">
                NFC review cards for local business
              </p>
              <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink sm:text-6xl">
                More Google reviews.
                <br />
                <span className="bg-yolk px-2">One tap</span> at the counter.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-ink/80">
                Put a TapLink card next to your register. A customer taps their
                phone, your review page opens, and they post before the receipt
                finishes printing. No app. No QR code.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/products/google-review-card" size="lg">
                  Get the review card <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink href="/products" size="lg" variant="secondary">
                  All products
                </ButtonLink>
              </div>
            </div>
          </Reveal>

          {/* Photo tile */}
          <Reveal delay={0.05} className="lg:col-span-5">
            <div className="box relative h-64 overflow-hidden lg:h-full">
              <Image
                src="/images/counter-pay.jpg"
                alt="A customer tapping their phone at a shop counter"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <span className="absolute bottom-3 left-3 border-2 border-ink bg-white px-2 py-1 font-mono text-xs font-bold uppercase text-ink">
                The tap, mid-checkout
              </span>
            </div>
          </Reveal>

          {/* Stat tiles */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="box h-full bg-yolk p-6">
              <p className="font-display text-4xl text-ink">98%</p>
              <p className="mt-2 text-sm font-medium text-ink">
                of people read reviews before picking a local business
                (BrightLocal survey)
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.14} className="lg:col-span-3">
            <div className="box h-full p-6">
              <Smartphone className="h-6 w-6 text-ink" />
              <p className="mt-2 font-display text-xl uppercase text-ink">
                No app
              </p>
              <p className="mt-1 text-sm text-ink/70">
                Works on iPhone and Android out of the box
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.18} className="lg:col-span-3">
            <div className="box h-full bg-bubble p-6">
              <p className="font-display text-4xl text-ink">$0</p>
              <p className="mt-2 text-sm font-medium text-ink">
                per month. Buy the card once and you own it.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.22} className="lg:col-span-3">
            <div className="box h-full bg-mint p-6">
              <ShieldCheck className="h-6 w-6 text-ink" />
              <p className="mt-2 font-display text-xl uppercase text-ink">
                {site.guaranteeDays}-day returns
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                Full refund if it doesn&apos;t earn its spot
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <Marquee />

      {/* ===== HOW IT GOES AT THE COUNTER ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
            How it goes at the counter
          </h2>
          <p className="mt-3 max-w-xl text-ink/70">
            The best moment to ask for a review is right after you hand back the
            card reader. Three steps, twenty seconds.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "The handoff",
              desc: "You finish the cut, pour the coffee, close the ticket. The customer is happy and their phone is already in their hand.",
              bg: "bg-white",
            },
            {
              n: "02",
              title: "The tap",
              desc: "You ask once: “Mind leaving us a quick review? Just tap your phone here.” They hold it to the card and your review page opens.",
              bg: "bg-sky",
            },
            {
              n: "03",
              title: "The post",
              desc: "Five stars, two lines, posted while the receipt prints. Not forgotten on the drive home.",
              bg: "bg-white",
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className={`box h-full p-7 ${s.bg}`}>
                <span className="inline-block border-2 border-ink bg-white px-2 py-1 font-mono text-sm font-bold text-ink">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-xl uppercase text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
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
              <h2 className="font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                Best sellers
              </h2>
              <p className="mt-3 max-w-xl text-ink/70">
                Buy 3 and save 10%. Buy 5, save 15%. Buy 10, save 20%. Most
                shops take three: counter, door, spare.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <Link
              href="/products"
              className="border-b-2 border-ink font-bold text-ink hover:bg-yolk"
            >
              View all products →
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
          <h2 className="font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
            &ldquo;Why not just print a QR code?&rdquo;
          </h2>
          <p className="mt-3 max-w-xl text-ink/70">
            We get this question at every door. Here is how the three options
            stack up.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="box mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-ink bg-cream">
                  <th className="p-4"> </th>
                  <th className="bg-yolk p-4 font-display text-base uppercase text-ink">
                    TapLink NFC
                  </th>
                  <th className="tag p-4 text-ink/60">Paper QR code</th>
                  <th className="tag p-4 text-ink/60">Just asking</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b-2 border-ink last:border-0"
                  >
                    <td className="p-4 font-bold text-ink">{row.label}</td>
                    {[row.nfc, row.qr, row.asking].map((cell, i) => (
                      <td
                        key={i}
                        className={`p-4 text-ink/70 ${i === 0 ? "bg-yolk/30" : ""}`}
                      >
                        {cell === true ? (
                          <Check className="h-5 w-5 text-ink" strokeWidth={3} />
                        ) : cell === false ? (
                          <X className="h-5 w-5 text-ink/40" strokeWidth={3} />
                        ) : cell === "—" ? (
                          <Minus className="h-5 w-5 text-ink/30" />
                        ) : (
                          <span className="font-mono text-xs">{cell}</span>
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
          <p className="mt-4 font-mono text-xs text-ink/50">
            Want both? We print a QR code on the back of your card as a
            fallback, free.
          </p>
        </Reveal>
      </section>

      {/* ===== INDUSTRIES BENTO ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
            Built for places with counters
          </h2>
          <p className="mt-3 max-w-xl text-ink/70">
            Anywhere customers stand with a phone in hand, the card earns its
            keep.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((biz, i) => (
            <Reveal
              key={biz.name}
              delay={i * 0.05}
              className={biz.big ? "sm:col-span-2 sm:row-span-2" : ""}
            >
              <div
                className={`box group relative overflow-hidden ${biz.big ? "h-full min-h-[16rem] sm:min-h-[33rem]" : "h-64"}`}
              >
                <Image
                  src={biz.img}
                  alt={biz.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block border-2 border-ink bg-white px-2 py-1 font-display text-sm uppercase text-ink">
                    {biz.name}
                  </span>
                  <p className="mt-2 inline-block w-fit border-2 border-ink bg-yolk px-2 py-1 text-xs font-bold text-ink">
                    {biz.line}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.25}>
            <Link
              href="/contact"
              className="box box-hover flex h-64 flex-col items-start justify-between bg-sky p-6"
            >
              <span className="font-display text-xl uppercase text-ink">
                Your business
              </span>
              <p className="text-sm font-medium text-ink/80">
                Trades, gyms, dentists, real estate. If your customers can hold
                a phone, this works.
              </p>
              <span className="border-b-2 border-ink font-bold text-ink">
                Talk to us →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== CUSTOM DESIGN ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="box grid items-stretch overflow-hidden bg-ink lg:grid-cols-2">
            <div className="p-8 text-white sm:p-12">
              <p className="tag text-yolk">Custom design</p>
              <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-4xl">
                Your logo on the card
              </h2>
              <p className="mt-4 max-w-md text-white/80">
                Upload your artwork, or give us your business name and colors
                and we design it for you. You get a digital proof within 48
                hours. Nothing prints until you approve it.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/products">Start customizing</ButtonLink>
                <ButtonLink
                  href="/contact"
                  variant="secondary"
                  className="border-white bg-transparent text-white shadow-none hover:bg-white/10"
                >
                  Bulk orders
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px border-t-2 border-ink bg-ink lg:border-l-2 lg:border-t-0">
              {[
                { icon: BadgeCheck, title: "Proof first", desc: "You approve the design before we print.", bg: "bg-yolk" },
                { icon: RefreshCw, title: "Reprogram", desc: "New link, same card, any time.", bg: "bg-white" },
                { icon: ShieldCheck, title: "Replace free", desc: "If a card stops scanning, we send a new one.", bg: "bg-bubble" },
                { icon: Layers, title: "Bulk pricing", desc: "Up to 20% off on packs of 10.", bg: "bg-mint" },
              ].map((p) => (
                <div key={p.title} className={`${p.bg} p-6`}>
                  <p.icon className="h-6 w-6 text-ink" />
                  <h4 className="mt-3 font-display text-sm uppercase text-ink">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-xs font-medium text-ink/80">
                    {p.desc}
                  </p>
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
          <div className="box flex flex-col items-start gap-6 bg-yolk p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-2xl uppercase leading-tight text-ink sm:text-3xl">
                {site.guaranteeDays} days. Full refund.
              </h2>
              <p className="mt-2 max-w-xl font-medium text-ink/80">
                If the card doesn&apos;t earn its spot on your counter, send it
                back. If it ever stops scanning, we replace it free.
              </p>
            </div>
            <ButtonLink href="/products" size="lg" variant="secondary">
              Pick your card <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
            Questions everyone asks
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="box group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-ink">
                  {f.q}
                  <span className="ml-4 font-mono text-xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t-2 border-ink pt-3 text-sm leading-relaxed text-ink/70">
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
          <div className="box bg-ink p-10 text-center sm:p-16">
            <h2 className="mx-auto max-w-3xl font-display text-3xl uppercase leading-tight text-white sm:text-5xl">
              Put a card on your counter
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
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
