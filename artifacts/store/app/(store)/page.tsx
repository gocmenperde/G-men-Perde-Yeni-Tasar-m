// Ana sayfa, admin mutation'larının on-demand invalidation'ı ile yenilenir.
export const revalidate = false;

import { getCachedSettings } from "@/lib/settings";
import { parseHomepageConfig } from "@/lib/homepage-config";
import { getCachedHomepageBanners, getHomepageCatalog } from "@/lib/homepage-data";
import BookstoreHome from "@/components/store/bookstore-home";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Göçmen Kırtasiye",
  url: BASE_URL,
  description:
    "Bursa'da 1993'ten bu yana kalem, defter, sanat malzemeleri ve okul gereçlerinde güvenilir kırtasiye mağazası.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "StationeryStore",
  "@id": `${BASE_URL}/#business`,
  name: "Göçmen Kırtasiye",
  alternateName: ["Göçmen Kırtasiye Bursa", "Gocmen Kirtasiye", "Göçmen Kırtasiye Online"],
  foundingDate: "1993",
  description:
    "1993'ten bu yana Bursa Osmangazi'nde faaliyet gösteren Göçmen Kırtasiye; kalem, defter, boya, sanat malzemeleri, okul ve ofis gereçlerinde Türkiye geneline hızlı kargo ile online satış yapmaktadır.",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.png`,
    width: 200,
    height: 60,
  },
  image: `${BASE_URL}/og-image.svg`,
  telephone: "+905462851826",
  email: "muhammedemint76@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A",
    addressLocality: "Osmangazi",
    addressRegion: "Bursa",
    postalCode: "16000",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "40.1826",
    longitude: "29.0665",
  },
  areaServed: [
    { "@type": "Country", name: "Türkiye" },
    { "@type": "City", name: "Bursa" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    BASE_URL,
    "https://www.trendyol.com/magaza/gocmen-perde-kirtasiye-m-1249327",
  ],
  priceRange: "₺–₺₺",
  currenciesAccepted: "TRY",
  paymentAccepted: "Kredi Kartı, Banka Kartı, Havale/EFT",
  hasMap: "https://maps.google.com/?q=Göçmen+Kırtasiye+Bursa",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Kırtasiye Ürün Kataloğu",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Kalemler", description: "Tükenmez, dolma, keçeli, fosforlu ve kurşun kalem çeşitleri" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Defterler", description: "Spiralli, kareli, çizgili, noktalı A4/A5 defter çeşitleri" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Boyalar", description: "Sulu boya, guaj, akrilik, pastel ve kuru boya setleri" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sanat Malzemeleri", description: "Tuval, fırça, palet, resim defteri ve çizim malzemeleri" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Okul Gereçleri", description: "Kalemtıraş, silgi, cetvel, pergel seti, okul çantası" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ofis Malzemeleri", description: "Dosya, klasör, zımba, ataç, not kağıdı, yazıcı kağıdı" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Teknik Çizim", description: "Rotring, Staedtler teknik kalem, pergel seti, çizim tahtası" } },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1000",
    bestRating: "5",
    worstRating: "1",
  },
};

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let categories: any[] = [];
  let newProducts: any[] = [];
  let banners: any[] = [];
  let brandCatalog: any[] = [];
  let bookProducts: any[] = [];
  let curatedProducts: any[] = [];
  const settings = await getCachedSettings().catch(() => null);
  const homepageConfig = parseHomepageConfig(settings?.popularSetsJson);
  const selectedProductIds = Array.from(
    new Set([
      ...homepageConfig.sections.flatMap((section) => section.productIds),
      ...Object.values(homepageConfig.bannerProductIds).flat(),
    ]),
  );

  try {
    const [catalog, activeBanners] = await Promise.all([
      getHomepageCatalog(selectedProductIds),
      getCachedHomepageBanners(),
    ]);
    featuredProducts = catalog.featured;
    newProducts = catalog.newest;
    categories = catalog.categories;
    brandCatalog = catalog.brands;
    bookProducts = catalog.books;
    curatedProducts = catalog.curated;
    banners = activeBanners;
  } catch {}

  const bannersWithProducts = banners.map((banner) => ({
    ...banner,
    productIds: homepageConfig.bannerProductIds[banner.id] ?? [],
  }));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }}
      />
      <div className="relative z-10">
          <BookstoreHome
            products={featuredProducts}
            newProducts={newProducts}
            bookProducts={bookProducts}
            curatedProducts={curatedProducts}
            categories={categories}
            brands={brandCatalog}
            banners={bannersWithProducts}
            homepageConfig={settings?.popularSetsJson}
          />
      </div>
    </>
  );
}
