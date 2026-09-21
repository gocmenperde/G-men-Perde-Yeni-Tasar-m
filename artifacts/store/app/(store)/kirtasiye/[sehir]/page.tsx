export const revalidate = false;

import type { Metadata } from "next";
import Link from "next/link";
import { catalogDb } from "@/lib/db";
import { serializeProducts } from "@/lib/serialize";
import ProductCard from "@/components/store/product-card";
import {
  BURSA_ILCELER,
  TURKIYE_SEHIRLER,
  getCityPageData,
  LOCAL_BUSINESS_JSONLD,
  SITE_URL,
} from "@/lib/seo-keywords";
import { ChevronRight, MapPin, Truck, Shield, Star } from "lucide-react";

const ALL_SEHIRLER = [
  "bursa",
  ...BURSA_ILCELER,
  ...TURKIYE_SEHIRLER.filter((s) => s !== "bursa"),
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sehir: string }>;
}): Promise<Metadata> {
  const { sehir } = await params;
  const data = getCityPageData(sehir);
  const canonicalUrl = `${SITE_URL}/kirtasiye/${sehir}`;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: data.title,
      description: data.description,
      siteName: "Göçmen Kırtasiye",
      locale: "tr_TR",
      images: [{ url: `${SITE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
    },
  };
}

export default async function SehirKirtasiyePage({
  params,
}: {
  params: Promise<{ sehir: string }>;
}) {
  const { sehir } = await params;
  const data = getCityPageData(sehir);
  const formattedCity =
    sehir.charAt(0).toUpperCase() + sehir.slice(1);

  let serialized: ReturnType<typeof serializeProducts> = [];
  try {
    const products = await catalogDb.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 12,
      include: { category: true, brand: true },
    });
    serialized = serializeProducts(products, { imageLimit: 2 });
  } catch (error) {
    // Allow ISR to create the shell in environments that provision the DB
    // after the build. Real database errors still fail loudly.
    if (!(error instanceof Error && /does not exist/i.test(error.message))) {
      throw error;
    }
  }

  const canonicalUrl = `${SITE_URL}/kirtasiye/${sehir}`;

  const localBusinessJson = {
    ...LOCAL_BUSINESS_JSONLD,
    areaServed: [
      { "@type": "Country", name: "Türkiye" },
      { "@type": "City", name: formattedCity },
    ],
  };

  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Kırtasiye", item: `${SITE_URL}/kirtasiye` },
      { "@type": "ListItem", position: 3, name: `${formattedCity} Kırtasiye`, item: canonicalUrl },
    ],
  };

  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.soru,
      acceptedAnswer: { "@type": "Answer", text: f.cevap },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />

      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Breadcrumb */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/kirtasiye" className="hover:text-[#B8973E] transition-colors">Kırtasiye</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">{formattedCity} Kırtasiye</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#B8973E]/10 via-white to-amber-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 text-[#B8973E] mb-3">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">{formattedCity}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              {data.h1}
            </h1>
            <h2 className="text-xl text-zinc-600 dark:text-zinc-300 mb-6">
              {data.h2}
            </h2>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
              {data.intro}
            </p>

            {/* Güvence ikonları */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Truck, label: "Hızlı Teslimat" },
                { icon: Shield, label: "Güvenli Ödeme" },
                { icon: Star, label: "1993'ten Beri Güvenilir" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <Icon className="w-4 h-4 text-[#B8973E]" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ürünler */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {formattedCity} İçin Popüler Kırtasiye Ürünleri
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            {formattedCity} adresinize hızla ulaşan ürünler
          </p>

          {serialized.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {serialized.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">Ürünler yükleniyor…</p>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#B8973E] hover:bg-[#D4AF5A] text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Tüm Ürünleri Gör
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Kategori İç Linkleme */}
        <section className="bg-zinc-50 dark:bg-zinc-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
              {formattedCity} Kırtasiye Kategorileri
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: "Kalemler", href: "/kategori/kalemler" },
                { label: "Defterler", href: "/kategori/defterler" },
                { label: "Boyalar", href: "/kategori/boyalar" },
                { label: "Makas & Kesici", href: "/kategori/makas" },
                { label: "Sanat Malzemeleri", href: "/kategori/sanat" },
                { label: "Ofis Gereçleri", href: "/kategori/ofis" },
                { label: "Okul Gereçleri", href: "/kategori/okul" },
                { label: "Silgi & Kalemtıraş", href: "/kategori/silgi" },
                { label: "Dosya & Klasör", href: "/kategori/dosya" },
                { label: "Bant & Yapıştırıcı", href: "/kategori/bant" },
                { label: "Çizim Araçları", href: "/kategori/cizim" },
                { label: "Tüm Ürünler", href: "/products" },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="flex items-center justify-center text-center text-sm font-medium px-3 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#B8973E] hover:text-[#B8973E] transition-all"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SSS / FAQ */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
            {formattedCity} Kırtasiye Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{faq.soru}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.cevap}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Diğer Şehirler / İç Linkleme */}
        <section className="bg-zinc-50 dark:bg-zinc-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
              Diğer Şehirlere de Kargo Gönderiyoruz
            </h2>
            <div className="flex flex-wrap gap-2">
              {ALL_SEHIRLER.filter((s) => s !== sehir).slice(0, 24).map((citySlug) => (
                <Link
                  key={citySlug}
                  href={`/kirtasiye/${citySlug}`}
                  className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-[#B8973E] hover:border-[#B8973E] transition-colors capitalize"
                >
                  {citySlug.charAt(0).toUpperCase() + citySlug.slice(1)} Kırtasiye
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
