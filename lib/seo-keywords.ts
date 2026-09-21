export const SITE_NAME = "Göçmen Kırtasiye";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.gocmenkirtasiye.com.tr";

export const PHONE = "+90 224 XXX XX XX";
export const ADDRESS = "Bursa, Türkiye";

export const BURSA_ILCELER = [
  "nilüfer", "osmangazi", "yıldırım", "gemlik", "inegöl",
  "mudanya", "gürsu", "orhangazi", "karacabey", "mustafakemalpaşa",
  "iznik", "büyükorhan", "harmancık", "keles", "orhaneli",
];

export const TURKIYE_SEHIRLER = [
  "istanbul", "ankara", "izmir", "antalya", "adana", "konya",
  "gaziantep", "kocaeli", "mersin", "diyarbakır", "bursa",
  "sakarya", "balıkesir", "eskişehir", "çanakkale", "tekirdağ",
  "manisa", "samsun", "malatya", "kayseri",
];

export const URUN_KATEGORILERI = [
  "kalem", "defter", "silgi", "makas", "cetvel", "pergel",
  "boya", "boyama", "bant", "yapıştırıcı", "dosya", "klasör",
  "zımba", "kalemtıraş", "okul çantası", "kalemlik", "not defteri",
  "çizim malzemeleri", "sanat malzemeleri", "resim malzemeleri",
  "okul seti", "öğrenci malzemeleri", "sanat seti", "çizim seti",
];

export const MARKALAR = [
  "faber castell", "staedtler", "pelikan", "bic", "pilot",
  "rotring", "pentel", "lyra", "giotto", "koh-i-noor",
  "derwent", "moleskine", "oxford", "mead", "leuchtturm",
  "winsor newton", "maped", "conte", "prismacolor", "caran d'ache",
];

export function generateKeywords(options?: {
  productName?: string;
  categoryName?: string;
  brandName?: string;
  city?: string;
  barcode?: string | null;
  sku?: string | null;
}): string[] {
  const base = [
    "göçmen kırtasiye", "gocmen kirtasiye", "göçmen kırtasiye bursa",
    "göçmen kırtasiye online", "kırtasiye", "kirtasiye", "kırtasiye malzemeleri",
    "kırtasiye ürünleri", "kırtasiye fiyatları", "online kırtasiye",
    "kırtasiye online satış", "ucuz kırtasiye", "toptan kırtasiye",
    "kırtasiye satın al", "kırtasiye sipariş", "kırtasiye indirim",
    "kırtasiye kampanya", "en iyi kırtasiye", "kırtasiye mağazası",
    "kırtasiye çeşitleri", "kaliteli kırtasiye", "hızlı kırtasiye teslimat",
    "ücretsiz kargo kırtasiye", "kapıda ödeme kırtasiye",
    "okul sezonu kırtasiye", "okul açılışı kırtasiye", "okul alışverişi",
    "okul listesi", "öğrenci malzemeleri", "okul açılış indirimi",
    "yeni eğitim yılı", "en ucuz okul malzemeleri", "okul seti",
    "bursa kırtasiye", "bursa kırtasiyeci", "bursa kırtasiye mağazası",
    "bursa kırtasiye fiyatları", "bursa online kırtasiye",
    "bursa okul gereçleri", "bursa okul malzemeleri", "bursa ofis malzemeleri",
    "nilüfer kırtasiye", "osmangazi kırtasiye", "yıldırım kırtasiye",
    "kalem", "tükenmez kalem", "dolma kalem", "keçeli kalem", "kurşun kalem",
    "renkli kalem", "fosforlu kalem", "beyaz tahta kalemi",
    "defter", "spiralli defter", "sert kapak defter", "not defteri",
    "a4 defter", "okul defteri", "ajanda", "planlayıcı",
    "boya", "sulu boya", "guaj boya", "yağlı boya", "boya kalemi",
    "pastel boya", "kuru boya", "mum boya", "çocuk boyası", "akrilik boya",
    "silgi", "makas", "cetvel", "pergel", "pergel seti", "matematik seti",
    "ofis malzemeleri", "ofis kağıdı", "a4 kağıt", "zımba", "dosya", "klasör",
    "okul gereçleri", "okul malzemeleri", "okul çantası", "kalemtıraş",
    "sanat malzemeleri", "resim malzemeleri", "çizim malzemeleri", "tuval", "fırça",
    "faber castell", "faber castell kalem", "faber castell boya",
    "staedtler", "staedtler kalem", "staedtler silgi",
    "pelikan", "pelikan kalem", "pelikan boya",
    "bic", "pilot kalem", "rotring", "pentel", "lyra", "giotto", "maped",
    "online kırtasiye alışveriş", "güvenilir kırtasiye sitesi",
    "kırtasiye kurumsal satış", "ücretsiz kargo kırtasiye",
  ];

  const extras: string[] = [];

  if (options?.productName) {
    extras.push(
      options.productName,
      `${options.productName} satın al`,
      `${options.productName} fiyatı`,
      `${options.productName} bursa`,
      `ucuz ${options.productName}`,
      `en iyi ${options.productName}`,
    );
  }
  if (options?.categoryName) {
    extras.push(
      `bursa ${options.categoryName}`,
      `online ${options.categoryName}`,
      `ucuz ${options.categoryName}`,
      `${options.categoryName} fiyatları`,
      `${options.categoryName} satın al`,
      `${options.categoryName} çeşitleri`,
      `${options.categoryName} göçmen kırtasiye`,
    );
  }
  if (options?.brandName) {
    extras.push(
      options.brandName,
      `${options.brandName} ürünleri`,
      `${options.brandName} fiyatları`,
      `${options.brandName} satın al`,
      `${options.brandName} bursa`,
      `orijinal ${options.brandName}`,
      `${options.brandName} göçmen kırtasiye`,
    );
  }
  if (options?.city) {
    const city = options.city;
    extras.push(
      `${city} kırtasiye`, `${city} kırtasiye mağazası`,
      `${city} online kırtasiye`, `${city} ucuz kırtasiye`,
      `${city} okul malzemeleri`, `${city} ofis malzemeleri`,
      `${city} sanat malzemeleri`, `${city} kalem`, `${city} defter`,
    );
  }
  if (options?.barcode) {
    extras.push(
      options.barcode,
      `barkod ${options.barcode}`,
      `${options.barcode} fiyatı`,
      `${options.barcode} satın al`,
      `${options.barcode} göçmen kırtasiye`,
      `ean ${options.barcode}`,
      `gtin ${options.barcode}`,
    );
  }
  if (options?.sku && options.sku !== options.barcode) {
    extras.push(
      options.sku,
      `sku ${options.sku}`,
      `${options.sku} fiyatı`,
      `${options.sku} kırtasiye`,
    );
  }

  return [...new Set([...base, ...extras])];
}

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "StationeryStore",
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  alternateName: ["Göçmen Kırtasiye Bursa", "Gocmen Kirtasiye"],
  url: SITE_URL,
  telephone: PHONE,
  foundingDate: "1993",
  description:
    "Bursa'da 1993'ten bu yana faaliyet gösteren Göçmen Kırtasiye; kalem, defter, boya, sanat malzemeleri ve okul gereçlerinde Türkiye geneline online satış yapmaktadır.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bursa",
    addressRegion: "Bursa",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "40.1885",
    longitude: "29.0610",
  },
  areaServed: { "@type": "Country", name: "Türkiye" },
  priceRange: "₺₺",
  currenciesAccepted: "TRY",
  paymentAccepted: "Kredi Kartı, Banka Havalesi, Kapıda Ödeme",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Kırtasiye Ürün Kataloğu",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Kalemler" },
      { "@type": "OfferCatalog", name: "Defterler" },
      { "@type": "OfferCatalog", name: "Boyalar" },
      { "@type": "OfferCatalog", name: "Sanat Malzemeleri" },
      { "@type": "OfferCatalog", name: "Ofis Malzemeleri" },
    ],
  },
  sameAs: [
    SITE_URL,
    "https://www.trendyol.com/magaza/gocmen-perde-kirtasiye-m-1249327",
  ],
};

export const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: "Türkiye'nin Online Kırtasiye Mağazası",
  inLanguage: "tr-TR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/og-image.jpg`,
    width: 1200,
    height: 630,
  },
  foundingDate: "1993",
  description:
    "1993'ten bu yana Bursa merkezli kırtasiye, okul ve sanat malzemeleri perakendecisi.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bursa",
    addressCountry: "TR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Turkish",
    areaServed: "TR",
  },
};
