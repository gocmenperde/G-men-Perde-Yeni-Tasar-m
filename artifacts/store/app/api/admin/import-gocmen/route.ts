import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { revalidateProductCatalog } from "@/lib/storefront-revalidation";
import { GOCMEN_CATEGORIES, GOCMEN_MEASURE_GUIDE, GOCMEN_PRODUCTS } from "@/data/gocmen-catalog";
import { getDefaultHomepageSections, serializeHomepageConfig } from "@/lib/homepage-config";

export const dynamic = "force-dynamic";

const BRAND_SETTINGS = {
  siteName: "Göçmen Perde",
  logoUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472205/gocmenperde/gocmenperde/logo.jpg",
  faviconUrl: "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472205/gocmenperde/gocmenperde/logo.jpg",
  announcementText: "Bursa içi ücretsiz ölçü • 1993'ten beri güvenilir perde hizmeti",
  announcementActive: true,
  announcementColor: "amber",
  heroTitle: "Bursa'nın 1993'ten beri güvenilir perdecisi",
  heroSubtitle: "Tül, fon, zebra, stor ve plise perde modelleri",
  heroBadge: "Özel ölçü • Ücretsiz keşif",
  heroDesc: "Bursa içi ücretsiz ölçü, profesyonel dikim ve montaj hizmetiyle yaşam alanınıza doğru perdeyi taşıyoruz.",
  heroCtaPrimaryText: "Perdeleri keşfet",
  heroCtaPrimaryHref: "/products",
  heroCtaSecText: "Ücretsiz ölçü iste",
  heroCtaSecHref: "/contact",
  phone: "05462851826",
  whatsapp: "905462851826",
  email: "muhammedemint76@gmail.com",
  address: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sokak No:3/A, Osmangazi / Bursa",
  stat1Value: "30+",
  stat1Label: "yıllık deneyim",
  stat2Value: "8",
  stat2Label: "perde kategorisi",
  stat3Value: "Bursa",
  stat3Label: "ücretsiz ölçü bölgesi",
  trustBadge1Text: "Ücretsiz ölçü",
  trustBadge1Sub: "Bursa içi keşif",
  trustBadge2Text: "Profesyonel montaj",
  trustBadge2Sub: "Özenli uygulama",
  trustBadge3Text: "Güvenilir kalite",
  trustBadge3Sub: "1993'ten beri",
} as const;

function productSlug(product: (typeof GOCMEN_PRODUCTS)[number]) {
  return slugify(product.id || product.name, { lower: true, strict: true, locale: "tr" });
}

function productCategoryKey(source: (typeof GOCMEN_PRODUCTS)[number]) {
  if (source.cat === "tul-perde" && /örme|orme/i.test(source.name)) {
    return "ormetulperde";
  }
  return source.cat;
}

const CURTAIN_BANNERS = [
  {
    title: "Yaşam alanınıza doğru perdeyi seçin",
    subtitle: "Tül, fon, zebra, stor ve plise modellerini keşfedin.",
    badge: "GÖÇMEN PERDE",
    ctaText: "Perdeleri keşfet",
    ctaHref: "/products",
    cta2Text: "Ücretsiz ölçü",
    cta2Href: "/contact",
    gradient: "amber",
  },
  {
    title: "Pencerenize tam uyum sağlayan çözümler",
    subtitle: "Bursa içi ücretsiz keşif ve doğru ölçü desteği.",
    badge: "ÖZEL ÖLÇÜ",
    ctaText: "Ölçü iste",
    ctaHref: "/contact",
    cta2Text: "Kategoriler",
    cta2Href: "/products",
    gradient: "emerald",
  },
  {
    title: "Tül, fon, zebra, stor ve plise",
    subtitle: "1993'ten beri Bursa'nın güvenilir perdecisi.",
    badge: "PERDE KOLEKSİYONU",
    ctaText: "Koleksiyonu gör",
    ctaHref: "/products",
    cta2Text: "Hikâyemiz",
    cta2Href: "/about",
    gradient: "rose",
  },
] as const;

function curtainHomepageJson(productIds: string[], bannerProductIds: Record<string, string[]>) {
  const sections = getDefaultHomepageSections().map((section) => {
    const updates: Partial<typeof section> =
      section.id === "brandSignature"
        ? {
            title: "Bursa'dan seçilmiş perdeler.",
            subtitle: "Özel ölçü, profesyonel dikim ve montaj için güvenilir adres.",
          }
        : section.id === "editorShelf"
          ? {
              title: "Öne çıkan perde modelleri",
              subtitle: "Yaşam alanınıza uyum sağlayan seçili perde modelleri.",
            }
          : section.id === "categories"
            ? {
                title: "Perdede aradığın her şey.",
                subtitle: "İhtiyacına en uygun perde kategorisini keşfet.",
              }
            : section.id === "featured"
              ? {
                  title: "Çok tercih edilen perdeler",
                  subtitle: "Göçmen Perde koleksiyonundan öne çıkan ürünleri keşfedin.",
                }
              : section.id === "dailyDeal"
                ? {
                    title: "Bugünün perde fırsatı",
                    subtitle: "Seçili perde modellerinde avantaj. Ölçünüzü alıp inceleyin.",
                  }
                : section.id === "discovery"
                  ? {
                      title: "İhtiyacına göre perdeyi seç",
                      subtitle: "Salon, yatak odası ve gün ışığı için doğru kategoriyi keşfet.",
                    }
                  : section.id === "perks"
                    ? {
                        title: "Perde alışverişinin her adımı özenli.",
                        subtitle: "Göçmen Perde deneyiminin arkasındaki özen.",
                      }
                    : section.id === "new"
                      ? {
                          title: "Yeni perde modelleri",
                          subtitle: "Koleksiyona yeni katılan perde seçkilerini keşfedin.",
                        }
                      : {};
    return { ...section, ...updates };
  });

  return serializeHomepageConfig(sections, bannerProductIds);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    const categoryIds = new Map<string, string>();
    const productIds = new Map<string, string>();
    for (const category of GOCMEN_CATEGORIES) {
      const record = await db.category.upsert({
        where: { slug: category.key },
        update: { name: category.label, image: category.image || null },
        create: { name: category.label, slug: category.key, image: category.image || null },
      });
      categoryIds.set(category.key, record.id);
    }

    for (const source of GOCMEN_PRODUCTS) {
      const slug = productSlug(source);
      const categoryKey = productCategoryKey(source);
      const data = {
        name: source.name,
        slug,
        sku: source.barcode || `GP-${source.id}`,
        description: source.desc || null,
        price: Number(source.price),
        comparePrice: source.oldPrice ? Number(source.oldPrice) : null,
        stock: Number(source.stock ?? 0),
        images: Array.isArray(source.images) && source.images.length ? source.images : [source.image],
        isFeatured: Boolean(source.isFeatured),
        isActive: source.active !== false,
        barcode: source.barcode || null,
        tags: [...new Set([source.cat, ...(source.seoKeywords ?? [])])],
        categoryId: categoryIds.get(categoryKey) ?? null,
        unit: source.unit || "adet",
        isMeter: Boolean(source.isMeter),
        isSquareMeter: Boolean(source.isSquareMeter),
        requiresWidth: Boolean(source.requiresWidth),
        requiresHeight: Boolean(source.requiresHeight),
        features: source.features || null,
        badge: source.badge || null,
        shippingFee: source.shippingFee == null ? null : Number(source.shippingFee),
        shippingNote: source.shippingNote || null,
        serialNumber: source.serialNumber || null,
        specs: source.specs ?? null,
        care: source.care ?? null,
      };

      try {
        const existing = await db.product.findUnique({ where: { slug }, select: { id: true } });
        const saved = await db.product.upsert({
          where: { slug },
          update: data,
          create: data,
        });
        productIds.set(source.id, saved.id);
        if (existing) updated += 1;
        else created += 1;
      } catch (error) {
        failed += 1;
        errors.push(`${source.id}: ${error instanceof Error ? error.message : "ürün kaydedilemedi"}`);
      }
    }

    const existingSettings = await db.siteSettings.findUnique({
      where: { id: "global" },
      select: { popularSetsJson: true },
    });
    const bannerProductIds: Record<string, string[]> = {};
    const featuredSources = GOCMEN_PRODUCTS.filter((product) => product.isFeatured).slice(0, CURTAIN_BANNERS.length);

    for (const [index, bannerInput] of CURTAIN_BANNERS.entries()) {
      const source = featuredSources[index] ?? GOCMEN_PRODUCTS[index];
      const banner = await db.banner.findFirst({ where: { title: bannerInput.title } });
      const bannerData = {
        ...bannerInput,
        imageUrl: source?.image ?? null,
        darkText: false,
        isActive: true,
        order: index,
      };
      const savedBanner = banner
        ? await db.banner.update({ where: { id: banner.id }, data: bannerData })
        : await db.banner.create({ data: bannerData });
      const selectedProductId = source ? productIds.get(source.id) : undefined;
      bannerProductIds[savedBanner.id] = selectedProductId ? [selectedProductId] : [];
    }

    const currentHomepage = existingSettings?.popularSetsJson ?? "";
    const shouldConfigureHomepage =
      !currentHomepage ||
      /kitap|kırtasiye|kirtasiye|okur kulübü|çalışma masası/i.test(currentHomepage);
    const popularSetsJson = shouldConfigureHomepage
      ? curtainHomepageJson(
          featuredSources.map((source) => productIds.get(source.id)).filter((id): id is string => Boolean(id)),
          bannerProductIds,
        )
      : existingSettings?.popularSetsJson;

    await db.siteSettings.upsert({
      where: { id: "global" },
      update: { ...BRAND_SETTINGS, ...(popularSetsJson ? { popularSetsJson } : {}) },
      create: { id: "global", ...BRAND_SETTINGS, popularSetsJson },
    });

    revalidateProductCatalog();
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/about");
    revalidatePath("/contact");

    return NextResponse.json({
      ok: true,
      created,
      updated,
      failed,
      measureGuide: GOCMEN_MEASURE_GUIDE.title,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kaynak katalog aktarılamadı." },
      { status: 500 },
    );
  }
}
