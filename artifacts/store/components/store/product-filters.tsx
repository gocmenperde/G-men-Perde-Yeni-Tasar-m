"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, ChevronDown, X, BadgePercent, Sparkles } from "lucide-react";

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8E0D5] dark:border-zinc-800 pb-5 last:border-b-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${title} filtresini ${open ? "daralt" : "genişlet"}`}
        className="touch-target w-full flex items-center justify-between mb-4 group"
      >
         <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-[0.16em]">{title}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && children}
    </div>
  );
}

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
  const hasFilters = !!(current("category") || current("brand") || current("minPrice") || current("maxPrice") || current("sort") || current("sale") || current("featured"));

  return (
    <div className="bg-white/95 dark:bg-zinc-950/90 border border-[#E8E0D5] dark:border-zinc-800 rounded-[22px] p-5 space-y-5 shadow-[0_8px_30px_rgba(91,70,37,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#B8973E]" />
           <span className="font-black text-zinc-900 dark:text-white text-sm">Filtreler</span>
        </div>
        {hasFilters && (
          <button
            onClick={() => router.push("/products")}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Temizle
          </button>
        )}
      </div>

      {/* Quick filters */}
      <FilterSection title="Özel">
        <div className="space-y-1.5">
          <button
            onClick={() => set("sale", current("sale") === "true" ? "" : "true")}
            className={`w-full text-left text-sm px-3 py-2.5 rounded-xl flex items-center justify-between transition-all font-medium ${current("sale") === "true" ? "bg-red-50 text-red-600 border border-red-200" : "text-zinc-600 hover:bg-[#FAF7F2] border border-transparent"}`}
          >
             <span className="inline-flex items-center gap-2"><BadgePercent className="w-4 h-4 text-red-500" /> İndirimli Ürünler</span>
            {current("sale") === "true" && <X className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => set("featured", current("featured") === "true" ? "" : "true")}
            className={`w-full text-left text-sm px-3 py-2.5 rounded-xl flex items-center justify-between transition-all font-medium ${current("featured") === "true" ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-zinc-600 hover:bg-[#FAF7F2] border border-transparent"}`}
          >
             <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--gold)]" /> Öne Çıkan Ürünler</span>
            {current("featured") === "true" && <X className="w-3.5 h-3.5" />}
          </button>
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Kategori">
        <div className="space-y-1">
          <button
            onClick={() => set("category", "")}
            className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all flex items-center justify-between ${!current("category") ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:bg-[#FAF7F2]"}`}
          >
            Tümü
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => set("category", current("category") === c.slug ? "" : c.slug)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all flex items-center justify-between ${current("category") === c.slug ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:bg-[#FAF7F2]"}`}
            >
              <span>{c.name}</span>
              {c._count && (
                <span className={`text-xs rounded-full px-1.5 ${current("category") === c.slug ? "bg-white/20 text-white" : "text-zinc-400"}`}>
                  {c._count.products}
                </span>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Marka">
          <div className="space-y-1">
            <button
              onClick={() => set("brand", "")}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${!current("brand") ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:bg-[#FAF7F2]"}`}
            >
              Tümü
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => set("brand", current("brand") === b.slug ? "" : b.slug)}
                className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${current("brand") === b.slug ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:bg-[#FAF7F2]"}`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection title="Fiyat Aralığı (₺)">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            defaultValue={current("minPrice")}
            onBlur={(e) => set("minPrice", e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition-all"
          />
          <span className="text-zinc-300 font-bold">—</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={current("maxPrice")}
            onBlur={(e) => set("maxPrice", e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition-all"
          />
        </div>
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sıralama" defaultOpen={true}>
        <div className="space-y-1">
          {[
            { v: "", l: "En Yeniler" },
            { v: "price-asc", l: "Artan Fiyat" },
            { v: "price-desc", l: "Azalan Fiyat" },
            { v: "oldest", l: "En Eskiler" },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => set("sort", v)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${current("sort") === v ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:bg-[#FAF7F2]"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
