"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { LayoutGrid, List, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import ProductFilters from "@/components/store/product-filters";

const SORT_OPTIONS = [
  { v: "", l: "En Yeniler" },
  { v: "price-asc", l: "Artan Fiyat" },
  { v: "price-desc", l: "Azalan Fiyat" },
  { v: "oldest", l: "En Eskiler" },
];

interface Props {
  total: number;
  categories: any[];
  brands: any[];
  onViewChange?: (view: "grid" | "list") => void;
  view?: "grid" | "list";
}

export default function ProductsToolbar({ total, categories, brands, onViewChange, view = "grid" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentSort = searchParams.get("sort") ?? "";
  const currentSortLabel = SORT_OPTIONS.find((o) => o.v === currentSort)?.l ?? "En Yeniler";

  const setSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("sort", value);
      else params.delete("sort");
      params.delete("page");
      router.push(`/products?${params.toString()}`);
      setSortOpen(false);
    },
    [router, searchParams]
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-5 bg-white border border-[#E8E0D5] rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm font-semibold text-zinc-700 border border-[#E8E0D5] rounded-xl px-3 py-2 hover:border-[#D4AF5A] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#B8973E]" />
            Filtrele
          </button>
          <span className="text-sm text-zinc-400 hidden sm:block">
            <span className="font-bold text-zinc-700">{total}</span> ürün
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 text-sm font-semibold text-zinc-700 border border-[#E8E0D5] rounded-xl px-3 py-2 hover:border-[#D4AF5A] transition-colors bg-white"
            >
              <span className="hidden sm:inline text-zinc-400 font-normal">Sırala:</span>
              {currentSortLabel}
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#E8E0D5] rounded-2xl shadow-xl z-20 min-w-[160px] p-1.5 overflow-hidden">
                  {SORT_OPTIONS.map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => setSort(v)}
                      className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all font-medium ${currentSort === v ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-[#FAF7F2]"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center border border-[#E8E0D5] rounded-xl overflow-hidden">
            <button
              onClick={() => onViewChange?.("grid")}
              className={`p-2 transition-colors ${view === "grid" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-[#FAF7F2]"}`}
              title="Izgara görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewChange?.("list")}
              className={`p-2 transition-colors ${view === "list" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-[#FAF7F2]"}`}
              title="Liste görünümü"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E8E0D5] px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#B8973E]" />
                <span className="font-black text-zinc-900">Filtreler</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-xl hover:bg-[#FAF7F2] transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <div className="p-4">
              <ProductFilters categories={categories} brands={brands} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[#E8E0D5] p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-zinc-900 text-white font-bold py-3.5 rounded-2xl hover:bg-[#B8973E] transition-colors"
              >
                Filtreleri Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
