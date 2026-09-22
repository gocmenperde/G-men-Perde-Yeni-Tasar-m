import { catalogDb } from "@/lib/db";
import { serializeProducts } from "@/lib/serialize";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import ProductImage from "@/components/store/product-image";
import { listingProductSelect, productMetadataSelect } from "@/lib/product-selects";
import { getPublicImageUrl } from "@/lib/image-url";

export const revalidate = false;
export const dynamicParams = true;

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const slug = resolvedParams.slug;
  try {
    const [brand, firstProduct] = await Promise.all([
      catalogDb.brand.findUnique({
        where: { slug },
        select: { name: true, slug: true },
      }),
      catalogDb.product.findFirst({
        where: { brand: { slug }, isActive: true },
        select: { ...productMetadataSelect, images: true, name: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    if (!brand) return { title: "Marka Bulunamadı" };

    const page = parseInt(resolvedSearchParams.page ?? "1");
    const isPaged = page > 1;
    const url = `${BASE_URL}/marka/${slug}`;
    const title = isPaged
      ? `${brand.name} Ürünleri — Sayfa ${page} | Göçmen Perde`
      : `${brand.name} Ürünleri | Göçmen Perde`;
    const description = `${brand.name} markasının tüm ürünleri — Göçmen Perde'de güvenilir ve kaliteli ${brand.name} ürünleri. Hızlı teslimat, uygun fiyat.`;

    const firstImage = getPublicImageUrl(firstProduct?.images?.[0]);
    const ogImage = firstImage
      ? { url: firstImage, width: 800, height: 800, alt: `${brand.name} — Göçmen Perde` }
      : { url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630, alt: `${brand.name} — Göçmen Perde` };

    return {
      title,
      description,
      keywords: [`${brand.name}`, `${brand.name} ürünleri`, `${brand.name} kırtasiye`, `${brand.name} fiyatları`, `${brand.name} satın al`, `${brand.name} bursa`, `orijinal ${brand.name}`, `${brand.name} göçmen kırtasiye`],
      robots: isPaged
        ? { index: false, follow: true }
        : { index: true, follow: true },
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        title,
        description,
        url,
        siteName: "Göçmen Perde",
        locale: "tr_TR",
        images: [ogImage],
      },
      twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
    };
  } catch {
    return { title: "Marka" };
  }
}

const TAKE = 24;
const MAX_PAGE = 250;

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const slug = resolvedParams.slug;
  const brand = await catalogDb.brand.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
  });
  if (!brand) notFound();

  const requestedPage = parseInt(resolvedSearchParams.page ?? "1", 10);
  if (Number.isFinite(requestedPage) && requestedPage > MAX_PAGE) notFound();
  const page = Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1);
  const skip = (page - 1) * TAKE;

  const [rawProducts, total] = await Promise.all([
    catalogDb.product.findMany({
      where: { brandId: brand.id, isActive: true },
      select: listingProductSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: TAKE,
    }),
    catalogDb.product.count({ where: { brandId: brand.id, isActive: true } }),
  ]);

  const products = serializeProducts(rawProducts, { imageLimit: 2 });
  const totalPages = Math.ceil(total / TAKE);
  const canonicalUrl = `${BASE_URL}/marka/${slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Ürünler", item: `${BASE_URL}/products` },
      { "@type": "ListItem", position: 3, name: brand.name, item: canonicalUrl },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${brand.name} Ürünleri`,
    description: `Göçmen Perde ${brand.name} ürünleri`,
    url: canonicalUrl,
    numberOfItems: total,
    itemListElement: products.slice(0, 10).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: skip + i + 1,
      url: `${BASE_URL}/products/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      {/* Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-zinc-400 mb-3 flex-wrap">
            <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link href="/products" className="hover:text-[#B8973E] transition-colors">Ürünler</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-zinc-700 font-medium">{brand.name}</span>
          </nav>
          <h1 className="text-3xl font-black text-zinc-900">{brand.name} Ürünleri</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            <span className="font-semibold text-zinc-800">{total}</span> ürün
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="bg-white border border-zinc-100 rounded-2xl text-center py-24 px-8">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="font-black text-zinc-900 text-xl mb-2">Bu markada ürün yok</h3>
            <Link href="/products" className="inline-flex items-center gap-2 bg-zinc-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-[#B8973E] transition-colors mt-4">
              Tüm Ürünleri Gör
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {products.map((p: any) => (
                <Link key={p.id} href={`/products/${p.slug}`} prefetch={false}
                  className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_4px_18px_rgba(50,40,20,.04)] transition-all hover:-translate-y-0.5 hover:border-[#D4AF5A] hover:shadow-lg">
                  <div className="aspect-square relative bg-zinc-50">
                    <ProductImage
                      src={p.images?.[0]}
                      alt={p.name}
                      fill
                       className="object-contain p-2 transition-transform group-hover:scale-105"
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
                      fallbackLabel="Görsel yok"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-zinc-500 mb-0.5 truncate">{(p as any).category?.name ?? ""}</p>
                    <h3 className="text-xs font-semibold text-zinc-800 line-clamp-2 leading-tight">{p.name}</h3>
                    <p className="text-sm font-black text-zinc-900 mt-2">
                      {Number(p.price).toFixed(2)} ₺
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {page > 1 && (
                  <Link href={`/marka/${slug}?page=${page - 1}`}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-zinc-100 text-zinc-700 hover:border-[#D4AF5A] transition-colors">
                    ← Önceki
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/marka/${slug}?page=${p}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${p === page ? "bg-zinc-900 text-white" : "bg-white border border-zinc-100 text-zinc-600 hover:border-[#D4AF5A]"}`}>
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link href={`/marka/${slug}?page=${page + 1}`}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-zinc-100 text-zinc-700 hover:border-[#D4AF5A] transition-colors">
                    Sonraki →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
