import { catalogDb } from "@/lib/db";
import { serializeProduct, serializeProducts } from "@/lib/serialize";
import { generateKeywords } from "@/lib/seo-keywords";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/store/product-gallery";
import ProductInfo from "@/components/store/product-info";
import ReviewSection from "@/components/store/review-section";
import RelatedProducts from "@/components/store/related-products";
import RecentlyViewed from "@/components/store/recently-viewed";
import ShareButtons from "@/components/store/share-buttons";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ComparisonBar from "@/components/store/comparison-bar";
import { getProductBySlug, getRelatedProducts } from "@/lib/storefront-product";
import { getPublicImageUrl } from "@/lib/image-url";
import MeasureGuide from "@/components/store/measure-guide";

// Ürün sayfaları request-time render edilir; zorunlu statik/ISR üretimi
// crawler'ın her yeni slug için ISR write oluşturmasını engeller.
export const revalidate = 86400;
export const dynamicParams = true;

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenperde.com.tr"
).replace(/\/$/, "");

function buildOgImageUrl(params: {
  title: string;
  price?: number;
  category?: string;
  image?: string;
}) {
  const url = new URL(`${BASE_URL}/api/og`);
  url.searchParams.set("title", params.title);
  if (params.price) url.searchParams.set("price", params.price.toFixed(2));
  if (params.category) url.searchParams.set("category", params.category);
  if (params.image) url.searchParams.set("image", params.image);
  return url.toString();
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  const product = await getProductBySlug(params.slug);

  if (!product) return { title: "Ürün Bulunamadı" };

  const barcodeVal = product.barcode ?? product.sku ?? null;
  const titleBase = product.name;
  const titleBarcode = barcodeVal ? ` | ${barcodeVal}` : "";
  const title = `${product.metaTitle ?? titleBase}${titleBarcode} | Göçmen Perde`;
  const description =
    product.metaDescription ??
    product.description ??
    `${product.name} ${barcodeVal ? `(Barkod: ${barcodeVal})` : ""} — Göçmen Perde'de uygun fiyatla satın al. ${product.brand?.name ? `Marka: ${product.brand.name}.` : ""} ${product.category?.name ? `Kategori: ${product.category.name}.` : ""} Türkiye geneli teslimat.`.trim();

  const firstImage = getPublicImageUrl(product.images?.[0]);

  const ogImage = buildOgImageUrl({
    title: product.name,
    price: Number(product.price),
    category: product.category?.name,
    image: firstImage ?? undefined,
  });

  const canonicalUrl = `${BASE_URL}/products/${product.slug}`;

  return {
    title,
    description,
    keywords: generateKeywords({
      productName: product.name,
      categoryName: product.category?.name,
      brandName: product.brand?.name,
      barcode: product.barcode,
      sku: product.sku,
    }),
    other: {
      // Open Graph Product etiketleri — Facebook/WhatsApp/Slack önizlemesinde
      // fiyat ve stok bilgisi gösterir; bazı SEO araçları da okur.
      "og:type": "product",
      "product:price:amount": Number(product.price).toFixed(2),
      "product:price:currency": "TRY",
      "product:availability": (product.stock ?? 0) > 0 ? "in stock" : "out of stock",
      "product:retailer_item_id": product.sku ?? product.id,
      "product:brand": product.brand?.name ?? "Göçmen Perde",
      "product:category": product.category?.name ?? "Perde",
      "product:condition": "new",
      ...(barcodeVal ? { "product:barcode": barcodeVal, "og:upc": barcodeVal } : {}),
      ...(product.sku ? { "product:sku": product.sku } : {}),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: "Göçmen Perde",
      locale: "tr_TR",
      images: [
        { url: ogImage, width: 800, height: 800, alt: product.name },
        // İkinci görsel olarak gerçek ürün fotoğrafı — sosyal paylaşımlarda daha iyi önizleme
        ...(firstImage && firstImage !== ogImage
          ? [{ url: firstImage, width: 800, height: 800, alt: product.name }]
          : []),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = await paramsPromise;
  const rawProduct = await getProductBySlug(params.slug);

  if (!rawProduct) notFound();

  if (!rawProduct.isActive) notFound();

  const rawRelated = rawProduct.categoryId
    ? await getRelatedProducts(rawProduct.categoryId, rawProduct.id)
    : [];

  const product = serializeProduct(rawProduct);
  const related = serializeProducts(rawRelated, { imageLimit: 2 });

  // JSON-LD structured data for Google Rich Results
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + (r.rating ?? 5), 0) /
        product.reviews.length
      : null;

  const barcodeField = rawProduct.barcode ?? rawProduct.sku ?? null;

  // Schema.org JSON-LD'de gtin8/12/13/14 tümü geçerli (RSS feed'den farklı).
  const isGtin = barcodeField ? /^\d{8,14}$/.test(barcodeField) : false;
  const gtinKey =
    barcodeField?.length === 8  ? "gtin8"  :
    barcodeField?.length === 12 ? "gtin12" :
    barcodeField?.length === 13 ? "gtin13" :
    barcodeField?.length === 14 ? "gtin14" : "gtin";

  // Fiyat: Google schema.org'da price NUMBER ve > 0 olmalı.
  // Number(undefined) = NaN, Number(null) = 0; her ikisi de JSON.stringify'da
  // null'a dönüşür ve Google "offers geçersiz" → "offers/review/aggregateRating
  // belirtilmeli" hatası verir. Bu nedenle fiyatın geçerliliğini kontrol et.
  const priceNum = Math.round(Number(product.price) * 100) / 100;
  const hasValidPrice = isFinite(priceNum) && priceNum > 0;

  // priceValidUntil: 1 yıl geçerli — 30 gün çok kısa, Google geçersiz sayabilir.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Görseller: undefined yerine her zaman dizi ya da alan tamamen eksik.
  const imageList = Array.isArray(product.images)
    ? (product.images as string[]).filter(Boolean)
    : [];

  // description: ürün açıklaması yoksa otomatik oluştur
  const descriptionText =
    product.description ??
    `${product.name}${barcodeField ? ` (Barkod: ${barcodeField})` : ""} — Göçmen Perde'de uygun fiyatla satın al.${product.brand?.name ? ` Marka: ${product.brand.name}.` : ""}${product.category?.name ? ` Kategori: ${product.category.name}.` : ""} Türkiye geneli teslimat imkânı.`;

  // sku: UUID geçersiz sayılabilir; sku varsa kullan, yoksa barkod, yoksa "GK-{id-prefix}"
  const skuValue = product.sku
    ? product.sku
    : barcodeField
    ? barcodeField
    : `GK-${rawProduct.id.slice(0, 8).toUpperCase()}`;

  // validFrom: teklifin başladığı tarih — ürün oluşturma tarihi ya da mevcut tarih
  const validFrom = rawProduct.createdAt
    ? new Date(rawProduct.createdAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const productJsonLd: Record<string, unknown> | null = hasValidPrice ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: descriptionText,
    ...(imageList.length > 0 ? { image: imageList } : {}),
    url: `${BASE_URL}/products/${product.slug}`,
    sku: skuValue,
    ...(isGtin ? { [gtinKey]: barcodeField } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${product.slug}`,
      // price ve priceCurrency yalnızca geçerli fiyat varsa eklenir.
      // price: 0 veya NaN → JSON.stringify null yapar → Google "offers geçersiz" sayar.
      ...(hasValidPrice ? { priceCurrency: "TRY", price: priceNum, priceValidUntil } : {}),
      availability:
        (product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      validFrom,
      seller: {
        "@type": "Organization",
        name: "Göçmen Perde",
        url: BASE_URL,
      },
      // shippingDetails: Google Merchant için zorunlu — Türkiye geneli ücretsiz kargo
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
      // hasMerchantReturnPolicy: Google Merchant için zorunlu — 14 gün iade hakkı
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  } : null;

  // aggregateRating: sayı tiplerinde olmalı (string "5" değil, number 5).
  // ratingValue da number olmalı — string olunca "Yorum snippet'i" hatası alınır.
  if (productJsonLd && avgRating !== null && product.reviews.length >= 1) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      bestRating: 5,
      worstRating: 1,
    };

    // review: her bir yorum ayrıca listelenir — Google "review alanı eksik" uyarısını giderir.
    productJsonLd.review = product.reviews.slice(0, 10).map((r: any) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating ?? 5,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Person",
        name: r.user?.name ?? "Müşteri",
      },
      ...(r.comment ? { reviewBody: r.comment } : {}),
      ...(r.createdAt ? { datePublished: new Date(r.createdAt).toISOString().split("T")[0] } : {}),
    }));
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ürünler",
        item: `${BASE_URL}/products`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${BASE_URL}/kategori/${product.category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.name,
              item: `${BASE_URL}/products/${product.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: `${BASE_URL}/products/${product.slug}`,
            },
          ]),
    ],
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <ComparisonBar />
      {/* Structured data */}
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav
            aria-label="breadcrumb"
            className="flex items-center gap-1.5 text-sm text-zinc-400 flex-wrap"
          >
            <Link href="/" className="hover:text-[#B8973E] transition-colors">
              Ana Sayfa
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link
              href="/products"
              className="hover:text-[#B8973E] transition-colors"
            >
              Ürünler
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <Link
                  href={`/kategori/${product.category.slug}`}
                  className="hover:text-[#B8973E] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-zinc-700 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Gallery — sticky on desktop */}
          <div className="lg:sticky lg:top-24">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <ProductInfo product={product} />
            <div className="border-t border-[#E8E0D5] pt-4">
              <ShareButtons name={product.name} slug={product.slug} />
            </div>
            {(product.requiresWidth || product.requiresHeight || product.isMeter || product.isSquareMeter) && (
              <MeasureGuide />
            )}
          </div>
        </div>

        {/* Reviews + Related */}
        <div className="mt-20 space-y-16">
          <ReviewSection productId={product.id} reviews={product.reviews} />
          {related.length > 0 && <RelatedProducts products={related} />}
        </div>
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed currentId={product.id} />
    </div>
  );
}
