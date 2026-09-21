"use client";

import { useState, useCallback } from "react";
import { Download, RefreshCw, Package, ExternalLink, Check, AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

interface TrendyolProduct {
  name: string;
  brand: string;
  categoryName: string;
  price: number;
  comparePrice: number | null;
  image: string;
  url: string;
  trendyolId: string;
  slug: string;
}

export default function TrendyolClient() {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<TrendyolProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((p) => [msg, ...p.slice(0, 29)]);

  const fetchProducts = useCallback(async (p: number) => {
    setLoading(true);
    setProducts([]);
    setSelected(new Set());
    try {
      const res = await fetch(`/api/admin/trendyol?page=${p}`);
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Trendyol'dan ürün alınamadı"); return; }
      if (!data.products?.length) { toast.error("Bu sayfada ürün bulunamadı"); return; }
      setProducts(data.products);
      setTotal(data.total ?? 0);
      setPage(p);
      addLog(`✓ Sayfa ${p}: ${data.products.length} ürün alındı`);
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSelect = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(products.map((p) => p.slug)));
  const clearAll = () => setSelected(new Set());

  const importSelected = async () => {
    const toImport = products.filter((p) => selected.has(p.slug));
    if (!toImport.length) { toast.error("Hiç ürün seçmediniz"); return; }
    setImporting(true);
    try {
      const res = await fetch("/api/admin/trendyol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: toImport }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "İçe aktarma başarısız"); return; }
      toast.success(`✓ ${data.added} ürün eklendi, ${data.skipped} atlandı`);
      addLog(`✓ ${data.added} eklendi / ${data.skipped} zaten mevcut`);
      if (data.errors?.length) addLog(`⚠ ${data.errors.length} hata`);
      setSelected(new Set());
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-400" />
            Trendyol İçe Aktarma
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Trendyol mağazanızdaki ürünleri buraya aktarın.
          </p>
        </div>
        <a
          href="https://www.trendyol.com/magaza/gocmen-perde-kirtasiye-m-1249327"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Trendyol Mağazası
        </a>
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm">Sayfa:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => fetchProducts(n)}
                disabled={loading}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${page === n && products.length > 0 ? "bg-orange-500 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => fetchProducts(page)}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? "Yükleniyor..." : "Ürünleri Getir"}
        </button>
        {total > 0 && <span className="text-zinc-400 text-sm">Toplam ~{total} ürün</span>}
      </div>

      {products.length > 0 && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold">{products.length} ürün listelendi</span>
              <span className="text-zinc-400 text-sm">{selected.size} seçili</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Tümünü Seç</button>
              <span className="text-zinc-600">·</span>
              <button onClick={clearAll} className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">Temizle</button>
              <button
                onClick={importSelected}
                disabled={importing || selected.size === 0}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-60 ml-2"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {importing ? "Aktarılıyor..." : `${selected.size} Ürünü Aktar`}
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-700/50 max-h-[520px] overflow-y-auto">
            {products.map((p) => (
              <div
                key={p.slug}
                onClick={() => toggleSelect(p.slug)}
                className={`flex items-center gap-4 p-3 cursor-pointer transition-colors ${selected.has(p.slug) ? "bg-orange-950/30" : "hover:bg-zinc-750"}`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.has(p.slug) ? "bg-orange-500 border-orange-500" : "border-zinc-500"}`}>
                  {selected.has(p.slug) && <Check className="w-3 h-3 text-white" />}
                </div>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-zinc-700 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-zinc-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.brand && <span className="text-xs text-zinc-400">{p.brand}</span>}
                    {p.categoryName && <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{p.categoryName}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-orange-400 font-bold text-sm">₺{p.price?.toFixed(2)}</p>
                  {p.comparePrice && p.comparePrice > p.price && (
                    <p className="text-zinc-500 text-xs line-through">₺{p.comparePrice.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
          <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">İşlem Günlüğü</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {log.map((l, i) => (
              <p key={i} className="text-xs font-mono text-zinc-300">{l}</p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200/70 space-y-1">
          <p>Trendyol'dan çekilen ürünler taslak olarak eklenir. Fiyat ve stok bilgilerini kontrol etmeyi unutmayın.</p>
          <p>Aynı isimde ürün varsa atlanır (tekrar eklenmez).</p>
        </div>
      </div>
    </div>
  );
}
