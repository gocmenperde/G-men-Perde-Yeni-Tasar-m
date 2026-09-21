import { fallbackBrands } from "@/lib/mock-data";
import { db } from "@/lib/db";
import AdminBrandsClient from "@/components/admin/brands-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Markalar" };

export default async function AdminBrandsPage() {
  let brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  if (brands.length === 0) {
    await db.brand.createMany({
      data: fallbackBrands.map((b) => ({ name: b.name, slug: b.slug })),
      skipDuplicates: true,
    });
  }
  brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return <AdminBrandsClient brands={brands} />;
}
