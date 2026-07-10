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
          <p className="tag text-ink/50">The lineup</p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">
            Pick the card for your counter
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            Every product ships programmed to your link and can carry your own
            design. Pack discounts apply automatically from 3 units up.
          </p>
        </div>
      </Reveal>

      <div className="mt-10">
        <ProductGrid />
      </div>
    </section>
  );
}
