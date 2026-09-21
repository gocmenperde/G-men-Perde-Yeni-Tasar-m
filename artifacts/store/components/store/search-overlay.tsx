"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock3, Search, Sparkles, X } from "lucide-react";
import ProductImage from "@/components/store/product-image";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  comparePrice?: number | string | null;
  images?: string[];
  category?: { name?: string } | string | null;
  brand?: { name?: string } | null;
}

const POPULAR_SEARCHES = ["Fosforlu kalem", "Spiralli defter", "Suluboya", "Kırtasiye seti"];

function money(value: number | string) {
  return `₺${Number(value).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;
}

export default function SearchOverlay({
  open,
  initialQuery = "",
  onClose,
}: {
  open: boolean;
  initialQuery?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) {
      setResults([]);
      setLoading(false);
      setFailed(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(term)}&take=8&includeTotal=false`, {
          signal: controller.signal,
          cache: "force-cache",
        });
        if (!response.ok) throw new Error("search-failed");
        const payload = await response.json();
        setResults(payload.data ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 240);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, retryKey]);

  const submit = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      const term = query.trim();
      if (!term) return;
      router.push(`/products?q=${encodeURIComponent(term)}`);
      onClose();
    },
    [onClose, query, router],
  );

  const choosePopular = (term: string) => setQuery(term);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-[rgba(38,53,59,0.34)] px-4 pb-10 pt-[calc(112px+env(safe-area-inset-top,0px))] backdrop-blur-[5px] md:pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          role="presentation"
        >
          <motion.section
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[0_28px_80px_rgba(38,53,59,0.24)]"
            role="dialog"
            aria-modal="true"
            aria-label="Ürün arama"
          >
            <div className="border-b border-[var(--line)] px-4 py-4 md:px-6 md:py-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="section-label">Hızlı keşif</p>
                  <h2 className="mt-1 font-display text-2xl text-[var(--ink)] md:text-3xl">Ne arıyorsunuz?</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="touch-target flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                  aria-label="Aramayı kapat"
                  data-testid="button-close-search"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={submit} className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gold)]" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ürün, marka veya barkod yazın..."
                  className="min-h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] pl-12 pr-24 text-sm font-semibold text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-muted)] focus:border-[var(--gold)] focus:ring-4 focus:ring-amber-500/10"
                  aria-label="Ürün ara"
                  data-testid="input-search-overlay"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="touch-target absolute right-[4.6rem] top-1/2 flex -translate-y-1/2 items-center justify-center rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    aria-label="Aramayı temizle"
                    data-testid="button-clear-search"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-xl bg-[var(--navy)] px-4 text-xs font-black text-[var(--surface)] transition-colors hover:bg-[var(--gold)]"
                  data-testid="button-submit-search"
                >
                  Ara
                </button>
              </form>
            </div>

            <div className="max-h-[min(57vh,500px)] overflow-y-auto px-4 py-4 md:px-6 md:py-5">
              {query.trim().length < 2 ? (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    <Clock3 className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
                    Popüler aramalar
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => choosePopular(term)}
                        className="rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-3.5 py-2 text-xs font-bold text-[var(--ink-muted)] transition-all hover:-translate-y-0.5 hover:border-[var(--gold-muted)] hover:bg-[var(--gold-pale)] hover:text-[var(--gold)]"
                        data-testid={`button-popular-search-${term}`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex items-start gap-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)]/60 p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden="true" />
                    <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                      Aramaya başladığınızda ürün görselleri, fiyatlar ve stok durumu burada anında görünür.
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="space-y-2" aria-label="Ürünler aranıyor" data-testid="status-search-loading">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] p-3">
                      <div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-3/4" />
                        <div className="skeleton h-2.5 w-1/3" />
                      </div>
                      <div className="skeleton h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : failed ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Arama şu an yanıt vermiyor.</p>
                  <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-2 text-xs font-bold text-rose-600 underline dark:text-rose-300">
                    Tekrar dene
                  </button>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  <p className="mb-3 text-xs font-bold text-[var(--ink-muted)]">{results.length} hızlı sonuç</p>
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/products/${result.slug}`}
                      prefetch={false}
                      onClick={onClose}
                      className="group flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-all hover:border-[var(--gold-muted)] hover:bg-[var(--gold-pale)]/60"
                      data-testid={`link-search-result-${result.id}`}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-muted)]">
                        <ProductImage
                          src={result.images?.[0]}
                          alt=""
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          fallbackLabel=""
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[var(--ink)] group-hover:text-[var(--gold)]">{result.name}</p>
                        <p className="mt-1 truncate text-xs text-[var(--ink-muted)]">
                          {result.brand?.name ?? (typeof result.category === "string" ? result.category : result.category?.name ?? "Göçmen Perde")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-[var(--ink)]">{money(result.price)}</p>
                        {result.comparePrice && <p className="text-[10px] text-[var(--ink-muted)] line-through">{money(result.comparePrice)}</p>}
                      </div>
                      <ArrowRight className="hidden h-4 w-4 text-[var(--gold)] sm:block" aria-hidden="true" />
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => submit()}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] py-3 text-xs font-black text-[var(--gold)] transition-colors hover:bg-[var(--gold-pale)]"
                    data-testid="button-view-all-search-results"
                  >
                    “{query.trim()}” için tüm sonuçları gör <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search className="mx-auto h-8 w-8 text-[var(--line)]" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-[var(--ink)]">Sonuç bulunamadı</p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">Farklı bir ürün adı veya marka deneyin.</p>
                </div>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}