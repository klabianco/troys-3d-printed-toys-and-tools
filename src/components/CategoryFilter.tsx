"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import ProductGrid from "./ProductGrid";

export default function CategoryFilter({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? products.filter((p) => p.category === active)
    : products;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActive(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            active === null
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <ProductGrid products={filtered} />
    </div>
  );
}
