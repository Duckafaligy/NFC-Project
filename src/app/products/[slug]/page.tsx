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
      <nav className="tag flex items-center gap-1.5 text-ink/50">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Visual + copy */}
        <div>
          <Reveal>
            <div className="box group overflow-hidden">
              <ProductVisual
                name={product.name}
                accent={product.accent}
                featured
                className="aspect-[4/3.2]"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-6">
              <p className="tag text-ink/50">{product.category}</p>
              <h1 className="mt-2 font-display text-3xl uppercase leading-tight text-ink sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-lg font-bold text-ink">
                {product.tagline}
              </p>
              <p className="mt-4 text-ink/80">{product.description}</p>
            </div>
          </Reveal>

          {/* Features */}
          <Reveal delay={0.1}>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2 text-sm font-medium text-ink/80"
                >
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center border-2 border-ink bg-mint">
                    <Check className="h-3 w-3 text-ink" strokeWidth={3.5} />
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Specs */}
          <Reveal delay={0.15}>
            <div className="mt-8">
              <h2 className="tag text-ink">Specifications</h2>
              <dl className="box mt-3 grid grid-cols-2 sm:grid-cols-4">
                {product.specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`p-4 ${i > 0 ? "border-l-2 border-ink max-sm:border-l-0 max-sm:[&:nth-child(even)]:border-l-2 max-sm:[&:nth-child(n+3)]:border-t-2" : ""}`}
                  >
                    <dt className="font-mono text-[11px] uppercase text-ink/50">
                      {s.label}
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-ink">
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
              <h2 className="tag text-ink">Perfect for</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.useCases.map((u) => (
                  <span
                    key={u}
                    className="border-2 border-ink bg-white px-3 py-1 text-xs font-bold text-ink"
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
      <div className="box mt-20 overflow-hidden">
        <h2 className="border-b-2 border-ink bg-yolk p-6 font-display text-2xl uppercase text-ink sm:px-8">
          What happens after you order
        </h2>
        <div className="grid md:grid-cols-3">
          {[
            {
              step: "Within 48 hours",
              title: "We program it",
              desc: "Standard orders get programmed to your link right away. Custom orders get a digital proof by email, and nothing prints until you approve it.",
            },
            {
              step: "1-2 business days",
              title: "It ships",
              desc: "Your card leaves programmed and tested. Tracking lands in your inbox.",
            },
            {
              step: "Day one",
              title: "You start asking",
              desc: "Put it by the register. One line does it: “Mind leaving us a quick review? Tap your phone here.”",
            },
          ].map((s, i) => (
            <div
              key={s.title}
              className={`p-6 sm:p-8 ${i > 0 ? "border-t-2 border-ink md:border-l-2 md:border-t-0" : ""}`}
            >
              <p className="tag text-ink/50">{s.step}</p>
              <h3 className="mt-2 font-display text-lg uppercase text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {suggestions.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl uppercase text-ink">
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
