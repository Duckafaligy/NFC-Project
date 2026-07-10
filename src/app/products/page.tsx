import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse premium NFC cards, tags, stickers, and stands for reviews, social media, menus, WiFi, and more.",
};

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            The <span className="text-gradient">product</span> lineup
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Premium NFC cards, tags, and stands — each one customizable with
            your brand. Choose a use case below.
          </p>
        </div>
      </Reveal>

      <div className="mt-10">
        <ProductGrid />
      </div>
    </section>
  );
}
