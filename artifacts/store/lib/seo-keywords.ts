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

const CATEGORY_VARIANTS: Record<string, string[]> = {
  "tül perde": ["tül perde", "tül perdeler", "salon tül perdesi", "yatak odası tül perdesi"],
  "fon perde": ["fon perde", "fon perdeler", "salon fon perdesi", "yatak odası fon perdesi"],
  "stor perde": ["stor perde", "stor perdeler", "stor perde sistemi", "ışık geçirmeyen stor perde"],
  "zebra perde": ["zebra perde", "zebra perdeler", "zebra perde sistemi", "modern zebra perde"],
  "plise perde": ["plise perde", "plise perdeler", "plise perde sistemi", "modern plise perde"],
  "özel ölçü perde": ["özel ölçü perde", "ölçüye göre perde", "perde dikimi", "perde montajı"],
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

function normalizeKeyword(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("tr-TR");
}

/**
 * Product metadata should cover the real long-tail around one product, not
 * thousands of unrelated phrases. Search engines ignore meta-keyword spam;
 * product-derived terms are kept bounded and deduplicated instead.
 */
export function generateProductSearchTerms(options: {
  productName?: string;
  categoryName?: string;
  brandName?: string;
  city?: string;
  barcode?: string | null;
  sku?: string | null;
}): string[] {
  const terms = new Set<string>();
  const add = (value?: string | null) => {
    if (!value) return;
    const normalized = normalizeKeyword(value);
    if (normalized.length >= 2) terms.add(normalized);
  };
  const addPhrase = (...parts: Array<string | null | undefined>) => {
    const phrase = parts.filter(Boolean).join(" ");
    add(phrase);
  };

  const productName = options.productName?.trim();
  const categoryName = options.categoryName?.trim();
  const brandName = options.brandName?.trim();
  const city = options.city?.trim() || "Bursa";
  const categoryKey = categoryName
    ? Object.keys(CATEGORY_VARIANTS).find((term) => {
        const normalized = normalizeKeyword(categoryName);
        return normalized === term || normalized.includes(term);
      })
    : undefined;
  const categoryTerms = categoryKey
    ? CATEGORY_VARIANTS[categoryKey]
    : categoryName
      ? [categoryName]
      : [];

  add(productName);
  add(categoryName);
  add(brandName);
  add(city);

  for (const term of categoryTerms) {
    add(term);
    add(`${term} modelleri`);
    add(`${term} fiyatları`);
    add(`özel ölçü ${term}`);
    add(`${city} ${term}`);
  }

  if (productName) {
    add(`${productName} fiyatı`);
    add(`${productName} modelleri`);
    add(`${productName} satın al`);
    add(`${productName} online`);
    add(`${productName} özel ölçü`);
    add(`${productName} ölçü`);
  }

  if (brandName) {
    addPhrase(brandName, "perde");
    addPhrase(brandName, categoryName);
    addPhrase(brandName, "fiyatları");
  }

  add(`${city} perdeci`);
  add(`${city} perde`);
  add("perde ölçü rehberi");
  add("perde dikimi");
  add("perde montajı");

  if (options.barcode) {
    add(`barkod ${options.barcode}`);
    add(options.barcode);
  }
  if (options.sku) {
    add(`sku ${options.sku}`);
    add(options.sku);
  }

  return Array.from(terms).slice(0, 80);
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
    ...(options?.productName ? generateProductSearchTerms(options) : []),
  ];
  return Array.from(new Set(values.filter(Boolean).map(normalizeKeyword)));
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