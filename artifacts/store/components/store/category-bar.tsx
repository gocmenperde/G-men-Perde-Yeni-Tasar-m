"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "@/components/store/product-image";
import { getCategoryImage, getCuratedCategoryImage } from "@/lib/taxonomy-images";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export default function CategoryBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeSlug = searchParams.get("category") ?? "";

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .catch(() => {});
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  // Slug tabanlı filtre — Türkçe İ/i toLowerCase sorunu olmaz
  const HIDDEN_SLUGS = new Set(["belirtilmedi", "deneme", "diger", "other", "bilinmiyor"]);
  const visible = categories.filter((c) => !HIDDEN_SLUGS.has(c.slug));

  if (pathname === "/") return null;
  if (visible.length === 0) return null;

  return (
    <div className="glass relative border-b border-[var(--line)]/70 shadow-sm">
      {canScrollLeft && (
        <>
          <div className="absolute bottom-0 left-0 top-0 z-10 w-14 pointer-events-none bg-gradient-to-r from-[var(--surface)] to-transparent" />
          <button
            onClick={() => scroll("left")}
            aria-label="Kategorileri sola kaydır"
            className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] shadow-md transition-all hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      {canScrollRight && (
        <>
          <div className="absolute bottom-0 right-0 top-0 z-10 w-14 pointer-events-none bg-gradient-to-l from-[var(--surface)] to-transparent" />
          <button
            onClick={() => scroll("right")}
            aria-label="Kategorileri sağa kaydır"
            className="absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] shadow-md transition-all hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Link
          href="/products"
            className={`flex items-center gap-1.5 flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
            pathname === "/products" && !activeSlug
              ? "border-[var(--gold)]/50 bg-[var(--gold)] text-white shadow-[0_0_18px_rgba(184,151,62,0.28)]"
              : "border-[var(--line)]/70 bg-[var(--surface)]/65 text-zinc-500 dark:text-zinc-400 hover:border-[var(--gold)]/40 hover:bg-[var(--gold-pale)]/60 dark:hover:bg-amber-900/20"
          }`}
        >
          <LayoutGrid className="w-3 h-3" />
          Tümü
        </Link>

        {visible.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className={`flex items-center gap-1.5 flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "border-amber-400/70 bg-amber-500 text-white shadow-[0_0_18px_rgba(245,158,11,0.30)] scale-105"
                  : "border-[var(--line)]/70 bg-[var(--surface)]/65 text-zinc-500 dark:text-zinc-400 hover:border-amber-400/50 hover:bg-amber-50/70 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400"
              }`}
            >
              {(cat.image || getCuratedCategoryImage(cat.slug)) && (
                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/50">
                  <ProductImage
                    src={getCategoryImage(cat)}
                    fallbackSrc={cat.image ? getCuratedCategoryImage(cat.slug) : undefined}
                    alt={cat.name}
                    width={16}
                    height={16}
                    className="w-full h-full object-cover"
                    fallbackLabel=""
                  />
                </div>
              )}
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
