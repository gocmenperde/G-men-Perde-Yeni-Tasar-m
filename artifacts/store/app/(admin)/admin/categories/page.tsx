import { db } from "@/lib/db";
import AdminCategoriesClient from "@/components/admin/categories-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Kategoriler" };

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return <AdminCategoriesClient categories={categories} />;
}
