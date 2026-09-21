// Merkezi SEO kelime kütüphanesi — tüm sayfalarda kullanılır

export const SITE_NAME = "Göçmen Perde";
export const SITE_URL = "https://www.gocmenkirtasiye.com.tr";
export const PHONE = "+905462851826";
export const ADDRESS = "Bursa, Türkiye";

// --- Şehir ve ilçeler ---
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

// --- Ürün kategorileri ---
export const URUN_KATEGORILERI = [
  "tül perde", "fon perde", "stor perde", "zebra perde", "plise perde",
  "güneşlik", "örme tül perde", "koltuk örtüsü", "perde dikimi",
  "özel ölçü perde", "blackout perde", "perde montajı",
];

// --- Marka listesi ---
export const MARKALAR = [
  "göçmen perde", "göçmen perde bursa", "bursa perdeci",
];

// --- Hedef kitle ---
export const HEDEF_KITLE = [
  "ev sahipleri", "iç mimarlar", "ofisler", "salon", "yatak odası",
];

// --- Tüm anahtar kelime kombinasyonları ---
export function generateKeywords(options?: {
  productName?: string;
  categoryName?: string;
  brandName?: string;
  city?: string;
  barcode?: string | null;
  sku?: string | null;
}): string[] {
  const base = [
    // Marka + perde hizmeti
    "göçmen perde",
    "gocmen perde",
    "göçmen perde bursa",
    "göçmen perde osmangazi",
    "göçmen perde iletişim",
    "bursa perdeci",
    "bursa perde fiyatları",

    // Perde ürünleri ve hizmetleri
    "perde modelleri",
    "perde fiyatları",
    "perde satın al",
    "online perde",
    "özel ölçü perde",
    "ücretsiz ölçü perde",
    "perde dikimi",
    "perde montajı",
    "perde keşif hizmeti",
    "tül perde",
    "fon perde",
    "stor perde",
    "zebra perde",
    "plise perde",
    "güneşlik perde",
    "blackout perde",
    "salon perde modelleri",
    "yatak odası perde modelleri",

    // Marka + şehir
    "göçmen kırtasiye",
    "gocmen kirtasiye",
    "göçmen kırtasiye bursa",
    "göçmen kırtasiye online",

    // Genel kırtasiye terimleri
    "kırtasiye",
    "kirtasiye",
    "kırtasiye malzemeleri",
    "kırtasiye ürünleri",
    "kırtasiye fiyatları",
    "online kırtasiye",
    "kırtasiye online satış",
    "ucuz kırtasiye",
    "toptan kırtasiye",
    "kırtasiye satın al",
    "kırtasiye sipariş",
    "kırtasiye indirim",
    "kırtasiye kampanya",
    "en iyi kırtasiye",
    "kırtasiye mağazası",
    "kırtasiye çeşitleri",
    "kaliteli kırtasiye",
    "hızlı kırtasiye teslimat",
    "ücretsiz kargo kırtasiye",
    "kapıda ödeme kırtasiye",

    // Okul sezonu & mevsimsel
    "okul sezonu kırtasiye",
    "okul açılışı kırtasiye",
    "eylül kırtasiye",
    "okul alışverişi",
    "okul listesi",
    "okul listesi malzemeleri",
    "öğrenci malzemeleri",
    "okul açılış indirimi",
    "yeni eğitim yılı",
    "yeni okul yılı malzemeleri",
    "en ucuz okul malzemeleri",
    "okul seti",
    "okul başlangıç seti",
    "öğrenciye özel kırtasiye",
    "çocuklar için kırtasiye",
    "ebeveynler için okul listesi",

    // Bursa şehir bazlı
    "bursa kırtasiye",
    "bursa kırtasiyeci",
    "bursa kırtasiye mağazası",
    "bursa kırtasiye fiyatları",
    "bursa online kırtasiye",
    "bursa ucuz kırtasiye",
    "bursa toptan kırtasiye",
    "bursa kırtasiye malzemeleri",
    "bursa okul gereçleri",
    "bursa okul malzemeleri",
    "bursa ofis malzemeleri",
    "bursa sanat malzemeleri",

    // Bursa ilçe bazlı
    "nilüfer kırtasiye",
    "nilüfer kırtasiye mağazası",
    "osmangazi kırtasiye",
    "yıldırım kırtasiye",
    "gemlik kırtasiye",
    "inegöl kırtasiye",
    "mudanya kırtasiye",
    "gürsu kırtasiye",
    "orhangazi kırtasiye",
    "karacabey kırtasiye",
    "mustafakemalpaşa kırtasiye",
    "iznik kırtasiye",

    // Kalem kategorisi
    "kalem",
    "tükenmez kalem",
    "dolma kalem",
    "keçeli kalem",
    "ince uçlu kalem",
    "siyah kalem",
    "kurşun kalem",
    "renkli kalem",
    "fosforlu kalem",
    "işaretleme kalemi",
    "beyaz tahta kalemi",
    "permanent kalem",
    "asetat kalemi",
    "kaligrafi kalemi",
    "fude kalem",
    "bursa kalem",
    "online kalem satın al",
    "ucuz kalem",
    "toptan kalem",

    // Defter kategorisi
    "defter",
    "spiralli defter",
    "sert kapak defter",
    "çizgili defter",
    "kareli defter",
    "noktalı defter",
    "düz defter",
    "a4 defter",
    "a5 defter",
    "b5 defter",
    "okul defteri",
    "not defteri",
    "günlük defter",
    "ajanda",
    "planlayıcı",
    "moleskine defter",
    "leuchtturm defter",
    "bursa defter",
    "online defter satın al",

    // Makas kategorisi
    "makas",
    "kağıt makas",
    "ofis makası",
    "öğrenci makası",
    "yuvarlak uç makas",
    "terzi makası",
    "sanat makası",
    "bursa makas",

    // Boya kategorisi
    "boya",
    "sulu boya",
    "guaj boya",
    "yağlı boya",
    "boya kalemi",
    "keçeli boya",
    "pastel boya",
    "kuru boya",
    "mum boya",
    "parmak boyası",
    "çocuk boyası",
    "sanatçı boyası",
    "akrilik boya",
    "boyama seti",
    "boyama kitabı",
    "çocuk boyama",
    "bursa boya malzemeleri",
    "online boya satın al",

    // Silgi kategorisi
    "silgi",
    "kalem silgisi",
    "beyaz silgi",
    "plastik silgi",
    "kauçuk silgi",
    "büyük silgi",
    "mini silgi",
    "staedtler silgi",
    "faber castell silgi",

    // Cetvel / pergel
    "cetvel",
    "30 cm cetvel",
    "metal cetvel",
    "şeffaf cetvel",
    "pergel",
    "pergel seti",
    "matematik seti",
    "geometri seti",
    "gönye",
    "iletki",
    "açıölçer",

    // Ofis malzemeleri
    "ofis malzemeleri",
    "ofis kırtasiye",
    "ofis gereçleri",
    "ofis kağıdı",
    "yazıcı kağıdı",
    "a4 kağıt",
    "zımba",
    "zımba teli",
    "delik açacağı",
    "ataç",
    "raptiye",
    "binder klip",
    "dosya",
    "klasör",
    "poşet dosya",
    "telli dosya",
    "askılı dosya",
    "a4 klasör",
    "karton klasör",
    "not kağıdı",
    "yapışkan not",
    "post-it",
    "etiket",

    // Okul gereçleri
    "okul gereçleri",
    "okul malzemeleri",
    "okul alışverişi",
    "okul sezonu kırtasiye",
    "okul çantası",
    "kalem kutusu",
    "kalemlik",
    "kalemtıraş",
    "pergel seti",
    "açıölçer",
    "ilkokul malzemeleri",
    "ortaokul malzemeleri",
    "lise malzemeleri",
    "üniversite kırtasiye",
    "anaokulu malzemeleri",
    "anaokulu kırtasiye",
    "öğrenci kırtasiye",

    // Sanat malzemeleri
    "sanat malzemeleri",
    "resim malzemeleri",
    "çizim malzemeleri",
    "sanatçı malzemeleri",
    "tuval",
    "fırça",
    "palet",
    "resim defteri",
    "eskiz defteri",
    "çizim kalemi",
    "grafik tablet",
    "suluboya kağıdı",

    // Bant / yapıştırıcı
    "bant",
    "selofan bant",
    "çift taraflı bant",
    "koli bandı",
    "maskeleme bandı",
    "bant dispenseri",
    "yapıştırıcı",
    "tutkal",
    "prit",
    "uhu",
    "stick yapıştırıcı",
    "sıvı tutkal",
    "zamk",
    "çift taraflı köpük bant",

    // Marka bazlı — uzun kuyruklu aramalar
    "faber castell",
    "faber castell kalem",
    "faber castell boya",
    "faber castell silgi",
    "faber castell kalem seti",
    "faber castell suluboya",
    "faber castell 24 renk",
    "faber castell 36 renk",
    "faber castell goldfaber",
    "faber castell grip",
    "staedtler",
    "staedtler kalem",
    "staedtler silgi",
    "staedtler pergel",
    "staedtler fineliner",
    "staedtler triplus",
    "staedtler mars",
    "pelikan",
    "pelikan kalem",
    "pelikan boya",
    "pelikan dolma kalem",
    "pelikan m200",
    "pelikan m205",
    "bic",
    "bic kalem",
    "bic cristal",
    "pilot kalem",
    "pilot g2",
    "rotring",
    "rotring rapidograph",
    "rotring teknik kalem",
    "pentel",
    "pentel energel",
    "lyra boya",
    "lyra renkli kalem",
    "giotto",
    "giotto boya",
    "maped",
    "maped pergel",
    "koh-i-noor",
    "moleskine",
    "moleskine defter fiyatı",
    "oxford defter",
    "oxford kareli defter",

    // Intent-based (niyet bazlı) aramalar
    "kırtasiye nerede satın alınır",
    "en iyi kırtasiye mağazası",
    "güvenilir kırtasiye sitesi",
    "orijinal kırtasiye ürünleri",
    "kırtasiye ürünleri toptan satış",
    "kırtasiye fatura kesiyorlar mı",
    "kırtasiye kurumsal satış",
    "kırtasiye okul sözleşmesi",
    "kırtasiye ücretsiz kargo nerede",
    "kırtasiye kapıda ödeme nerede",
    "hangi kırtasiye sitesi güvenilir",
    "online kırtasiye alışveriş",

    // Teknik çizim & sanat
    "teknik çizim malzemeleri",
    "mimarlık çizim seti",
    "teknik kalem seti",
    "rapidograf kalem",
    "cizim seti",
    "suluboya kağıdı fiyatı",
    "yağlı boya seti",
    "akrilik boya seti",
    "sanat seti çocuklar için",
    "resim seti okul",

    // Okul sezonu uzun kuyruklu
    "ilkokul 1. sınıf okul listesi",
    "ilkokul okul malzemeleri listesi",
    "ortaokul kırtasiye listesi",
    "lise kırtasiye listesi",
    "üniversite kırtasiye seti",
    "kalemtıraş çeşitleri fiyatları",
    "silgi çeşitleri ve fiyatları",
    "en iyi okul kalemi",
    "çocuklar için en iyi boya kalemi",
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
      `toptan ${options.categoryName}`,
      `en iyi ${options.categoryName}`,
      `kaliteli ${options.categoryName}`,
      `${options.categoryName} nerede alınır`,
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
      `${options.brandName} kırtasiye`,
      `${options.brandName} göçmen kırtasiye`,
      `${options.brandName} türkiye`,
      `${options.brandName} online`,
      `${options.brandName} indirim`,
    );
  }

  if (options?.city) {
    const city = options.city;
    extras.push(
      `${city} kırtasiye`,
      `${city} kırtasiye mağazası`,
      `${city} online kırtasiye`,
      `${city} ucuz kırtasiye`,
      `${city} toptan kırtasiye`,
      `${city} okul malzemeleri`,
      `${city} ofis malzemeleri`,
      `${city} sanat malzemeleri`,
      `${city} kalem`,
      `${city} defter`,
      `${city} okul gereçleri`,
    );
  }

  // Barkod / SKU — Google'da barkod araması yapıldığında üst sıralara çıkar
  if (options?.barcode) {
    extras.push(
      options.barcode,
      `barkod ${options.barcode}`,
      `${options.barcode} fiyatı`,
      `${options.barcode} satın al`,
      `${options.barcode} göçmen kırtasiye`,
      `ürün barkod ${options.barcode}`,
      `${options.barcode} nedir`,
      `${options.barcode} hangi ürün`,
      `${options.barcode} kırtasiye`,
      `ean ${options.barcode}`,
      `gtin ${options.barcode}`,
    );
  }
  if (options?.sku && options.sku !== options.barcode) {
    extras.push(
      options.sku,
      `sku ${options.sku}`,
      `${options.sku} fiyatı`,
      `${options.sku} satın al`,
      `${options.sku} kırtasiye`,
    );
  }

  // Ürün adı + barkod kombinasyonu
  if (options?.productName && options?.barcode) {
    extras.push(
      `${options.productName} barkod`,
      `${options.productName} ${options.barcode}`,
      `${options.productName} ean`,
    );
  }

  return [...new Set([...base, ...extras])].filter(
    (keyword) => !/(kırtasiye|kirtasiye|kalem|defter|okul|öğrenci|boya|ofis malzemeleri)/i.test(keyword),
  );
}

// LocalBusiness JSON-LD şeması
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
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/og-image.svg`,
    width: 1200,
    height: 630,
  },
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
  areaServed: {
    "@type": "Country",
    name: "Türkiye",
  },
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
    name: "Perde Ürün Kataloğu",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tül Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fon Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Stor Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Zebra Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plise Perdeler" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ücretsiz Ölçü ve Montaj" } },
    ],
  },
  sameAs: [
    `${SITE_URL}`,
    "https://www.trendyol.com/magaza/gocmen-perde-kirtasiye-m-1249327",
  ],
};

// WebSite JSON-LD (arama kutusu Google'da görünür)
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
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Organization JSON-LD
export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#logo`,
    url: `${SITE_URL}/og-image.svg`,
    contentUrl: `${SITE_URL}/og-image.svg`,
    width: 1200,
    height: 630,
    caption: SITE_NAME,
  },
  image: {
    "@type": "ImageObject",
    url: `${SITE_URL}/og-image.svg`,
    width: 1200,
    height: 630,
  },
  foundingDate: "1993",
  description: "1993'ten bu yana Bursa Osmangazi merkezli kırtasiye, okul ve sanat malzemeleri perakendecisi. Türkiye geneline hızlı kargo.",
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
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: PHONE,
      contactType: "customer service",
      availableLanguage: "Turkish",
      areaServed: "TR",
    },
  ],
  sameAs: [
    SITE_URL,
    "https://www.trendyol.com/magaza/gocmen-perde-kirtasiye-m-1249327",
  ],
};

// Şehir sayfaları için benzersiz içerik şablonu
export function getCityPageData(sehir: string) {
  const formattedCity = sehir.charAt(0).toUpperCase() + sehir.slice(1);
  const isBursa = sehir.toLowerCase() === "bursa" || BURSA_ILCELER.includes(sehir.toLowerCase());

  return {
    title: `${formattedCity} Kırtasiye | Göçmen Kırtasiye — Online Kırtasiye Mağazası`,
    description: `${formattedCity} kırtasiye ihtiyaçlarınız için doğru adres! Kalem, defter, makas, boya ve sanat malzemeleri ${formattedCity}'${isBursa ? "den" : "den"} kapınıza kadar. Ücretsiz kargo, hızlı teslimat.`,
    h1: `${formattedCity} Kırtasiye`,
    h2: `${formattedCity}'de Kırtasiye Ürünleri Online`,
    intro: `${formattedCity} ve çevresine ücretsiz kargo ile kırtasiye teslimatı yapıyoruz. Göçmen Kırtasiye olarak 1993'ten bu yana Bursa merkezli olmakla birlikte tüm Türkiye'ye, özellikle ${formattedCity} bölgesine hızlı ve güvenli teslimat sağlıyoruz.`,
    keywords: generateKeywords({ city: sehir }),
    faqs: [
      {
        soru: `${formattedCity}'de kırtasiye siparişi nasıl verebilirim?`,
        cevap: `Sitemizden seçtiğiniz ürünleri sepete ekleyip ödeme adımını tamamlayabilirsiniz. ${formattedCity} adresinize hızlı kargo ile teslim ediyoruz.`,
      },
      {
        soru: `${formattedCity}'ye kargo süresi ne kadar?`,
        cevap: `${formattedCity}'ye ortalama 1-3 iş günü içinde teslimat yapılmaktadır. 500₺ üzeri siparişlerde kargo ücretsizdir.`,
      },
      {
        soru: `${formattedCity}'de hangi kırtasiye ürünleri mevcut?`,
        cevap: `Kalem, defter, silgi, makas, cetvel, boya seti, sanat malzemeleri, ofis gereçleri ve okul malzemeleri dahil 5.000'den fazla ürün ${formattedCity}'ye kapıda teslim seçeneğiyle sipariş edilebilir.`,
      },
      {
        soru: `${formattedCity} kırtasiye fiyatları nasıl?`,
        cevap: `Göçmen Kırtasiye olarak ${formattedCity} ve Türkiye genelinde rekabetçi fiyatlar sunuyoruz. Faber Castell, Staedtler, Pelikan gibi markaları uygun fiyatla bulabilirsiniz.`,
      },
    ],
  };
}
