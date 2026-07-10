import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="box box-hover group relative flex flex-col overflow-hidden"
    >
      {product.popular && (
        <span className="absolute left-3 top-3 z-10 border-2 border-ink bg-bubble px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-ink">
          Best seller
        </span>
      )}
      <div className="border-b-2 border-ink">
        <ProductVisual name={product.name} accent={product.accent} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="tag text-ink/50">{product.category}</p>
        <h3 className="mt-1 font-display text-lg uppercase leading-tight text-ink">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-sm text-ink/70">{product.summary}</p>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-lg font-bold text-ink">
            {formatPrice(product.basePrice)}
          </p>
          <span className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-white transition-colors group-hover:bg-yolk">
            <ArrowUpRight className="h-5 w-5 text-ink" />
          </span>
        </div>
      </div>
    </Link>
  );
}
