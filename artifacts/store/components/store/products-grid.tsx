"use client";

import { useState, Suspense } from "react";
import ProductCard from "@/components/store/product-card";
import ProductsToolbar from "@/components/store/products-toolbar";

interface Props {
  products: any[];
  total: number;
  categories: any[];
  brands: any[];
}

export default function ProductsGrid({ products, total, categories, brands }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <>
      <Suspense>
        <ProductsToolbar
          total={total}
          categories={categories}
          brands={brands}
          view={view}
          onViewChange={setView}
        />
      </Suspense>

      {products.length > 0 && (
        view === "grid" ? (
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} listView />
            ))}
          </div>
        )
      )}
    </>
  );
}
