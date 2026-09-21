"use client";

import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Check, ArrowLeft,
  Loader2, X, ImageOff, SkipForward, Search, Plus, Star, Copy,
} from "lucide-react";
import toast from "react-hot-toast";

const DONE_KEY = "bulk-edit-done-v1";
const LIMIT    = 24;

function getDoneIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]")); }
  catch { return new Set(); }
}
function markDone(id: string) {
  try { const s = getDoneIds(); s.add(id); localStorage.setItem(DONE_KEY, JSON.stringify([...s])); } catch {}
}
function clearDone() { try { localStorage.removeItem(DONE_KEY); } catch {} }

interface Product {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  sku: string | null;
  barcode: string | null;
  isActive: boolean;
  category: { id: string; name: string } | null;
  brand:    { id: string; name: string } | null;
}

interface CardEdit {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  barcode: string;
  images: string[]; // images[0] = vitrin
}

interface Props {
  categories: { id: string; name: string }[];
  brands:     { id: string; name: string }[];
}

export default function BulkEditClient({ categories, brands }: Props) {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [doneCount, setDoneCount]   = useState(0);
  const [filter, setFilter]         = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId]       = useState("");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [edits, setEdits]       = useState<Record<string, CardEdit>>({});
  const [saving, setSaving]     = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [hidden, setHidden]     = useState<Set<string>>(new Set());
  const prevQueryRef = useRef("");

  /* ─── fetch ─── */
  const fetchProducts = useCallback(async (pg: number, f: string, cat: string, br: string, s: string) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ page: String(pg), limit: String(LIMIT), filter: f });
      if (cat) sp.set("categoryId", cat);
      if (br)  sp.set("brandId", br);
      if (s)   sp.set("search", s);
      const res = await fetch(`/api/admin/bulk-edit?${sp}`);
      if (!res.ok) { toast.error("Ürünler alınamadı."); return; }
      const data = await res.json();
      const done = getDoneIds();
      setDoneCount(done.size);
      const visible = (data.products as Product[]).filter(p => !done.has(p.id));
      setProducts(visible);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      const init: Record<string, CardEdit> = {};
      for (const p of data.products as Product[]) {
        init[p.id] = {
          name: p.name,
          description: p.description ?? "",
          price: String(p.price),
          comparePrice: p.comparePrice == null ? "" : String(p.comparePrice),
          barcode: p.barcode ?? "",
          images: p.images ?? [],
        };
      }
      setEdits(init);
      setHidden(new Set());
    } catch { toast.error("Bağlantı hatası."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const query = `${page}-${filter}-${categoryId}-${brandId}-${search}`;
    if (query === prevQueryRef.current) return;
    prevQueryRef.current = query;
    fetchProducts(page, filter, categoryId, brandId, search);
  }, [page, filter, categoryId, brandId, search, fetchProducts]);

  useEffect(() => { setDoneCount(getDoneIds().size); }, []);

  /* ─── image helpers ─── */
  const setImages = (productId: string, imgs: string[]) =>
    setEdits(prev => ({ ...prev, [productId]: { ...prev[productId], images: imgs } }));

  const handleAddImages = async (productId: string, e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    setUploading(u => ({ ...u, [productId]: true }));
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Yüklenemedi."); continue; }
        urls.push(data.url);
      }
      if (urls.length) {
        setEdits(prev => {
          const cur = prev[productId]?.images ?? [];
          return { ...prev, [productId]: { ...prev[productId], images: [...cur, ...urls] } };
        });
        toast.success(`${urls.length} görsel yüklendi.`);
      }
    } catch { toast.error("Yükleme hatası."); }
    finally { setUploading(u => ({ ...u, [productId]: false })); }
  };

  const handleSetPrimary = (productId: string, idx: number) => {
    const imgs = [...(edits[productId]?.images ?? [])];
    if (idx === 0 || !imgs[idx]) return;
    const [picked] = imgs.splice(idx, 1);
    imgs.unshift(picked);
    setImages(productId, imgs);
    toast.success("Vitrin görseli değiştirildi.");
  };

  const handleRemoveImage = (productId: string, idx: number) => {
    const imgs = [...(edits[productId]?.images ?? [])];
    imgs.splice(idx, 1);
    setImages(productId, imgs);
  };

  const handleCopyBarcode = async (barcode: string) => {
    if (!barcode) {
      toast.error("Kopyalanacak barkod yok.");
      return;
    }
    try {
      await navigator.clipboard.writeText(barcode);
      toast.success("Barkod kopyalandı.");
    } catch {
      toast.error("Barkod kopyalanamadı.");
    }
  };

  /* ─── save ─── */
  const handleSave = async (product: Product) => {
    const edit = edits[product.id];
    if (!edit) return;
    const name = edit.name.trim();
    const price = parseFloat(edit.price.replace(",", "."));
    const comparePrice = edit.comparePrice.trim() === "" ? null : parseFloat(edit.comparePrice.replace(",", "."));
    if (!name) { toast.error("Ürün adı boş bırakılamaz."); return; }
    if (isNaN(price) || price <= 0) { toast.error("Geçerli bir fiyat girin."); return; }
    if (comparePrice !== null && (isNaN(comparePrice) || comparePrice <= price)) {
      toast.error("Üst fiyat, satış fiyatından büyük olmalı."); return;
    }
    setSaving(s => ({ ...s, [product.id]: true }));
    try {
      const body: Record<string, unknown> = {
        name,
        description: edit.description.trim() || null,
        price,
        comparePrice,
        barcode: edit.barcode === "" ? null : edit.barcode,
        images: edit.images,
      };
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      markDone(product.id);
      setDoneCount(getDoneIds().size);
      setHidden(h => new Set([...h, product.id]));
      toast.success("Kaydedildi.");
    } catch { toast.error("Kaydedilemedi."); }
    finally { setSaving(s => ({ ...s, [product.id]: false })); }
  };

  const handleSkip = (id: string) => setHidden(h => new Set([...h, id]));

  const visibleProducts = products.filter(p => !hidden.has(p.id));
  const remaining = total - doneCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Toplu Düzenleme</h1>
            <p className="text-zinc-400 text-sm mt-0.5">
                Ad, açıklama, fiyat, barkod ve görselleri tek ekrandan düzenle · kaydedilen tekrar çıkmaz
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-zinc-800 rounded-xl px-4 py-2.5 text-sm">
            <span className="text-green-400 font-bold">{doneCount.toLocaleString("tr-TR")}</span>
            <span className="text-zinc-400"> tamamlandı</span>
            {remaining > 0 && (
              <>
                <span className="text-zinc-600 mx-1.5">·</span>
                <span className="text-zinc-300 font-semibold">{remaining.toLocaleString("tr-TR")}</span>
                <span className="text-zinc-400"> kaldı</span>
              </>
            )}
          </div>
          {doneCount > 0 && (
            <button
              onClick={() => { clearDone(); setDoneCount(0); fetchProducts(page, filter, categoryId, brandId, search); }}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
              title="Tamamlananları sıfırla"
            >
              Sıfırla
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {[
          { key: "all",              label: "Tümü" },
           { key: "noimage_or_empty", label: "Resimsiz" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filter === f.key ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(1); }}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
        >
          <option value="">— Tüm Kategoriler —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={brandId}
          onChange={e => { setBrandId(e.target.value); setPage(1); }}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
        >
          <option value="">— Tüm Markalar —</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <form
          onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
          className="flex gap-1.5"
        >
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Ürün ara..."
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl px-3 py-2 text-xs w-40 focus:outline-none focus:border-amber-500 placeholder:text-zinc-600"
          />
          <button type="submit" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (doneCount / total) * 100)}%` }}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Yükleniyor...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && visibleProducts.length === 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 py-16 text-center">
          <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-zinc-300 font-semibold">Bu sayfadaki tüm ürünler düzenlendi!</p>
          {page < totalPages && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold rounded-xl transition-colors"
            >
              Sonraki Sayfa →
            </button>
          )}
        </div>
      )}

      {/* Product cards */}
      {!loading && visibleProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleProducts.map(product => {
            const edit     = edits[product.id] ?? {
              name: product.name,
              description: product.description ?? "",
              price: String(product.price),
              comparePrice: product.comparePrice == null ? "" : String(product.comparePrice),
              barcode: product.barcode ?? "",
              images: product.images ?? [],
            };
            const isSaving = saving[product.id] ?? false;
            const isUp     = uploading[product.id] ?? false;
            const imgs     = edit.images;
            const vitrin   = imgs[0];

            return (
              <div
                key={product.id}
                className="bg-[#211F1C] border border-[#3A3630] rounded-2xl overflow-hidden flex flex-col transition-all hover:border-[#66563C] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)]"
              >
                {/* Header */}
                <div className="flex gap-3 p-4 border-b border-zinc-800">
                  {/* Vitrin thumb */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                    {vitrin ? (
                      <img
                        src={vitrin}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-5 h-5 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-200 text-sm leading-snug line-clamp-2">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {product.category && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                          {product.category.name}
                        </span>
                      )}
                      {product.brand && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                          {product.brand.name}
                        </span>
                      )}
                      <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                        {imgs.length} görsel
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit fields */}
                <div className="p-4 space-y-4 flex-1">
                  {/* Price */}
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Ürün adı</label>
                    <input
                      type="text"
                      value={edit.name}
                      onChange={e => setEdits(prev => ({ ...prev, [product.id]: { ...prev[product.id], name: e.target.value } }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 mt-3 block">Açıklama</label>
                    <textarea
                      value={edit.description}
                      rows={3}
                      onChange={e => setEdits(prev => ({ ...prev, [product.id]: { ...prev[product.id], description: e.target.value } }))}
                      placeholder="Ürün açıklaması..."
                      className="w-full resize-y bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Satış fiyatı (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={edit.price}
                      onChange={e => setEdits(prev => ({ ...prev, [product.id]: { ...prev[product.id], price: e.target.value } }))}
                      className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Üst fiyat (₺)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={edit.comparePrice}
                          onChange={e => setEdits(prev => ({ ...prev, [product.id]: { ...prev[product.id], comparePrice: e.target.value } }))}
                          placeholder="İndirimsiz fiyat"
                          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor={`barcode-${product.id}`} className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block">
                          Barkod
                        </label>
                        {edit.barcode && (
                          <button
                            type="button"
                            onClick={() => handleCopyBarcode(edit.barcode)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-amber-300 transition-colors"
                            title="Barkodu kopyala"
                          >
                            <Copy className="w-3 h-3" />
                            Kopyala
                          </button>
                        )}
                      </div>
                      <input
                        id={`barcode-${product.id}`}
                        type="text"
                        inputMode="numeric"
                        value={edit.barcode}
                        onChange={e => setEdits(prev => ({ ...prev, [product.id]: { ...prev[product.id], barcode: e.target.value } }))}
                        placeholder="Barkod girin veya boş bırakın"
                        className="w-full bg-[#171614] border border-amber-500/50 text-amber-50 rounded-xl px-3 py-2.5 text-sm font-mono tracking-[0.08em] focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 transition-colors placeholder:text-zinc-600 placeholder:font-sans placeholder:tracking-normal"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1.5">Değer olduğu gibi kaydedilir; boş bırakmak için alanı temizleyin.</p>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Görseller
                      </label>
                      <span className="text-[10px] text-zinc-600">
                         Vitrin için görsele tıkla · kaldır
                      </span>
                    </div>

                    {/* Thumbnail strip */}
                    <div className="flex flex-wrap gap-2">
                      {imgs.map((url, idx) => (
                        <div key={idx} className="relative group flex-shrink-0">
                          <div
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              idx === 0
                                ? "border-amber-500 ring-1 ring-amber-500/30"
                                : "border-zinc-700 hover:border-zinc-500"
                            }`}
                            onClick={() => handleSetPrimary(product.id, idx)}
                            title={idx === 0 ? "Vitrin görseli" : "Vitrine al"}
                          >
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={e => {
                                (e.target as HTMLImageElement).parentElement!.classList.add("bg-zinc-800");
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            {/* Vitrin badge */}
                            {idx === 0 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-zinc-900 text-[8px] font-black text-center py-0.5 flex items-center justify-center gap-0.5">
                                <Star className="w-2 h-2 fill-zinc-900" />
                                VİTRİN
                              </div>
                            )}
                            {/* Hover overlay for non-primary */}
                            {idx !== 0 && (
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                <Star className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveImage(product.id, idx)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Görseli kaldır"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add button */}
                      <label className={`w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                        isUp
                          ? "border-zinc-700 bg-zinc-800/50 cursor-not-allowed"
                          : "border-zinc-700 hover:border-amber-500 hover:bg-zinc-800/80 text-zinc-500 hover:text-amber-400"
                      }`} title="Görsel ekle">
                        {isUp
                          ? <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                          : <>
                              <Plus className="w-4 h-4" />
                              <span className="text-[9px] mt-0.5 font-semibold">Ekle</span>
                            </>
                        }
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={isUp}
                          onChange={e => handleAddImages(product.id, e)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => handleSave(product)}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {isSaving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                  <button
                    onClick={() => handleSkip(product.id)}
                    disabled={isSaving}
                    className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-400 hover:text-white rounded-xl text-sm transition-colors"
                    title="Şimdilik geç"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-zinc-400">
            Sayfa <span className="text-white font-semibold">{page}</span> / {totalPages}
            {" "}· Toplam <span className="text-white font-semibold">{total.toLocaleString("tr-TR")}</span> ürün
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page <= 1}
              className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              İlk
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}
              className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              Son
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
