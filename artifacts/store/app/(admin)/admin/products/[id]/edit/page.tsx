import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/serialize";
import { notFound } from "next/navigation";
import ProductFormClient from "@/components/admin/product-form-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Ürün Düzenle" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [rawProduct, categories, brands] = await Promise.all([
    db.product.findUnique({ where: { id: params.id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!rawProduct) notFound();

  const product = serializeProduct(rawProduct);
  return <ProductFormClient product={product} categories={categories} brands={brands} />;
}
