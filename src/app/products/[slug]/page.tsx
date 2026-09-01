import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import {
  getAllSlugs,
  getProduct,
  products,
  configuredUnitPrice,
  withPriceOverride,
} from "@/lib/products";
import { effectivePrices, effectiveStock } from "@/lib/adminStore";
import { discountRate } from "@/lib/pricing";
import { site } from "@/lib/site";
import { ProductGallery, type GalleryImage } from "@/components/ProductGallery";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/**
 * Re-render periodically so the structured data below (price, availability)
 * cannot drift from what the dashboard is actually charging. Google treats a
 * price in structured data that disagrees with the page as an error.
 */
export const revalidate = 300;

/**
 * Every photo for a product's gallery: studio shots first (transparent,
 * true to print colour), then real photos of it in place. One list per
 * product, shown as a big frame with a thumbnail rail underneath.
 */
const GALLERY: Record<string, GalleryImage[]> = {
  "review-card": [
    {
      src: "/images/products/google-white.webp",
      alt: "Google Review Card — front, white face",
      w: 908,
      h: 1462,
    },
    {
      src: "/images/products/google-black.webp",
      alt: "Google Review Card — back, black face",
      w: 908,
      h: 1462,
    },
    {
      src: "/images/hero/lifestyle-google.webp",
      alt: "The white face of the Google review card on a counter",
      w: 1086,
      h: 814,
    },
    {
      src: "/images/hero/lifestyle-google-black.webp",
      alt: "The black face of the Google review card on a counter",
      w: 1086,
      h: 814,
    },
  ],
  "instagram-card": [
    {
      src: "/images/products/instagram.webp",
      alt: "Instagram Card",
      w: 908,
      h: 1462,
    },
    {
      src: "/images/hero/lifestyle-instagram.webp",
      alt: "The Instagram card on a counter",
      w: 1086,
      h: 814,
    },
  ],
};

/** Artwork per product, for link previews. */
const OG_IMAGE: Record<string, string> = {
  "review-card": "/images/products/google-white.webp",
  "instagram-card": "/images/products/instagram.webp",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  const image = OG_IMAGE[product.id];
  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${site.name}`,
      description: product.summary,
      type: "website",
      url: `/products/${product.slug}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
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

  // Structured data uses the same live numbers the storefront charges, so
  // Google never sees a price or stock state the page contradicts.
  const [prices, stock] = await Promise.all([
    effectivePrices(),
    effectiveStock(),
  ]);
  const priced = withPriceOverride(product, prices[product.id]);
  const listPrice = configuredUnitPrice(priced, "standard");
  const inStock = (stock[product.id] ?? 0) > 0;
  const image = OG_IMAGE[product.id];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    category: product.category,
    ...(image ? { image: [`${site.url}${image}`] } : {}),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: `${site.url}/products/${product.slug}`,
      priceCurrency: site.currency.code,
      price: listPrice.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-10 sm:px-6 lg:px-8 lg:pb-10">
      <script
        type="application/ld+json"
        // Values are our own catalog data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-neutral-400">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-neutral-700">{product.name}</span>
      </nav>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2">
        {/* Visual + copy */}
        <div>
          <Reveal>
            <ProductGallery
              images={GALLERY[product.id] ?? []}
              aspect={product.visual === "google" ? "aspect-[4/3.2]" : "aspect-[3/4]"}
            />
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-6">
              <p className="eyebrow">{product.category}</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-neutral-900 sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-lg font-semibold text-neutral-700">
                {product.tagline}
              </p>
              <p className="mt-4 text-neutral-600">{product.description}</p>
            </div>
          </Reveal>

          {/* Real example */}
          <Reveal delay={0.08}>
            <div className="mt-6 rounded-md border-l-4 border-neutral-900 bg-neutral-50 p-5">
              <p className="eyebrow">A real example</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {product.example}
              </p>
            </div>
          </Reveal>

          {/* Features */}
          <Reveal delay={0.1}>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2 text-sm text-neutral-600"
                >
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100">
                    <Check className="h-3 w-3 text-neutral-900" strokeWidth={3} />
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Specs */}
          <Reveal delay={0.15}>
            <div className="mt-8">
              <h2 className="text-sm font-bold text-neutral-900">
                Specifications
              </h2>
              <dl className="card mt-3 grid grid-cols-2 gap-px overflow-hidden bg-neutral-100 p-0 sm:grid-cols-4">
                {product.specs.map((s) => (
                  <div key={s.label} className="bg-white p-4">
                    <dt className="text-xs text-neutral-400">{s.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* What's in the box */}
          <Reveal delay={0.18}>
            <div className="mt-8">
              <h2 className="text-sm font-bold text-neutral-900">
                What&apos;s in the box
              </h2>
              <ul className="card mt-3 divide-y divide-neutral-100 p-0">
                {product.box.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 px-4 py-3 text-sm text-neutral-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-900" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Use cases */}
          <Reveal delay={0.2}>
            <div className="mt-6">
              <h2 className="text-sm font-bold text-neutral-900">Perfect for</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.useCases.map((u) => (
                  <span
                    key={u}
                    className="rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-600"
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
      <div className="card mt-20 p-8 sm:p-10">
        <p className="eyebrow">What happens next</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-neutral-900">
          After you order
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
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
          ].map((s) => (
            <div key={s.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {s.step}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold text-neutral-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {suggestions.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-extrabold text-neutral-900">
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
