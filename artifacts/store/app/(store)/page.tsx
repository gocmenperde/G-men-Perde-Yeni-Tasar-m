// Editorial settings must reflect an admin save immediately.
export const dynamic = "force-dynamic";

import { getLiveSettings } from "@/lib/settings";
import { parseHomepageConfig } from "@/lib/homepage-config";
import { getCachedHomepageBanners, getHomepageCatalog } from "@/lib/homepage-data";
import BookstoreHome from "@/components/store/bookstore-home";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenperde.com.tr"
).replace(/\/$/, "");

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Göçmen Perde",
  url: BASE_URL,
  description:
    "Bursa'da 1993'ten bu yana tül, fon, zebra, stor ve plise perdelerde güvenilir perde mağazası.",
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
  "@type": "HomeGoodsStore",
  "@id": `${BASE_URL}/#business`,
  name: "Göçmen Perde",
  alternateName: ["Göçmen Perde Bursa", "Gocmen Perde", "Göçmen Perde Online"],
  foundingDate: "1993",
  description:
    "1993'ten bu yana Bursa Osmangazi'nde faaliyet gösteren Göçmen Perde; tül, fon, zebra, stor ve plise perdelerde özel ölçü, dikim ve montaj hizmeti sunmaktadır.",
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
  ],
  priceRange: "₺–₺₺",
  currenciesAccepted: "TRY",
  paymentAccepted: "Kredi Kartı, Banka Kartı, Havale/EFT",
  hasMap: "https://maps.google.com/?q=Göçmen+Perde+Bursa",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Perde Ürün Kataloğu",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tül Perdeler", description: "Pileli ve özel ölçü tül perde modelleri" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fon Perdeler", description: "Salon ve yatak odası için fon perde modelleri" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Stor ve Zebra Perdeler", description: "Güneş kontrolü sağlayan m² fiyatlı perde çözümleri" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plise Perdeler", description: "Modern pencereler için plise perde koleksiyonu" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ölçü ve Montaj", description: "Bursa içi ücretsiz ölçü ve profesyonel montaj hizmeti" } },
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
  let curatedProducts: any[] = [];
  let categoryProducts: Record<string, any[]> = {};
  const settings = await getLiveSettings();
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
    curatedProducts = catalog.curated;
    categoryProducts = catalog.categoryProducts;
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
            curatedProducts={curatedProducts}
            categories={categories}
            brands={brandCatalog}
            banners={bannersWithProducts}
            categoryProducts={categoryProducts}
            homepageConfig={settings?.popularSetsJson}
          />
      </div>
    </>
  );
}
