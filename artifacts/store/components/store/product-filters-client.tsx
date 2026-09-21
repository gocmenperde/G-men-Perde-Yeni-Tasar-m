"use client";

import dynamic from "next/dynamic";

const ProductFilters = dynamic(
  () => import("@/components/store/product-filters"),
  { ssr: false },
);

export default ProductFilters;