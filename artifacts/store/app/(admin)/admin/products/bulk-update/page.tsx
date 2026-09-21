import type { Metadata } from "next";
import BulkProductUpdateClient from "@/components/admin/bulk-product-update-client";

export const metadata: Metadata = { title: "Admin — Toplu Ürün Güncellemesi" };

export default function BulkProductUpdatePage() {
  return <BulkProductUpdateClient />;
}