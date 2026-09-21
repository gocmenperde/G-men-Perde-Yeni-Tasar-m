"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload, Search, Package, Check, Loader2,
  AlertCircle, Info, X
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

interface TrendyolItem { id: number; name: string; }

function getMarkup(p: number) { return p <= 100 ? 2.5 : 2.0; }
function markedPrice(p: number) {
  return (Math.ceil(p * getMarkup(p) * 100) / 100).toFixed(2);
}

function SearchDropdown({
  label,
  placeholder,
  fetchUrl,
  selected,
  onSelect,
  onClear,
  minChars = 2,
}: {
  label: string;
  placeholder: string;
  fetchUrl: (q: string) => string;
  selected: TrendyolItem | null;
  onSelect: (item: TrendyolItem) => void;
  onClear: () => void;
  minChars?: number;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrendyolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [apiMsg, setApiMsg] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualId, setManualId] = useState("");
  const [manualName, setManualName] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      setApiMsg("");
      if (timer.current) clearTimeout(timer.current);
      if (q.length < minChars) { setResults([]); setOpen(false); return; }
      timer.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(fetchUrl(q));
          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error ?? "Arama başarısız");
          } else if (Array.isArray(data)) {
            setResults(data);
            setOpen(true);
          } else if (data.apiError) {
            // Trendyol API hatası — kullanıcıya göster
            setResults([]);
            setApiMsg(data.apiError);
            setOpen(true);
          }
        } catch { toast.error("Bağlantı hatası"); }
        finally { setLoading(false); }
      }, 400);
    },
    [fetchUrl, minChars]
  );

  const pick = (item: TrendyolItem) => {
    onSelect(item);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const confirmManual = () => {
    const id = parseInt(manualId);
    if (!id || !manualName.trim()) { toast.error("ID ve isim zorunludur"); return; }
    onSelect({ id, name: manualName.trim() });
    setManualMode(false);
    setManualId("");
    setManualName("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label} *
        </label>
        {!selected && (
          <button
            onClick={() => setManualMode((m) => !m)}
            className="text-xs text-zinc-500 hover:text-orange-400 transition-colors underline underline-offset-2"
          >
            {manualMode ? "Aramaya dön" : "Manuel gir"}
          </button>
        )}
      </div>
      {selected ? (
        <div className="flex items-center gap-2 bg-orange-950/40 border border-orange-700/50 rounded-xl px-3 py-2">
          <span className="text-orange-300 text-sm font-medium flex-1">{selected.name}</span>
          <span className="text-zinc-500 text-xs">ID: {selected.id}</span>
          <button onClick={onClear} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : manualMode ? (
        <div className="flex flex-col gap-2">
          <input
            type="number"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Trendyol ID (örn: 385)"
            className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Görünen isim (örn: Kalem)"
            className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={confirmManual}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold py-2 rounded-xl transition-colors"
          >
            Onayla
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-xl pl-9 pr-9 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />}
          </div>
          {open && results.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-zinc-800 border border-zinc-600 rounded-xl shadow-xl max-h-52 overflow-y-auto">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => pick(item)}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center justify-between gap-2"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-zinc-500 text-xs flex-shrink-0">#{item.id}</span>
                </button>
              ))}
            </div>
          )}
          {open && results.length === 0 && !loading && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-zinc-800 border border-zinc-600 rounded-xl p-3 space-y-1.5">
              {apiMsg
                ? <p className="text-red-400 text-xs leading-snug">{apiMsg}</p>
                : <p className="text-zinc-400 text-sm text-center">Sonuç bulunamadı</p>
              }
              <p className="text-zinc-500 text-xs text-center">→ "Manuel gir" seçeneğini kullanın</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrendyolExportClient() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TrendyolItem | null>(null);
  const [brand, setBrand] = useState<TrendyolItem | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((p) => [msg, ...p.slice(0, 49)]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setProducts([]);
    setSelected(new Set());
    try {
      const params = new URLSearchParams({ take: "200", excludeBkm: "true", _t: String(Date.now()) });
      if (search) params.set("q", search);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Ürünler alınamadı"); return; }
      const list: StoreProduct[] = data.data ?? data.products ?? [];
      setProducts(list);
      if (!list.length) toast.error("Ürün bulunamadı");
      else addLog(`✓ ${list.length} ürün yüklendi`);
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

  const exportSelected = async () => {
    if (!selected.size)   { toast.error("Hiç ürün seçmediniz"); return; }
    if (!category)        { toast.error("Trendyol kategorisi seçin"); return; }
    if (!brand)           { toast.error("Trendyol markası seçin"); return; }

    setExporting(true);
    try {
      const res = await fetch("/api/admin/trendyol-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: [...selected],
          categoryId: category.id,
          brandId: brand.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gönderim başarısız");
        addLog(`✗ Hata: ${data.error ?? "Bilinmeyen"}`);
        if (data.detail) addLog(`  Detay: ${JSON.stringify(data.detail).slice(0, 120)}`);
        return;
      }
      toast.success(data.message ?? `${selected.size} ürün gönderildi`);
      addLog(`✓ Gönderildi — BatchID: ${data.batchRequestId ?? "-"}`);
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
        <p className="text-sm text-blue-200/70">
          <span className="font-semibold text-blue-300">100 TL ve altı ürünler 2.5 kat, üstü 2 kat fiyatla</span> Trendyol&apos;a gönderilir (komisyon + kargo bedeli).
        </p>
      </div>

      {/* Kategori & Marka arama */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SearchDropdown
          label="Trendyol Kategorisi"
          placeholder="Kategori ara... (örn: Kalem)"
          fetchUrl={(q) => `/api/admin/trendyol-categories?q=${encodeURIComponent(q)}`}
          selected={category}
          onSelect={setCategory}
          onClear={() => setCategory(null)}
          minChars={2}
        />
        <SearchDropdown
          label="Trendyol Markası"
          placeholder="Marka ara... (örn: Faber)"
          fetchUrl={(q) => `/api/admin/trendyol-brands?q=${encodeURIComponent(q)}`}
          selected={brand}
          onSelect={setBrand}
          onClear={() => setBrand(null)}
          minChars={2}
        />
      </div>

      {/* Ürün arama & listeleme */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              placeholder="Ürün ara..."
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
                <button onClick={clearAll}  className="text-xs text-zinc-400  hover:text-zinc-300  transition-colors">Temizle</button>
              </div>
            </div>

            <div className="divide-y divide-zinc-700/50 max-h-[480px] overflow-y-auto -mx-5 px-5">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`flex items-center gap-4 py-3 cursor-pointer transition-colors ${selected.has(p.id) ? "bg-orange-950/20 -mx-5 px-5" : "hover:bg-zinc-750"}`}
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
                    <p className="text-zinc-500 text-xs">Trendyol fiyatı</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Gönder butonu */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
          <p className="text-white text-sm">
            <span className="font-bold text-orange-400">{selected.size} ürün</span> Trendyol&apos;a gönderilecek
          </p>
          <button
            onClick={exportSelected}
            disabled={exporting || !category || !brand}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {exporting ? "Gönderiliyor..." : "Trendyol'a Gönder"}
          </button>
        </div>
      )}

      {/* İşlem günlüğü */}
      {log.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
          <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">İşlem Günlüğü</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {log.map((l, i) => (
              <p key={i} className="text-xs font-mono text-zinc-300">{l}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
