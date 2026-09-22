// Göçmen Perde için merkezi SEO metinleri.
export const SITE_NAME = "Göçmen Perde";
export const SITE_URL = "https://www.gocmenperde.com.tr";
export const PHONE = "+905462851826";
export const ADDRESS = "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A, Osmangazi, Bursa";

export const URUN_KATEGORILERI = [
  "tül perde",
  "fon perde",
  "stor perde",
  "zebra perde",
  "plise perde",
  "güneşlik",
  "örme tül perde",
  "koltuk örtüsü",
  "özel ölçü perde",
  "perde dikimi",
  "perde montajı",
];

export const MARKALAR = ["göçmen perde", "göçmen perde bursa", "bursa perdeci"];

const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  "tül perde": ["tül perde modelleri", "tül perde fiyatları", "özel ölçü tül perde", "salon tül perde"],
  "fon perde": ["fon perde modelleri", "fon perde fiyatları", "salon fon perde", "yatak odası fon perde"],
  "stor perde": ["stor perde modelleri", "stor perde fiyatları", "ışık geçirmeyen stor perde", "özel ölçü stor perde"],
  "zebra perde": ["zebra perde modelleri", "zebra perde fiyatları", "zebra perde ölçü", "bursa zebra perde"],
  "plise perde": ["plise perde modelleri", "plise perde fiyatları", "plise perde ölçü", "modern pencere perdesi"],
  "özel ölçü perde": ["perde ölçü alma", "perde dikimi", "perde montajı", "bursa özel ölçü perde"],
};

function getCategorySearchTerms(categoryName?: string) {
  if (!categoryName) return [];
  const normalized = categoryName.toLocaleLowerCase("tr-TR").trim();
  const direct = Object.entries(CATEGORY_SEARCH_TERMS).find(([term]) =>
    normalized === term || normalized.includes(term),
  )?.[1];
  if (direct) return direct;
  return [
    `${categoryName} modelleri`,
    `${categoryName} fiyatları`,
    `özel ölçü ${categoryName}`,
  ];
}

export function generateKeywords(options?: {
  productName?: string;
  categoryName?: string;
  brandName?: string;
  city?: string;
  barcode?: string | null;
  sku?: string | null;
}): string[] {
  const values = [
    "göçmen perde",
    "göçmen perde bursa",
    "göçmen perde osmangazi",
    "bursa perdeci",
    "bursa perde fiyatları",
    "perde modelleri",
    "perde fiyatları",
    "perde satın al",
    "online perde",
    "perde ölçü rehberi",
    "özel ölçü perde",
    "perde dikimi",
    "perde montajı",
    ...(options?.categoryName ? getCategorySearchTerms(options.categoryName) : URUN_KATEGORILERI),
    ...(options?.productName ? [options.productName, `${options.productName} fiyatı`] : []),
    ...(options?.categoryName ? [options.categoryName, `${options.categoryName} modelleri`] : []),
    ...(options?.brandName ? [options.brandName, `${options.brandName} perde`] : []),
    ...(options?.city ? [`${options.city} perdeci`, `${options.city} perde`] : []),
    ...(options?.barcode ? [`barkod ${options.barcode}`, options.barcode] : []),
    ...(options?.sku ? [`sku ${options.sku}`] : []),
  ];
  return Array.from(new Set(values.filter(Boolean)));
}

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "HomeGoodsStore",
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  alternateName: ["Göçmen Perde Bursa", "Gocmen Perde", "Göçmen Perde Online"],
  url: SITE_URL,
  telephone: PHONE,
  email: "muhammedemint76@gmail.com",
  foundingDate: "1993",
  description:
    "1993'ten bu yana Bursa Osmangazi'nde faaliyet gösteren Göçmen Perde; tül, fon, zebra, stor ve plise perdelerde özel ölçü, dikim ve montaj hizmeti sunmaktadır.",
  image: `${SITE_URL}/og-image.svg`,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 200, height: 60 },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A",
    addressLocality: "Osmangazi",
    addressRegion: "Bursa",
    postalCode: "16000",
    addressCountry: "TR",
  },
  geo: { "@type": "GeoCoordinates", latitude: "40.1826", longitude: "29.0665" },
  areaServed: [{ "@type": "Country", name: "Türkiye" }, { "@type": "City", name: "Bursa" }],
  priceRange: "₺–₺₺",
  currenciesAccepted: "TRY",
  paymentAccepted: "Kredi Kartı, Banka Kartı, Havale/EFT",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "18:00" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Perde Ürün Kataloğu",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tül Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fon Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Stor ve Zebra Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plise Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ölçü ve Montaj" } },
    ],
  },
};

export const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: "Bursa'nın online perde mağazası",
  inLanguage: "tr-TR",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", "@id": `${SITE_URL}/#logo`, url: `${SITE_URL}/logo.png`, width: 200, height: 60 },
  foundingDate: "1993",
  description: "Bursa merkezli perde mağazası; tül, fon, stor, zebra ve plise perdelerde özel ölçü, dikim ve montaj hizmeti sunar.",
  telephone: PHONE,
  email: "muhammedemint76@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A",
    addressLocality: "Osmangazi",
    addressRegion: "Bursa",
    postalCode: "16000",
    addressCountry: "TR",
  },
};