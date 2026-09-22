import { db } from "@/lib/db";
import AdminBrandsClient from "@/components/admin/brands-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Markalar" };

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return <AdminBrandsClient brands={brands} />;
}
