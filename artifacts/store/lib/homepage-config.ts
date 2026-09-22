export type HomepageSectionId =
  | "banner"
  | "brandSignature"
  | "editorShelf"
  | "categories"
  | "brands"
  | "story"
  | "projects"
  | "reviews"
  | "inspiration"
  | "featured"
  | "dailyDeal"
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

export type EditorialMediaKind = "projects" | "inspiration";

export type EditorialMediaItem = {
  id: string;
  imageUrl: string;
  alt: string;
  label: string;
  visible: boolean;
};

export type EditorialMedia = Record<EditorialMediaKind, EditorialMediaItem[]>;

export type HomepageConfig = {
  version: 2;
  sections: HomepageSection[];
  bannerProductIds: Record<string, string[]>;
  editorialMedia: EditorialMedia;
};

export const DEFAULT_EDITORIAL_MEDIA: EditorialMedia = {
  projects: [
    { id: "project-foto6", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto6.jpg", alt: "Bursa salon perde uygulaması", label: "Salon uygulaması", visible: true },
    { id: "project-foto8", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto8.jpg", alt: "Nilüfer zebra ve fon perde uygulaması", label: "Zebra & fon", visible: true },
    { id: "project-foto11", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto11.jpg", alt: "Yatak odası perde dönüşümü", label: "Yatak odası", visible: true },
    { id: "project-foto1", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto1.jpg", alt: "Çekirge fon perde uygulaması", label: "Fon perde", visible: true },
    { id: "project-foto3", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto3.jpg", alt: "Görükle oturma odası uygulaması", label: "Oturma odası", visible: true },
    { id: "project-foto5", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto5.jpg", alt: "Mudanya tül perde uygulaması", label: "Tül perde", visible: true },
  ],
  inspiration: [
    { id: "inspiration-foto1", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto1.jpg", alt: "Salon tül perde uygulaması", label: "Salon tül", visible: true },
    { id: "inspiration-foto2", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto2.jpg", alt: "Zebra perde montajı", label: "Zebra sistem", visible: true },
    { id: "inspiration-foto9", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472202/gocmenperde/gocmenperde/foto9.jpg", alt: "Yatak odası fon perde uygulaması", label: "Fon kombin", visible: true },
    { id: "inspiration-foto10", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto10.jpg", alt: "Balkon plise perde uygulaması", label: "Plise alan", visible: true },
    { id: "inspiration-foto11", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto11.jpg", alt: "Ofis stor perde uygulaması", label: "Ofis stor", visible: true },
    { id: "inspiration-foto3", imageUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472200/gocmenperde/gocmenperde/foto3.jpg", alt: "Çocuk odası perde uygulaması", label: "Çocuk odası", visible: true },
  ],
};

function parseEditorialMedia(raw: any): EditorialMedia {
  const result = {} as EditorialMedia;
  for (const kind of ["projects", "inspiration"] as EditorialMediaKind[]) {
    const source = raw?.[kind];
    result[kind] = Array.isArray(source)
      ? source
          .map((item: any, index: number) => ({
            id: typeof item?.id === "string" && item.id.trim() ? item.id : `${kind}-${index + 1}`,
            imageUrl: typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "",
            alt: typeof item?.alt === "string" ? item.alt.trim() : "",
            label: typeof item?.label === "string" ? item.label.trim() : "",
            visible: item?.visible !== false,
          }))
          .filter((item: EditorialMediaItem) => Boolean(item.imageUrl))
      : DEFAULT_EDITORIAL_MEDIA[kind].map((item) => ({ ...item }));
  }
  return result;
}

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
    label: "Öne çıkan perde modelleri",
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
    visible: true,
    title: "Perde markaları",
    subtitle: "Seçili perde markalarını keşfet.",
    limit: 14,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "story",
    label: "Hikâyemiz",
    description: "Göçmen Perde'nin Bursa'dan başlayan hikâyesi",
    visible: true,
    title: "Göçmen Perde: 30 yıllık bir hikâye",
    subtitle: "Bursa Osmangazi'nde başlayan perde deneyimimizi doğru ölçü, özenli dikim ve profesyonel montajla sürdürüyoruz.",
    limit: 1,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "projects",
    label: "Sizden Gelenler",
    description: "Gerçek müşteri evlerinden uygulama fotoğrafları",
    visible: true,
    title: "Sizden Gelenler",
    subtitle: "Göçmen Perde uygulamaları sonrası paylaşılan gerçek müşteri fotoğrafları.",
    limit: 6,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "reviews",
    label: "Müşterilerimiz Anlatıyor",
    description: "Müşteri deneyimleri ve Google yorumları",
    visible: true,
    title: "Müşterilerimiz Anlatıyor",
    subtitle: "Ölçüden montaja kadar yaşanan gerçek deneyimler.",
    limit: 3,
    productIds: [],
    categorySlug: "",
  },
  {
    id: "inspiration",
    label: "Uygulama & İlham Alanı",
    description: "Perde uygulamalarından ilham veren seçki",
    visible: true,
    title: "Uygulama & İlham Alanı",
    subtitle: "Farklı odalar ve pencere tipleri için tamamlanan perde uygulamalarına göz atın.",
    limit: 6,
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
    id: "discovery",
    label: "Odaya göre perde seçkileri",
    description: "Salon, yatak odası ve gün ışığı için perde kısayolları",
    visible: true,
    title: "Odanıza uygun perdeyi seçin",
    subtitle: "Salon, yatak odası ve gün ışığı için doğru perde kategorisini keşfedin.",
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
      editorialMedia: parseEditorialMedia(undefined),
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
    editorialMedia: parseEditorialMedia(parsed.editorialMedia),
  };
}

export function serializeHomepageConfig(
  sections: HomepageSection[],
  bannerProductIds: Record<string, string[]> = {},
  editorialMedia: EditorialMedia = DEFAULT_EDITORIAL_MEDIA,
): string {
  return JSON.stringify({ version: 2, sections, bannerProductIds, editorialMedia });
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