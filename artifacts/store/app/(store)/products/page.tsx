import { catalogDb } from "@/lib/db";
import { serializeProducts } from "@/lib/serialize";
import ProductsGrid from "@/components/store/products-grid";
import ComparisonBar from "@/components/store/comparison-bar";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { generateKeywords } from "@/lib/seo-keywords";
import { productCardSelect } from "@/lib/product-selects";
import ProductFiltersClient from "@/components/store/product-filters-client";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenperde.com.tr"
).replace(/\/$/, "");

export async function generateMetadata({ searchParams: searchParamsPromise }: Props): Promise<Metadata> {
  const searchParams = await searchParamsPromise;
  let categoryName = "";
  let brandName = "";

  try {
    if (searchParams.category) {
      const cat = await catalogDb.category.findUnique({
        where: { slug: searchParams.category },
        select: { name: true },
      });
      if (cat) categoryName = cat.name;
    }
    if (searchParams.brand) {
      const brand = await catalogDb.brand.findUnique({
        where: { slug: searchParams.brand },
        select: { name: true },
      });
      if (brand) brandName = brand.name;
    }
  } catch {}

  const label = categoryName || brandName || "Tüm Ürünler";
  const isSale = searchParams.sale === "true";
  const isFeatured = searchParams.featured === "true";
  const title = isSale
    ? "İndirimli Ürünler | Göçmen Perde"
    : isFeatured
    ? "Öne Çıkan Ürünler | Göçmen Perde"
    : `${label} | Göçmen Perde`;

  const description = categoryName
    ? `${categoryName} — Göçmen Perde'de uygun fiyat, güvenilir kalite ve hızlı teslimat. Bursa'nın perde uzmanı.`
    : brandName
    ? `${brandName} ürünleri Göçmen Perde'de! ${brandName} perde koleksiyonlarını keşfedin. Hızlı teslimat.`
    : "Göçmen Perde'de tül, fon, stor, zebra ve plise perde modelleri. Özel ölçü, profesyonel dikim ve montaj hizmeti.";

  const pageNum = parseInt(searchParams.page ?? "1");

  // Filtre, sıralama, arama veya sayfalama parametresi varsa noindex:
  // bu URL'ler canonical ile zaten doğru sayfaya işaret eder,
  // ayrı ayrı indexlenmesi "kullanıcı tarafından seçilen standart sayfa olmadan kopya"
  // ve "dizine eklenmeyen sayfa" sayısını şişirir.
  const hasParams =
    pageNum > 1 ||
    !!searchParams.sort ||
    !!searchParams.minPrice ||
    !!searchParams.maxPrice ||
    !!searchParams.featured ||
    !!searchParams.sale ||
    !!searchParams.q; // Arama sorguları: /products?q=kalem ayrı sayfa olarak indexlenmemeli

  const canonical = searchParams.category
    ? `${BASE_URL}/kategori/${searchParams.category}`
    : searchParams.brand
    ? `${BASE_URL}/marka/${searchParams.brand}`
    : `${BASE_URL}/products`;

  return {
    title,
    description,
    keywords: generateKeywords({
      categoryName: categoryName || undefined,
      brandName: brandName || undefined,
    }),
    robots: hasParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
    alternates: { canonical },
  };
}

interface Props {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    featured?: string;
    sale?: string;
    page?: string;
    q?: string;
  }>;
}

const TAKE = 20;
const MAX_PAGE = 250;

// Product listings are public and contain no session-specific server data.
// Keep a short edge TTL so crawlers and repeated filter visits do not render
// the same catalogue against the origin on every request.
export const revalidate = 300;

export default async function ProductsPage({ searchParams: searchParamsPromise }: Props) {
  const searchParams = await searchParamsPromise;
  const requestedPage = parseInt(searchParams.page ?? "1", 10);
  if (Number.isFinite(requestedPage) && requestedPage > MAX_PAGE) notFound();
  const page = Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1);
  const skip = (page - 1) * TAKE;

  const where: any = { isActive: true };
  let categoryId: string | null = null;
  let brandId: string | null = null;
  let activeCategoryName = "";
  let activeBrandName = "";
  const searchQuery = searchParams.q?.trim() ?? "";

  try {
    if (searchParams.category) {
      const cat = await catalogDb.category.findUnique({ where: { slug: searchParams.category } });
      if (cat) { categoryId = cat.id; activeCategoryName = cat.name; }
    }
    if (searchParams.brand) {
      const brand = await catalogDb.brand.findUnique({ where: { slug: searchParams.brand } });
      if (brand) { brandId = brand.id; activeBrandName = brand.name; }
    }
  } catch {}

  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice);
  }
  if (searchParams.featured === "true") where.isFeatured = true;
  if (searchParams.sale === "true") where.comparePrice = { not: null };
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const orderBy: any =
    searchParams.sort === "price-asc" ? { price: "asc" }
    : searchParams.sort === "price-desc" ? { price: "desc" }
    : searchParams.sort === "oldest" ? { createdAt: "asc" }
    : { createdAt: "desc" };

  let rawProducts: any[] = [];
  let total = 0;
  let categories: any[] = [];
  let brands: any[] = [];

  try {
    [rawProducts, total, categories, brands] = await Promise.all([
      catalogDb.product.findMany({ where, select: productCardSelect, orderBy, take: TAKE, skip }),
      catalogDb.product.count({ where }),
      catalogDb.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
      }),
      catalogDb.brand.findMany({
        select: { id: true, name: true, slug: true },
      }),
    ]);
  } catch {}

  const products = serializeProducts(rawProducts, { imageLimit: 2 });
  const totalPages = Math.ceil(total / TAKE);

  const activeFilters = [
    searchQuery && { key: "q", label: `🔍 "${searchQuery}"` },
    activeCategoryName && { key: "category", label: activeCategoryName },
    activeBrandName && { key: "brand", label: activeBrandName },
    searchParams.sale === "true" && { key: "sale", label: "İndirimli" },
    searchParams.featured === "true" && { key: "featured", label: "Öne Çıkan" },
    searchParams.minPrice && { key: "minPrice", label: `Min ₺${searchParams.minPrice}` },
    searchParams.maxPrice && { key: "maxPrice", label: `Max ₺${searchParams.maxPrice}` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <ComparisonBar />
      {/* Page header */}
      <div className="relative overflow-hidden bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-[#E8E0D5] dark:border-zinc-800">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-50/80 dark:from-amber-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-9 sm:py-11">
          <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-5">
            <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-zinc-700 dark:text-zinc-200 font-semibold">
              {activeCategoryName || "Tüm Ürünler"}
            </span>
          </nav>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="section-label mb-3">Koleksiyonu keşfet</span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                {searchQuery ? `"${searchQuery}" için sonuçlar`
                  : searchParams.sale === "true" ? "İndirimli Ürünler"
                  : searchParams.featured === "true" ? "Öne Çıkan Ürünler"
                  : activeCategoryName || "Tüm Ürünler"}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{total}</span> ürün bulundu
                <span className="mx-2 text-zinc-300">·</span>
                İhtiyacınıza uygun ürünü kolayca bulun
              </p>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map(({ key, label }) => (
                <span key={key} className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {label}
                </span>
              ))}
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
              >
                Tümünü Temizle
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex gap-8">
          {/* Filters Sidebar (desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Suspense>
                  <ProductFiltersClient categories={categories} brands={brands} />
              </Suspense>
            </div>
          </aside>

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <>
                {/* Toolbar still shows on empty state */}
                <Suspense>
                  <ProductsGrid
                    products={[]}
                    total={0}
                    categories={categories}
                    brands={brands}
                  />
                </Suspense>
                <div className="bg-white border border-zinc-100 rounded-2xl text-center py-24 px-8 mt-4">
                  <div className="w-20 h-20 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto mb-5">
                    <Package className="w-10 h-10 text-zinc-300" />
                  </div>
                  <h3 className="font-black text-zinc-900 text-xl mb-2">Ürün bulunamadı</h3>
                  <p className="text-zinc-400 mb-6 max-w-sm mx-auto">Seçili filtrelere uygun ürün yok. Filtreleri temizleyerek tüm ürünlere göz atabilirsiniz.</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-[#B8973E] transition-colors"
                  >
                    Tüm Ürünleri Gör
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Suspense>
                  <ProductsGrid
                    products={products}
                    total={total}
                    categories={categories}
                    brands={brands}
                  />
                </Suspense>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/products?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-zinc-100 text-zinc-700 hover:border-[#D4AF5A] transition-colors"
                      >
                        ← Önceki
                      </Link>
                    )}
                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                        .reduce((acc: (number | "...")[], p, i, arr) => {
                          if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-zinc-400">…</span>
                          ) : (
                            <Link
                              key={p}
                              href={`/products?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${p === page ? "bg-zinc-900 text-white shadow-md" : "bg-white border border-zinc-100 text-zinc-600 hover:border-[#D4AF5A]"}`}
                            >
                              {p}
                            </Link>
                          )
                        )}
                    </div>
                    {page < totalPages && (
                      <Link
                        href={`/products?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-zinc-100 text-zinc-700 hover:border-[#D4AF5A] transition-colors"
                      >
                        Sonraki →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
