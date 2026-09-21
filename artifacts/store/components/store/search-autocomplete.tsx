"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProductImage from "@/components/store/product-image";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category?: { name: string };
  brand?: { name: string };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&take=6&includeTotal=false`, {
      cache: "force-cache",
    })
      .then((r) => r.json())
      .then((j) => setResults(j.data ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
    }
  };

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Ürün, kategori veya marka ara..."
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-[#E8E0D5] rounded-2xl shadow-2xl shadow-zinc-200/80 z-[300] overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-5 text-zinc-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aranıyor...
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#F5F0EA]">
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      href={`/products/${r.slug}`}
                      prefetch={false}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAF7F2] transition-colors group"
                    >
                      <div className="relative w-10 h-10 rounded-lg bg-[#F5F0EA] border border-[#E8E0D5] overflow-hidden flex-shrink-0">
                        <ProductImage src={r.images} alt={r.name} width={40} height={40} className="w-full h-full object-cover" fallbackLabel="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-[#B8973E] transition-colors">{r.name}</p>
                        <p className="text-xs text-zinc-400">{r.brand?.name ?? r.category?.name ?? ""}</p>
                      </div>
                      <span className="font-black text-[#B8973E] text-sm shrink-0">
                        ₺{Number(r.price).toLocaleString("tr-TR")}
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[#E8E0D5] p-2">
                  <button
                    onClick={handleSubmit as any}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#B8973E] hover:bg-[#FAF7F2] py-2.5 rounded-xl transition-colors"
                  >
                    "{query}" için tüm sonuçları gör
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="py-5 text-center text-sm text-zinc-400">
                "{query}" için sonuç bulunamadı
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
