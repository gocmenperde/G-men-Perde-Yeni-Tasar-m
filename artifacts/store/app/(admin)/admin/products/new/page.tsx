import { db } from "@/lib/db";
import ProductFormClient from "@/components/admin/product-form-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Yeni Ürün" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <ProductFormClient categories={categories} brands={brands} />;
}
