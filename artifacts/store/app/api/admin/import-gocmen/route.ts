import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { revalidateProductCatalog } from "@/lib/storefront-revalidation";
import { GOCMEN_CATEGORIES, GOCMEN_MEASURE_GUIDE, GOCMEN_PRODUCTS } from "@/data/gocmen-catalog";

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

export async function POST(req: Request) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    const categoryIds = new Map<string, string>();
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
        categoryId: categoryIds.get(source.cat) ?? null,
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
        await db.product.upsert({
          where: { slug },
          update: data,
          create: data,
        });
        if (existing) updated += 1;
        else created += 1;
      } catch (error) {
        failed += 1;
        errors.push(`${source.id}: ${error instanceof Error ? error.message : "ürün kaydedilemedi"}`);
      }
    }

    await db.siteSettings.upsert({
      where: { id: "global" },
      update: BRAND_SETTINGS,
      create: { id: "global", ...BRAND_SETTINGS },
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
