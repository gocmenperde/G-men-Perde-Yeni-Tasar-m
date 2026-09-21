import type { Metadata } from "next";
import HepsiburadaExportClient from "@/components/admin/hepsiburada-export-client";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Hepsiburada" };

export default async function HepsiburadaPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-orange-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Hepsiburada</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Hepsiburada entegrasyonu — ürün gönderme</p>
        </div>
      </div>
      <HepsiburadaExportClient />
    </div>
  );
}
