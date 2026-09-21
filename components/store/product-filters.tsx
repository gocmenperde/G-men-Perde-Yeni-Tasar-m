"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function ProductFilters({ categories, brands }: { categories: any[]; brands: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const current = (key: string) => searchParams.get(key) ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
        <SlidersHorizontal className="w-5 h-5" />
        <span>Filtreler</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wider">Kategori</p>
        <div className="space-y-1.5">
          <button onClick={() => set("category", "")} className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${!current("category") ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>Tümü</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => set("category", c.slug)} className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${current("category") === c.slug ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
              <span>{c.name}</span>
              {c._count && <span className="text-xs opacity-60">{c._count.products}</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wider">Marka</p>
        <div className="space-y-1.5">
          <button onClick={() => set("brand", "")} className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${!current("brand") ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>Tümü</button>
          {brands.map((b) => (
            <button key={b.id} onClick={() => set("brand", b.slug)} className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${current("brand") === b.slug ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>{b.name}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wider">Fiyat (₺)</p>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" defaultValue={current("minPrice")} onBlur={(e) => set("minPrice", e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <span className="text-zinc-400">–</span>
          <input type="number" placeholder="Max" defaultValue={current("maxPrice")} onBlur={(e) => set("maxPrice", e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wider">Sıralama</p>
        <select value={current("sort")} onChange={(e) => set("sort", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">En Yeniler</option>
          <option value="price-asc">Artan Fiyat</option>
          <option value="price-desc">Azalan Fiyat</option>
          <option value="oldest">En Eskiler</option>
        </select>
      </div>
      {(current("category") || current("brand") || current("minPrice") || current("maxPrice") || current("sort")) && (
        <button onClick={() => router.push("/products")} className="w-full text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2.5 rounded-xl transition-colors font-medium">Filtreleri Temizle</button>
      )}
    </div>
  );
}
