import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Wifi,
  Star,
  QrCode,
  Globe,
  Sparkles,
  Zap,
  ShieldCheck,
  Palette,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { ProductVisual } from "@/components/ProductVisual";
import { Reveal } from "@/components/Reveal";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

const useCases = [
  {
    icon: Star,
    title: "Google Reviews",
    desc: "One tap sends customers to your review page. Grow your rating and rank higher.",
    color: "#f59e0b",
  },
  {
    icon: Instagram,
    title: "Social Media",
    desc: "Turn a tap into a follow on Instagram, TikTok, and Facebook.",
    color: "#ec4899",
  },
  {
    icon: Wifi,
    title: "Guest WiFi",
    desc: "Guests join your network instantly — no passwords to type.",
    color: "#22d3ee",
  },
  {
    icon: QrCode,
    title: "Digital Menu",
    desc: "Open your menu with a tap. Update items and prices any time.",
    color: "#10b981",
  },
  {
    icon: Globe,
    title: "Website & Links",
    desc: "Send people straight to your site, booking page, or link hub.",
    color: "#6d5efc",
  },
  {
    icon: Facebook,
    title: "Everything at once",
    desc: "Bundle it all into one branded hub with the All-in-One card.",
    color: "#3b82f6",
  },
];

const steps = [
  {
    n: "01",
    title: "Choose your card",
    desc: "Pick the product that fits your goal — reviews, socials, menu, WiFi, or all of it.",
  },
  {
    n: "02",
    title: "Standard or custom",
    desc: "Go with a clean standard design, upload your own artwork, or have us design it for you.",
  },
  {
    n: "03",
    title: "We program & ship",
    desc: "Your card arrives pre-programmed and ready. Just tap a phone and it works.",
  },
];

const perks = [
  { icon: Zap, title: "No app required", desc: "Works out of the box on modern phones." },
  { icon: ShieldCheck, title: "Reprogrammable", desc: "Change your link any time — the card stays." },
  { icon: Palette, title: "Fully custom", desc: "Your logo, your colors, your brand." },
  { icon: Sparkles, title: "Premium build", desc: "Durable, waterproof, and built to last." },
];

export default function HomePage() {
  const featured = products.filter((p) => p.popular).slice(0, 4);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-30" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
                <span className="flex h-1.5 w-1.5 rounded-full bg-cyanx-400" />
                Smart NFC products for real businesses
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                One tap.
                <br />
                <span className="text-gradient">Endless connections.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-lg text-slate-300">
                {site.name} turns a single tap into more Google reviews, more
                followers, instant WiFi, digital menus, and every link your
                business needs — on a premium card built to impress.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/products" size="lg">
                  Shop products <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink href="/how-it-works" size="lg" variant="secondary">
                  How it works
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  Loved by local businesses
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-radial-glow blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-ink-900/60 p-4 shadow-card backdrop-blur">
              <ProductVisual
                name="All-in-One Card"
                accent={["#6d5efc", "#22d3ee"]}
                featured
                className="aspect-[4/3.2]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== USE CASES ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              One card, every outcome
            </h2>
            <p className="mt-3 text-slate-400">
              Point your tap at whatever moves the needle for your business.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u, i) => (
            <Reveal key={u.title} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-white/10 bg-ink-900 p-6 transition-colors hover:border-white/20">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${u.color}1f`, color: u.color }}
                >
                  <u.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">
                  {u.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">{u.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Best sellers
              </h2>
              <p className="mt-3 text-slate-400">
                The cards businesses reach for most.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
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

      {/* ===== HOW IT WORKS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Live in three steps
            </h2>
            <p className="mt-3 text-slate-400">
              From order to first tap — we handle the technical part.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-ink-900 p-7">
                <span className="font-display text-5xl font-extrabold text-white/10">
                  {s.n}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== CUSTOM DESIGN BANNER ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900 p-8 sm:p-12">
            <div className="absolute inset-0 bg-radial-glow opacity-60" />
            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
                  <Palette className="h-3.5 w-3.5" /> Custom design
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
                  Your brand, on every tap
                </h2>
                <p className="mt-3 max-w-md text-slate-300">
                  Upload your own artwork, or let our design team create
                  something on-brand for you. Every product can be fully
                  customized with your logo, colors, and message.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href="/products">Start customizing</ButtonLink>
                  <ButtonLink href="/contact" variant="secondary">
                    Talk to our designers
                  </ButtonLink>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {perks.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <p.icon className="h-6 w-6 text-brand-300" />
                    <h4 className="mt-3 font-semibold text-white">{p.title}</h4>
                    <p className="mt-1 text-xs text-slate-400">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-gradient p-10 text-center sm:p-16">
            <div className="absolute inset-0 grid-texture opacity-20" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl">
                Ready to turn taps into growth?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">
                Get a premium NFC card built for your business — programmed,
                branded, and ready to go.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <ButtonLink
                  href="/products"
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-white text-ink-900 hover:bg-white/90"
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
