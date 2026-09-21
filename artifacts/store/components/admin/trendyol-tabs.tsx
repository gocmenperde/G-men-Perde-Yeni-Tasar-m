"use client";

import { ShoppingBag, Upload, AlertTriangle } from "lucide-react";
import TrendyolExportClient from "./trendyol-export-client";

export default function TrendyolTabs() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-orange-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Trendyol</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Trendyol entegrasyonu — ürün gönderme</p>
        </div>
      </div>

      <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-xl border border-zinc-700 w-fit">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white shadow">
          <Upload className="w-4 h-4" />
          Trendyol&apos;a Gönder
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 cursor-not-allowed"
          title="Trendyol'dan içe aktarma sunucu IP engellemesi nedeniyle bu ortamda çalışmıyor"
        >
          <AlertTriangle className="w-4 h-4" />
          İçe Aktar (Devre Dışı)
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-800/40 rounded-xl px-4 py-3 text-sm text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Trendyol&apos;dan İçe Aktar</strong> özelliği Vercel sunucu IP&apos;leri
          Trendyol tarafından engellendiği için bu ortamda çalışmamaktadır.
          Ürünleri doğrudan Trendyol Satıcı Paneli&apos;nden veya{" "}
          <strong>Trendyol&apos;a Gönder</strong> sekmesi üzerinden yönetebilirsiniz.
        </p>
      </div>

      <TrendyolExportClient />
    </div>
  );
}
