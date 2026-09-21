export const revalidate = false;

import type { Metadata } from "next";
import Link from "next/link";
import {
  BURSA_ILCELER,
  TURKIYE_SEHIRLER,
  generateKeywords,
  WEBSITE_JSONLD,
  LOCAL_BUSINESS_JSONLD,
  SITE_URL,
  SITE_NAME,
} from "@/lib/seo-keywords";
import { MapPin, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Türkiye'ye Kırtasiye Kargo | Göçmen Kırtasiye — Tüm Şehirlere Teslimat",
  description:
    "Göçmen Kırtasiye, Bursa'dan tüm Türkiye'ye kırtasiye teslimatı yapar. Bursa, İstanbul, Ankara, İzmir ve tüm illere kalem, defter, boya, sanat malzemeleri hızlı kargo.",
  keywords: generateKeywords(),
  alternates: { canonical: `${SITE_URL}/kirtasiye` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/kirtasiye`,
    title: "Türkiye'ye Kırtasiye Kargo | Göçmen Kırtasiye",
    description: "Tüm Türkiye'ye online kırtasiye teslimatı. Bursa merkezli, 1993'ten beri güvenilir.",
    siteName: SITE_NAME,
    locale: "tr_TR",
    images: [{ url: `${SITE_URL}/og-image.svg`, width: 1200, height: 630 }],
  },
};

const BURSA_LINKS = ["bursa", ...BURSA_ILCELER];
const DIGER_SEHIRLER = TURKIYE_SEHIRLER.filter((s) => s !== "bursa");

export default function KirtasiyeHubPage() {
  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Kırtasiye Teslimat Bölgeleri", item: `${SITE_URL}/kirtasiye` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />

      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Breadcrumb */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">Kırtasiye Teslimat Bölgeleri</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#B8973E]/10 to-amber-50 dark:from-zinc-900 dark:to-zinc-950 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 text-[#B8973E] mb-3">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Tüm Türkiye'ye Teslimat</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Türkiye'nin Her Şehrine Kırtasiye
            </h1>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Göçmen Kırtasiye, Bursa'dan tüm Türkiye'ye kalem, defter, boya, makas, sanat malzemeleri ve okul
              gereçleri gönderir. Şehrinizi seçin, ürünleri bulun.
            </p>
          </div>
        </section>

        {/* Bursa ve İlçeleri */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Bursa Kırtasiye</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Merkezimizin bulunduğu Bursa ve tüm ilçelerine en hızlı teslimat
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BURSA_LINKS.map((sehir) => (
              <Link
                key={sehir}
                href={`/kirtasiye/${sehir}`}
                className="flex flex-col items-center justify-center text-center gap-1 px-3 py-4 rounded-xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-[#B8973E] hover:text-white hover:border-[#B8973E] transition-all group"
              >
                <MapPin className="w-4 h-4 text-[#B8973E] group-hover:text-white transition-colors" />
                <span className="text-sm font-medium capitalize">
                  {sehir.charAt(0).toUpperCase() + sehir.slice(1)}
                </span>
                <span className="text-xs opacity-70">Kırtasiye</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Diğer İller */}
        <section className="bg-zinc-50 dark:bg-zinc-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Türkiye Geneli Kargo</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">Tüm büyük illere 1-3 iş günü teslimat</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {DIGER_SEHIRLER.map((sehir) => (
                <Link
                  key={sehir}
                  href={`/kirtasiye/${sehir}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#B8973E] hover:text-[#B8973E] transition-all capitalize"
                >
                  <span className="text-sm font-medium">{sehir.charAt(0).toUpperCase() + sehir.slice(1)} Kırtasiye</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Keyword açıklama bölümü — SEO için zengin metin */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h2>Online Kırtasiye Alışverişi — Göçmen Kırtasiye</h2>
            <p>
              <strong>Göçmen Kırtasiye</strong>, 1993 yılından bu yana Bursa merkezli olarak faaliyet gösteren
              Türkiye'nin güvenilir online kırtasiye mağazasıdır. Kalem, defter, makas, silgi, cetvel, boya seti,
              sanat malzemeleri, ofis gereçleri ve okul malzemeleri dahil 5.000'den fazla ürünü uygun fiyatlarla
              sunmaktayız.
            </p>
            <h3>Türkiye'ye Kırtasiye Kargo</h3>
            <p>
              İstanbul kırtasiye, Ankara kırtasiye, İzmir kırtasiye, Antalya kırtasiye, Kocaeli kırtasiye,
              Sakarya kırtasiye, Eskişehir kırtasiye ve daha pek çok ile hızlı kargo ile kırtasiye ürünleri
              gönderiyoruz. Tüm siparişlerde güvenli ödeme, 14 gün iade garantisi sunulmaktadır.
            </p>
            <h3>Ürün Kategorileri</h3>
            <p>
              <strong>Kalemler:</strong> Tükenmez kalem, dolma kalem, keçeli kalem, kurşun kalem, renkli kalem,
              fosforlu kalem — Faber Castell, Staedtler, Pilot, BIC marka seçenekleriyle.{" "}
              <strong>Defterler:</strong> Spiralli defter, sert kapak defter, A4/A5 defter, not defteri, günlük.{" "}
              <strong>Boyalar:</strong> Sulu boya, guaj boya, yağlı boya, pastel boya, akrilik boya.{" "}
              <strong>Sanat Malzemeleri:</strong> Tuval, fırça, palet, eskiz defteri, çizim kalemi.{" "}
              <strong>Ofis Gereçleri:</strong> Dosya, klasör, zımba, delik açacağı, bant, yapıştırıcı.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
