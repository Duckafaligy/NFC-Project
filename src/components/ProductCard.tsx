import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-card"
    >
      {product.popular && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-gradient px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-glow">
          Popular
        </span>
      )}
      <ProductVisual name={product.name} accent={product.accent} />

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-300">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-white">
          {product.name}
        </h3>
        <p className="mt-1.5 flex-1 text-sm text-slate-400">{product.summary}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">from</span>
            <p className="font-display text-xl font-bold text-white">
              {formatPrice(product.basePrice)}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all group-hover:bg-brand-gradient group-hover:shadow-glow">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
