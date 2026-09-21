import { db } from "@/lib/db";
import BulkDiscountClient from "@/components/admin/bulk-discount-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Toplu İndirim" };

export default async function BulkDiscountPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <BulkDiscountClient categories={categories} brands={brands} />;
}
