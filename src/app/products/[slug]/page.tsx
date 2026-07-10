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
      <nav className="flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/products" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-300">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Visual + copy */}
        <div>
          <Reveal>
            <div className="relative rounded-3xl border border-white/10 bg-ink-900/60 p-4 shadow-card">
              <div className="absolute -inset-4 rounded-[2rem] bg-radial-glow opacity-60 blur-2xl" />
              <ProductVisual
                name={product.name}
                accent={product.accent}
                featured
                className="relative aspect-[4/3.4]"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-300">
                {product.category}
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-white sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-lg text-brand-200">{product.tagline}</p>
              <p className="mt-4 text-slate-300">{product.description}</p>
            </div>
          </Reveal>

          {/* Features */}
          <Reveal delay={0.1}>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  {f}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Specs */}
          <Reveal delay={0.15}>
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-white">Specifications</h2>
              <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:grid-cols-4">
                {product.specs.map((s) => (
                  <div key={s.label} className="bg-ink-900 p-4">
                    <dt className="text-xs text-slate-400">{s.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
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
              <h2 className="text-sm font-semibold text-white">Perfect for</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.useCases.map((u) => (
                  <span
                    key={u}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
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

      {/* Related */}
      {suggestions.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold text-white">
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
