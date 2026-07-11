import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Products",
  description:
    "NFC review cards, tags, stickers, and stands for Google reviews, social media, menus, WiFi, and more.",
};

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="max-w-2xl">
          <p className="eyebrow">The lineup</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            Pick the card for your counter
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Every product is $34.99 with a clean standard design, or $42.99
            with your own branding. Programmed to your link before it ships.
          </p>
        </div>
      </Reveal>

      <div className="mt-10">
        <ProductGrid />
      </div>
    </section>
  );
}
