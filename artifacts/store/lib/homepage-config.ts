export type HomepageSectionId =
  | "banner"
  | "brandSignature"
  | "bestsellerBooks"
  | "editorShelf"
  | "categories"
  | "brands"
  | "featured"
  | "dailyDeal"
  | "stationery"
  | "discovery"
  | "perks"
  | "new";

export type HomepageSection = {
  id: HomepageSectionId;
  label: string;
  description: string;
  visible: boolean;
  title: string;
  subtitle: string;
  limit: number;
  productIds: string[];
  categorySlug: string;
};

export type HomepageConfig = {
  version: 2;
  sections: HomepageSection[];
  bannerProductIds: Record<string, string[]>;
};

const SECTION_DEFAULTS: HomepageSection[] = [
  {
    id: "banner",
    label: "Kampanya bannerı",
    description: "Ana sayfanın en üstündeki kayan perde kampanyaları",
    visible: true,
    title: "Kampanya bannerı",
    subtitle: "Her kampanya slaytı aşağıdaki alandan ayrı ayrı düzenlenir.",
    limit: 5,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "bestsellerBooks",
    label: "Haftanın en çok satan kitapları",
    description: "Kitap kataloğu için ayrılmış eski bölüm",
    visible: false,
    title: "Haftanın En Çok Satan Kitapları",
    subtitle: "Bu haftanın okur favorileri.",
    limit: 8,
    productIds: [],
    categorySlug: "kitap",
  },
  {
    id: "brandSignature",
    label: "Marka imza şeridi",
    description: "Mağazanın köklü marka hikâyesini ve güven mesajını taşıyan ince alan",
    visible: true,
    title: "Bursa'dan seçilmiş perdeler.",
    subtitle: "Özel ölçü, profesyonel dikim ve montaj için güvenilir adres.",
    limit: 1,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "editorShelf",
    label: "Haftanın seçtikleri",
    description: "Editörün öne çıkan ürün rafı",
    visible: true,
    title: "Öne çıkan perde modelleri",
    subtitle: "Yaşam alanınıza uyum sağlayan seçili perde modelleri.",
    limit: 5,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "categories",
    label: "Kategori şeridi",
    description: "Kategori kısayolları ve ürün sayıları",
    visible: true,
    title: "Perdede aradığın her şey.",
    subtitle: "İhtiyacına en uygun perde kategorisini keşfet.",
    limit: 8,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "brands",
    label: "Marka kataloğu",
    description: "Marka seçimi ve markaya ait ürün kaydırıcısı",
    visible: false,
    title: "Perde markaları",
    subtitle: "Seçili perde markalarını keşfet.",
    limit: 14,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "featured",
    label: "Öne çıkan ürünler",
    description: "Okur kulübünün seçtiği ürün vitrini",
    visible: true,
    title: "Çok tercih edilen perdeler",
    subtitle: "Göçmen Perde koleksiyonundan öne çıkan ürünleri keşfedin.",
    limit: 8,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "dailyDeal",
    label: "Günün fırsatı",
    description: "En yüksek indirimli aktif ürün için fırsat alanı",
    visible: true,
    title: "Bugünün perde fırsatı",
    subtitle: "Seçili perde modellerinde avantaj. Ölçünüzü alıp inceleyin.",
    limit: 1,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "stationery",
    label: "Perde seçkileri",
    description: "Tül, fon, stor ve dekorasyon kategorileri",
    visible: false,
    title: "Perde seçkileri",
    subtitle: "Bu bölüm perde mağazasında kullanılmaz.",
    limit: 4,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "discovery",
    label: "Moduna göre seçkiler",
    description: "Ders, çizim, masa başı ve hediye kısayolları",
    visible: true,
    title: "İhtiyacına göre perdeyi seç",
    subtitle: "Salon, yatak odası ve gün ışığı için doğru kategoriyi keşfet.",
    limit: 4,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "perks",
    label: "Göçmen güvencesi",
    description: "Paketleme, gönderim ve marka güveni mesajları",
    visible: true,
    title: "Perde alışverişinin her adımı özenli.",
    subtitle: "Göçmen Perde deneyiminin arkasındaki özen.",
    limit: 3,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "new",
    label: "Yeni gelenler",
    description: "Yeni eklenen ürün vitrini",
    visible: true,
    title: "Yeni perde modelleri",
    subtitle: "Koleksiyona yeni katılan perde seçkilerini keşfedin.",
    limit: 8,
    productIds: [],
    categorySlug: "",
  },
];

export function getDefaultHomepageSections(): HomepageSection[] {
  return SECTION_DEFAULTS.map((section) => ({ ...section, productIds: [] }));
}

export function parseHomepageConfig(raw?: string | null): HomepageConfig {
  const defaults = getDefaultHomepageSections();
  let parsed: any = null;

  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  const bannerProductIds =
    parsed?.bannerProductIds &&
    typeof parsed.bannerProductIds === "object" &&
    !Array.isArray(parsed.bannerProductIds)
      ? Object.fromEntries(
          Object.entries(parsed.bannerProductIds)
            .filter(([, ids]) => Array.isArray(ids))
            .map(([bannerId, ids]) => [
              bannerId,
              (ids as unknown[]).filter(
                (id): id is string => typeof id === "string",
              ),
            ]),
        )
      : {};

  if (!parsed?.sections || !Array.isArray(parsed.sections)) {
    const legacyVisibility = {
      featured: parsed?.showFeatured !== false,
      new: parsed?.showNew !== false,
      categories: parsed?.showCategories !== false,
      banner: parsed?.showBanner !== false,
    };
    return {
      version: 2,
      sections: defaults.map((section) => ({
        ...section,
        visible:
          legacyVisibility[section.id as keyof typeof legacyVisibility] ??
          section.visible,
      })),
      bannerProductIds,
    };
  }

  const parsedSections: any[] = parsed.sections;
  const parsedById = new Map<string, any>(parsedSections.map((section) => [section.id, section]));
  const merged = defaults.map((fallback) => {
    const value = parsedById.get(fallback.id);
    if (!value) return fallback;
    return {
      ...fallback,
      ...value,
      id: fallback.id,
      label: fallback.label,
      description: fallback.description,
      visible: value.visible !== false,
      title: typeof value.title === "string" ? value.title : fallback.title,
      subtitle: typeof value.subtitle === "string" ? value.subtitle : fallback.subtitle,
      limit: Math.min(20, Math.max(1, Number(value.limit) || fallback.limit)),
      productIds: Array.isArray(value.productIds)
        ? value.productIds.filter((id: unknown): id is string => typeof id === "string")
        : [],
      categorySlug: typeof value.categorySlug === "string" ? value.categorySlug : fallback.categorySlug,
    };
  });

  const order = new Map(
    parsedSections
      .map((section: any, index: number) => [section.id, index] as const)
      .filter(([id]: readonly [string, number]) => defaults.some((section) => section.id === id)),
  );

  merged.sort((a, b) => (order.get(a.id) ?? defaults.length) - (order.get(b.id) ?? defaults.length));
  return {
    version: 2,
    sections: merged,
    bannerProductIds,
  };
}

export function serializeHomepageConfig(
  sections: HomepageSection[],
  bannerProductIds: Record<string, string[]> = {},
): string {
  return JSON.stringify({ version: 2, sections, bannerProductIds });
}

export function updateBannerProductIds(
  raw: string | null | undefined,
  bannerId: string,
  productIds: string[],
): string {
  let parsed: Record<string, any> = {};
  try {
    const value = raw ? JSON.parse(raw) : {};
    if (value && typeof value === "object" && !Array.isArray(value)) {
      parsed = value;
    }
  } catch {
    parsed = {};
  }

  const current =
    parsed.bannerProductIds &&
    typeof parsed.bannerProductIds === "object" &&
    !Array.isArray(parsed.bannerProductIds)
      ? parsed.bannerProductIds
      : {};

  return JSON.stringify({
    ...parsed,
    version: 2,
    bannerProductIds: {
      ...current,
      [bannerId]: Array.from(new Set(productIds)).slice(0, 4),
    },
  });
}

export function removeBannerProductIds(
  raw: string | null | undefined,
  bannerId: string,
): string | null {
  let parsed: Record<string, any> = {};
  try {
    const value = raw ? JSON.parse(raw) : {};
    if (value && typeof value === "object" && !Array.isArray(value)) {
      parsed = value;
    }
  } catch {
    return raw ?? null;
  }

  if (!parsed.bannerProductIds || typeof parsed.bannerProductIds !== "object") {
    return raw ?? null;
  }

  const { [bannerId]: _removed, ...remaining } = parsed.bannerProductIds;
  return JSON.stringify({
    ...parsed,
    version: 2,
    bannerProductIds: remaining,
  });
}