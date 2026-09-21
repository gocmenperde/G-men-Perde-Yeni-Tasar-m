import { db } from "@/lib/db";
import BulkEditClient from "@/components/admin/bulk-edit-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Toplu Düzenleme" };

export default async function BulkEditPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BulkEditClient categories={categories} brands={brands} />
    </div>
  );
}
