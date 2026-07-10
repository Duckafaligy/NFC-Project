import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { getAllSlugs, getProduct, products } from "@/lib/products";
import { ProductVisual } from "@/components/ProductVisual";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const fallback = products.filter((p) => p.id !== product.id).slice(0, 3);
  const suggestions = related.length ? related : fallback;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Visual + copy */}
        <div>
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-card">
              <ProductVisual
                name={product.name}
                accent={product.accent}
                featured
                className="aspect-[4/3.4] rounded-none"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {product.category}
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-lg font-medium text-slate-700">
                {product.tagline}
              </p>
              <p className="mt-4 text-slate-600">{product.description}</p>
            </div>
          </Reveal>

          {/* Features */}
          <Reveal delay={0.1}>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  {f}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Specs */}
          <Reveal delay={0.15}>
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-slate-900">
                Specifications
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
                {product.specs.map((s) => (
                  <div key={s.label} className="bg-white p-4">
                    <dt className="text-xs text-slate-500">{s.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* Use cases */}
          <Reveal delay={0.2}>
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Perfect for
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.useCases.map((u) => (
                  <span
                    key={u}
                    className="rounded-full border border-slate-200 bg-paper px-3 py-1 text-xs text-slate-600"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Configurator (sticky on desktop) */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <ProductConfigurator product={product} />
        </div>
      </div>

      {/* After you order */}
      <div className="mt-20 rounded-3xl border border-slate-200 bg-paper p-8 sm:p-10">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          What happens after you order
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "Within 48 hours",
              title: "We program (and design)",
              desc: "Standard orders are programmed to your link right away. Custom orders get a digital proof by email — nothing prints until you approve it.",
            },
            {
              step: "1–2 business days",
              title: "It ships",
              desc: "Your card leaves our hands programmed, tested, and ready. Tracking lands in your inbox.",
            },
            {
              step: "Day one at the counter",
              title: "You start asking",
              desc: "Put it by the register and use one line: “Would you mind leaving us a quick review? Just tap your phone here.” That's it.",
            },
          ].map((s) => (
            <div key={s.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {s.step}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {suggestions.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            You might also like
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
