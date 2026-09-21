import { fallbackCategories } from "@/lib/mock-data";
import { db } from "@/lib/db";
import AdminCategoriesClient from "@/components/admin/categories-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Kategoriler" };

export default async function AdminCategoriesPage() {
  let categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  if (categories.length === 0) {
    await db.category.createMany({
      data: fallbackCategories.map((c) => ({ name: c.name, slug: c.slug })),
      skipDuplicates: true,
    });
  }
  categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return <AdminCategoriesClient categories={categories} />;
}
