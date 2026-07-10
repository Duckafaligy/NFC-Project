"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { categories, products, type ProductCategory } from "@/lib/products";
import { cn } from "@/lib/utils";

type Filter = "All" | ProductCategory;

export function ProductGrid() {
  const [filter, setFilter] = useState<Filter>("All");
  const filtered =
    filter === "All" ? products : products.filter((p) => p.category === filter);

  const filters: Filter[] = ["All", ...categories];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "border-transparent bg-brand-gradient text-white shadow-glow"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-slate-400">
          No products in this category yet.
        </p>
      )}
    </>
  );
}
