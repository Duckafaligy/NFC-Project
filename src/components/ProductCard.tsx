import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { unitPriceFor, preorderActive } from "@/lib/pricing";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card card-hover group relative flex flex-col overflow-hidden"
    >
      {product.popular && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
          Best seller
        </span>
      )}
      <div className="p-3 pb-0">
        <ProductVisual name={product.name} accent={product.accent} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{product.category}</p>
        <h3 className="mt-1 font-display text-lg font-bold text-neutral-900">
          {product.name}
        </h3>
        <p className="mt-1.5 flex-1 text-sm text-neutral-500">
          {product.summary}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {preorderActive() ? (
              <div className="flex items-baseline gap-1.5">
                <p className="font-display text-xl font-extrabold text-neutral-900">
                  {formatPrice(unitPriceFor(product.basePrice))}
                </p>
                <p className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.basePrice)}
                </p>
              </div>
            ) : (
              <p className="font-display text-xl font-extrabold text-neutral-900">
                {formatPrice(product.basePrice)}
              </p>
            )}
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
