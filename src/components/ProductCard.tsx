import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      {product.popular && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Popular
        </span>
      )}
      <ProductVisual name={product.name} accent={product.accent} />

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-slate-900">
          {product.name}
        </h3>
        <p className="mt-1.5 flex-1 text-sm text-slate-500">{product.summary}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">from</span>
            <p className="font-display text-xl font-bold text-slate-900">
              {formatPrice(product.basePrice)}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
