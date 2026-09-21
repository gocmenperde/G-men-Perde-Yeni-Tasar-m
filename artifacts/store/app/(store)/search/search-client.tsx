"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/store/product-card";
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
  LayoutGrid, LayoutList, Star, Sparkles, ArrowUpDown,
} from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeniler" },
  { value: "price-asc", label: "Önce Ucuz" },
  { value: "price-desc", label: "Önce Pahalı" },
  { value: "popular", label: "Popüler" },
];

const PRICE_PRESETS = [
  { label: "0–50₺", min: 0, max: 50 },
  { label: "50–150₺", min: 50, max: 150 },
  { label: "150–500₺", min: 150, max: 500 },
  { label: "500₺+", min: 500, max: 0 },
];

function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-pulse">
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-5 w-20 bg-amber-100 dark:bg-amber-900/20 rounded" />
      </div>
    </div>
  );
}

interface Props {
  initialQuery: string;
  categories: any[];
  brands: any[];
}

export default function SearchClient({ initialQuery, categories, brands }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [onlyDiscount, setOnlyDiscount] = useState(searchParams.get("discount") === "true");
  const [onlyFeatured, setOnlyFeatured] = useState(searchParams.get("featured") === "true");

  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [total, setTotal] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(2);
  const [expandedSections, setExpandedSections] = useState({ category: true, brand: true, price: true, extra: true });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef(false);
  const TAKE = 12;

  const buildParams = useCallback(
    (pg: number) => {
      const p = new URLSearchParams();
      if (query) p.set("q", query);
      if (selectedCategory) p.set("category", selectedCategory);
      if (selectedBrand) p.set("brand", selectedBrand);
      if (minPrice) p.set("minPrice", minPrice);
      if (maxPrice) p.set("maxPrice", maxPrice);
      if (sort && sort !== "newest") p.set("sort", sort);
      if (onlyDiscount) p.set("hasDiscount", "true");
      if (onlyFeatured) p.set("isFeatured", "true");
      p.set("take", String(TAKE));
      p.set("page", String(pg));
      return p.toString();
    },
    [query, selectedCategory, selectedBrand, minPrice, maxPrice, sort, onlyDiscount, onlyFeatured]
  );

  const fetchProducts = useCallback(
    async (pg: number, reset = false) => {
      if (fetchRef.current) return;
      fetchRef.current = true;
      setLoading(true);
      try {
        const res = await fetch(`/api/products?${buildParams(pg)}`, {
          cache: "force-cache",
        });
        const json = await res.json();
        const newItems = json.data ?? [];
        const tot = json.total ?? newItems.length;
        setTotal(tot);
        setProducts((prev) => (reset ? newItems : [...prev, ...newItems]));
        setHasMore(pg * TAKE < tot);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        fetchRef.current = false;
      }
    },
    [buildParams]
  );

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setInitialLoad(true);
    fetchProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategory, selectedBrand, minPrice, maxPrice, sort, onlyDiscount, onlyFeatured]);

  // Infinite scroll observer
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoad) {
          const next = page + 1;
          setPage(next);
          fetchProducts(next);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, initialLoad, page, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue.trim());
  };

  const clearFilter = (key: string) => {
    if (key === "category") setSelectedCategory("");
    if (key === "brand") setSelectedBrand("");
    if (key === "price") { setMinPrice(""); setMaxPrice(""); }
    if (key === "discount") setOnlyDiscount(false);
    if (key === "featured") setOnlyFeatured(false);
    if (key === "query") { setQuery(""); setInputValue(""); }
  };

  const clearAll = () => {
    setSelectedCategory(""); setSelectedBrand("");
    setMinPrice(""); setMaxPrice("");
    setOnlyDiscount(false); setOnlyFeatured(false);
    setSort("newest"); setQuery(""); setInputValue("");
  };

  const activeFilters = [
    query && { key: "query", label: `"${query}"` },
    selectedCategory && { key: "category", label: categories.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory },
    selectedBrand && { key: "brand", label: brands.find((b) => b.slug === selectedBrand)?.name ?? selectedBrand },
    (minPrice || maxPrice) && { key: "price", label: `${minPrice || "0"}₺ – ${maxPrice || "∞"}₺` },
    onlyDiscount && { key: "discount", label: "İndirimli" },
    onlyFeatured && { key: "featured", label: "Öne Çıkan" },
  ].filter(Boolean) as { key: string; label: string }[];

  const toggleSection = (s: keyof typeof expandedSections) =>
    setExpandedSections((p) => ({ ...p, [s]: !p[s] }));

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Category */}
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between p-4 text-sm font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          Kategori
          {expandedSections.category ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${!selectedCategory ? "bg-amber-500 text-zinc-900 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  Tümü
                  <span className="text-xs opacity-70">{total || ""}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug === selectedCategory ? "" : c.slug)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${selectedCategory === c.slug ? "bg-amber-500 text-zinc-900 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-xs opacity-60 flex-shrink-0 ml-1">{c._count?.products ?? 0}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection("brand")}
            className="w-full flex items-center justify-between p-4 text-sm font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            Marka
            {expandedSections.brand ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>
          <AnimatePresence>
            {expandedSections.brand && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.slug === selectedBrand ? "" : b.slug)}
                      className={`text-sm px-3 py-1.5 rounded-xl border transition-all ${selectedBrand === b.slug ? "bg-amber-500 border-amber-500 text-zinc-900 font-bold" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-300 dark:hover:border-amber-600"}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Price */}
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between p-4 text-sm font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          Fiyat Aralığı
          {expandedSections.price ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {PRICE_PRESETS.map((preset) => {
                    const active = minPrice === String(preset.min) && maxPrice === String(preset.max || "");
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          if (active) { setMinPrice(""); setMaxPrice(""); }
                          else { setMinPrice(String(preset.min)); setMaxPrice(preset.max ? String(preset.max) : ""); }
                        }}
                        className={`text-xs px-3 py-2 rounded-xl border transition-all ${active ? "bg-amber-500 border-amber-500 text-zinc-900 font-bold" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-300"}`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number" placeholder="Min ₺" value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                  <span className="text-zinc-400 text-sm">–</span>
                  <input
                    type="number" placeholder="Max ₺" value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Extra filters */}
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("extra")}
          className="w-full flex items-center justify-between p-4 text-sm font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          Özellikler
          {expandedSections.extra ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.extra && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-4 pb-4 space-y-2">
                {[
                  { label: "İndirimli Ürünler", state: onlyDiscount, setter: setOnlyDiscount },
                  { label: "Öne Çıkan Ürünler", state: onlyFeatured, setter: setOnlyFeatured },
                ].map(({ label, state, setter }) => (
                  <button
                    key={label}
                    onClick={() => setter(!state)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all ${state ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400 font-semibold" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-300"}`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${state ? "bg-amber-500 border-amber-500" : "border-zinc-300 dark:border-zinc-600"}`}>
                      {state && <span className="text-white text-[10px] font-black">✓</span>}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeFilters.length > 0 && (
        <button
          onClick={clearAll}
          className="w-full text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2.5 rounded-xl transition-colors font-semibold"
        >
          Tüm Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Search hero */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Ürün Arama</p>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {query ? (
                <><span className="text-zinc-400">Arama: </span><span className="text-amber-400">&ldquo;{query}&rdquo;</span></>
              ) : "Ne Arıyorsunuz?"}
            </h1>
          </motion.div>

          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ürün adı veya barkod ara..."
                className="w-full pl-12 pr-36 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-base transition-all"
                autoFocus
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => { setInputValue(""); setQuery(""); }}
                  className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Ara
              </button>
            </div>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Faber-Castell", "Spiralli Defter", "Suluboya", "Kalem Seti", "Ajanda 2025"].map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); setInputValue(s); }}
                className="text-xs text-zinc-400 hover:text-amber-400 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/40 px-3 py-1.5 rounded-full transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-amber-400 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtrele
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-zinc-900 rounded-full text-xs font-black flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {initialLoad ? "Yükleniyor..." : `${total} ürün bulundu`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* Grid toggle — desktop only */}
            <div className="hidden lg:flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
              {([2, 3] as const).map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`p-2.5 transition-colors ${gridCols === cols ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                >
                  {cols === 2 ? <LayoutList className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((f) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 text-sm font-medium px-3 py-1.5 rounded-full"
              >
                {f.label}
                <button onClick={() => clearFilter(f.key)} className="hover:text-amber-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
            <button
              onClick={clearAll}
              className="text-sm text-zinc-500 hover:text-red-500 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-red-300 transition-colors"
            >
              Tümünü temizle
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filter sidebar — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
                <span className="font-bold text-zinc-900 dark:text-white text-sm">Filtreler</span>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {initialLoad ? (
              <div className={`grid gap-5 ${gridCols === 3 ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24"
              >
                <div className="text-7xl mb-5 opacity-30">🔍</div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">Sonuç bulunamadı</h2>
                <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
                  {query ? `"${query}" için ürün bulunamadı.` : "Seçili filtrelere uygun ürün yok."}
                  {activeFilters.length > 0 && " Filtreleri temizlemeyi deneyin."}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {activeFilters.length > 0 && (
                    <button onClick={clearAll} className="px-6 py-3 bg-amber-500 text-zinc-900 font-bold rounded-2xl hover:bg-amber-400 transition-colors">
                      Filtreleri Temizle
                    </button>
                  )}
                  <button onClick={() => router.push("/products")} className="px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl hover:border-amber-400 transition-colors">
                    Tüm Ürünlere Git
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className={`grid gap-5 ${gridCols === 3 ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
                  <AnimatePresence mode="popLayout">
                    {products.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      >
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="h-16 flex items-center justify-center mt-8">
                  {loading && !initialLoad && (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      Daha fazla yükleniyor...
                    </div>
                  )}
                  {!hasMore && products.length > 0 && (
                    <p className="text-zinc-400 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Tüm {total} ürün gösterildi
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-zinc-950 z-50 overflow-y-auto lg:hidden shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-4 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
                  <span className="font-bold text-zinc-900 dark:text-white">Filtreler</span>
                  {activeFilters.length > 0 && (
                    <span className="w-5 h-5 bg-amber-500 text-zinc-900 rounded-full text-xs font-black flex items-center justify-center">{activeFilters.length}</span>
                  )}
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                </button>
              </div>
              <div className="p-4">
                <FilterPanel />
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 p-4">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold py-3.5 rounded-2xl transition-colors"
                >
                  {total} Sonucu Gör
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
