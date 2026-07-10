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
              "rounded-md px-4 py-2 text-sm font-semibold transition-all",
              filter === f
                ? "bg-neutral-900 text-white shadow-soft"
                : "border border-neutral-200 bg-white text-neutral-600 shadow-soft hover:border-neutral-300 hover:text-neutral-900",
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
        <p className="mt-12 text-center text-neutral-500">
          No products in this category yet.
        </p>
      )}
    </>
  );
}
