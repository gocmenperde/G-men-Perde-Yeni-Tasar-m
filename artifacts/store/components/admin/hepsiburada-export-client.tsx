"use client";

import { useState, useCallback } from "react";
import {
  Download, Search, Package, Check, Loader2, Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  sku: string | null;
  brand: { name: string } | null;
  category: { name: string } | null;
}

function getMarkup(p: number) { return p <= 100 ? 2.5 : 2.0; }
function markedPrice(p: number) {
  return (Math.ceil(p * getMarkup(p) * 100) / 100).toFixed(2);
}

export default function HepsiburadaExportClient() {
  const [products, setProducts]   = useState<StoreProduct[]>([]);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [search, setSearch]       = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setProducts([]);
    setSelected(new Set());
    try {
      const params = new URLSearchParams({ take: "200", excludeBkm: "true", _t: String(Date.now()) });
      if (search) params.set("q", search);
      const res  = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Ürünler alınamadı"); return; }
      const list: StoreProduct[] = data.data ?? data.products ?? [];
      setProducts(list);
      if (!list.length) toast.error("Ürün bulunamadı");
      else toast.success(`${list.length} ürün yüklendi`);
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => setSelected(new Set(products.map((p) => p.id)));
  const clearAll  = () => setSelected(new Set());

  const downloadExcel = async () => {
    if (!selected.size) { toast.error("Hiç ürün seçmediniz"); return; }
    setExporting(true);
    try {
      const res = await fetch("/api/admin/hepsiburada-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: [...selected] }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Excel oluşturulamadı");
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `hepsiburada-urunler-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${selected.size} ürün Excel'e aktarıldı`);
      setSelected(new Set());
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bilgi kutusu */}
      <div className="bg-blue-950/30 border border-blue-800/30 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200/70 space-y-1">
          <p>
            <span className="font-semibold text-blue-300">100 TL ve altı ürünler 2.5 kat, üstü 2 kat fiyatla</span> Excel dosyasına aktarılır. BKM ürünleri dahil edilmez.
          </p>
          <p className="text-blue-300/60">
            İndirilen Excel dosyasını <span className="font-medium text-blue-300">Hepsiburada Satıcı Paneli → Ürün Yönetimi → Toplu Ürün Yükle</span> bölümünden yükleyin.
          </p>
        </div>
      </div>

      {/* Arama & listeleme */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              placeholder="Ürün ara... (boş bırakın = tümü)"
              className="w-full bg-zinc-700 border border-zinc-600 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Yükleniyor..." : "Ürünleri Listele"}
          </button>
        </div>

        {products.length > 0 && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">{products.length} ürün</span>
                <span className="text-zinc-400 text-sm">{selected.size} seçili</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={selectAll} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Tümünü Seç</button>
                <span className="text-zinc-600">·</span>
                <button onClick={clearAll}  className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">Temizle</button>
              </div>
            </div>

            <div className="divide-y divide-zinc-700/50 max-h-[480px] overflow-y-auto -mx-5 px-5">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`flex items-center gap-4 py-3 cursor-pointer transition-colors ${selected.has(p.id) ? "bg-orange-950/20 -mx-5 px-5" : "hover:bg-zinc-700/30"}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.has(p.id) ? "bg-orange-500 border-orange-500" : "border-zinc-500"}`}>
                    {selected.has(p.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-zinc-700 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.brand?.name    && <span className="text-xs text-zinc-400">{p.brand.name}</span>}
                      {p.category?.name && <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{p.category.name}</span>}
                      <span className="text-xs text-zinc-500">Stok: {p.stock}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-zinc-400 text-xs line-through">₺{Number(p.price).toFixed(2)}</p>
                    <p className="text-orange-400 font-bold text-sm">₺{markedPrice(p.price)}</p>
                    <p className="text-zinc-500 text-xs">Hepsiburada fiyatı</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* İndir butonu */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
          <div>
            <p className="text-white text-sm font-medium">
              <span className="text-orange-400 font-bold">{selected.size} ürün</span> Excel&apos;e aktarılacak
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">Hepsiburada Satıcı Paneli&apos;ne yüklenmeye hazır format</p>
          </div>
          <button
            onClick={downloadExcel}
            disabled={exporting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Hazırlanıyor..." : "Excel İndir (.xlsx)"}
          </button>
        </div>
      )}
    </div>
  );
}
