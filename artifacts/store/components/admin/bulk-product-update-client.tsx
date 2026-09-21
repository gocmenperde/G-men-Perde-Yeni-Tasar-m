"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Camera, Check, ChevronLeft, ChevronRight,
  ImageOff, Loader2, Search, Upload, X,
} from "lucide-react";
import toast from "react-hot-toast";

const PAGE_SIZE = 50;

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  sku: string | null;
  barcode: string | null;
}

interface Draft {
  name: string;
  price: string;
  images: string[];
}

export default function BulkProductUpdateClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const fetchProducts = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        search: currentSearch,
      });
      const response = await fetch(`/api/admin/bulk-update?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Ürünler alınamadı.");

      const nextProducts = data.products as Product[];
      const nextDrafts: Record<string, Draft> = {};
      for (const product of nextProducts) {
        nextDrafts[product.id] = {
          name: product.name,
          price: String(product.price),
          images: product.images ?? [],
        };
      }
      setProducts(nextProducts);
      setDrafts(nextDrafts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ürünler alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts(page, search);
  }, [fetchProducts, page, search]);

  const updateDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  };

  const handleUpload = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setUploading((current) => ({ ...current, [id]: true }));
    try {
      const urls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Görsel yüklenemedi.");
        urls.push(data.url);
      }
      updateDraft(id, { images: [...(drafts[id]?.images ?? []), ...urls] });
      toast.success(`${urls.length} görsel yüklendi.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Görsel yüklenemedi.");
    } finally {
      setUploading((current) => ({ ...current, [id]: false }));
    }
  };

  const removeImage = (id: string, index: number) => {
    const images = [...(drafts[id]?.images ?? [])];
    images.splice(index, 1);
    updateDraft(id, { images });
  };

  const savePage = async () => {
    if (!products.length || saving) return;
    const updates = products.map((product) => ({
      id: product.id,
      name: drafts[product.id]?.name ?? product.name,
      price: drafts[product.id]?.price ?? String(product.price),
      images: drafts[product.id]?.images ?? product.images ?? [],
    }));

    for (const update of updates) {
      if (!update.name.trim()) {
        toast.error("Ürün adı boş bırakılamaz.");
        return;
      }
      const price = Number(String(update.price).replace(",", "."));
      if (!Number.isFinite(price) || price <= 0) {
        toast.error(`"${update.name}" için geçerli bir fiyat girin.`);
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/bulk-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Sayfa kaydedilemedi.");
      setProducts((current) => current.map((product) => {
        const update = updates.find((item) => item.id === product.id);
        return update
          ? { ...product, name: update.name.trim(), price: Number(update.price), images: update.images }
          : product;
      }));
      toast.success(`${data.saved} ürün kaydedildi.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sayfa kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl bg-zinc-800 p-2.5 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            aria-label="Ürünlere dön"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Ürünler</p>
            <h1 className="text-2xl font-black text-white">Toplu Ürün Güncellemesi</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Her sayfada 50 ürün. Adı, fiyatı ve görselleri düzenleyip sayfanın tamamını tek seferde kaydedin.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={savePage}
          disabled={saving || loading || !products.length}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {saving ? "Kaydediliyor..." : `Bu sayfayı kaydet (${products.length})`}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
        <form onSubmit={applySearch} className="flex w-full max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Ürün adı, barkod veya SKU ara"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
            />
          </div>
          <button type="submit" className="rounded-xl bg-zinc-800 px-4 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white">
            Ara
          </button>
        </form>
        <div className="text-sm text-zinc-400">
          Sayfa <strong className="text-white">{page}</strong> / {totalPages}
          <span className="mx-2 text-zinc-700">·</span>
          Toplam <strong className="text-white">{total.toLocaleString("tr-TR")}</strong> ürün
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          Ürünler yükleniyor...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center text-zinc-400">
          Aramanızla eşleşen ürün bulunamadı.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => {
            const draft = drafts[product.id] ?? { name: product.name, price: String(product.price), images: product.images ?? [] };
            const isUploading = uploading[product.id] ?? false;
            return (
              <div key={product.id} className="grid gap-4 rounded-2xl border border-zinc-800 bg-[#211F1C] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,2fr)]">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                    {draft.images[0] ? (
                      <img src={draft.images[0]} alt={draft.name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    ) : (
                      <ImageOff className="h-7 w-7 text-zinc-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-600">#{(page - 1) * PAGE_SIZE + index + 1}</span>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-200">{product.name}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {product.barcode || product.sku || "Barkod/SKU yok"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-end">
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Ürün adı</span>
                    <input
                      value={draft.name}
                      onChange={(event) => updateDraft(product.id, { name: event.target.value })}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fiyat (₺)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={draft.price}
                      onChange={(event) => updateDraft(product.id, { price: event.target.value })}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
                    />
                  </label>
                  <label className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 text-xs font-bold transition ${isUploading ? "cursor-wait border-zinc-700 text-zinc-600" : "border-amber-500/50 text-amber-300 hover:border-amber-400 hover:bg-amber-500/10"}`}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    <span>{isUploading ? "Yükleniyor" : "Görsel yükle"}</span>
                    <input type="file" accept="image/*" multiple className="hidden" disabled={isUploading} onChange={(event) => handleUpload(product.id, event)} />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-3 lg:col-span-2">
                  {draft.images.map((image, imageIndex) => (
                    <div key={`${image}-${imageIndex}`} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                      <img src={image} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(product.id, imageIndex)} className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100" aria-label="Görseli kaldır">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {!draft.images.length && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <Upload className="h-4 w-4" />
                      Bu ürün için henüz görsel yok
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="sticky bottom-4 z-20 flex justify-end">
          <button
            type="button"
            onClick={savePage}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-2xl transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Kaydediliyor..." : `Sayfadaki ${products.length} ürünü kaydet`}
          </button>
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pb-4">
          <button type="button" onClick={() => setPage(1)} disabled={page <= 1} className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30">İlk</button>
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="rounded-lg bg-zinc-800 p-2 text-zinc-300 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          <span className="px-3 text-sm text-zinc-400">{page} / {totalPages}</span>
          <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded-lg bg-zinc-800 p-2 text-zinc-300 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          <button type="button" onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30">Son</button>
        </div>
      )}
    </div>
  );
}