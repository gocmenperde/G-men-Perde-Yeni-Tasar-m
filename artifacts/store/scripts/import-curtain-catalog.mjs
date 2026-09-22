import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const db = new PrismaClient();
const categories = JSON.parse(
  await readFile(new URL("../data/gocmen-categories.source.json", import.meta.url), "utf8"),
);
const products = JSON.parse(
  await readFile(new URL("../data/gocmen-products.source.json", import.meta.url), "utf8"),
);
const brandSettings = {
  siteName: "Göçmen Perde",
  logoUrl:
    "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472205/gocmenperde/gocmenperde/logo.jpg",
  faviconUrl:
    "https://res.cloudinary.com/ddb9lvapm/image/upload/v1781472205/gocmenperde/gocmenperde/logo.jpg",
  announcementText: "Bursa içi ücretsiz ölçü • 1993'ten beri güvenilir perde hizmeti",
  announcementActive: true,
  announcementColor: "amber",
  heroTitle: "Bursa'nın 1993'ten beri güvenilir perdecisi",
  heroSubtitle: "Tül, fon, zebra, stor ve plise perde modelleri",
  heroBadge: "Özel ölçü • Ücretsiz keşif",
  heroDesc:
    "Bursa içi ücretsiz ölçü, profesyonel dikim ve montaj hizmetiyle yaşam alanınıza doğru perdeyi taşıyoruz.",
  heroCtaPrimaryText: "Perdeleri keşfet",
  heroCtaPrimaryHref: "/products",
  heroCtaSecText: "Ücretsiz ölçü iste",
  heroCtaSecHref: "/contact",
  phone: "05462851826",
  whatsapp: "905462851826",
  email: "muhammedemint76@gmail.com",
  address:
    "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sokak No:3/A, Osmangazi / Bursa",
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
};
const banners = [
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
];

let created = 0;
let updated = 0;

try {
  const categoryIds = new Map();
  for (const category of categories) {
    const saved = await db.category.upsert({
      where: { slug: category.key },
      update: { name: category.label, image: category.image || null },
      create: {
        name: category.label,
        slug: category.key,
        image: category.image || null,
      },
    });
    categoryIds.set(category.key, saved.id);
  }

  const brand = await db.brand.upsert({
    where: { slug: "gocmen-perde" },
    update: { name: "Göçmen Perde" },
    create: { name: "Göçmen Perde", slug: "gocmen-perde" },
  });

  for (const source of products) {
    const slug = slugify(source.id || source.name, {
      lower: true,
      strict: true,
      locale: "tr",
    });
    const data = {
      name: source.name,
      slug,
      sku: source.barcode || `GP-${source.id}`,
      description: source.desc || null,
      price: Number(source.price),
      comparePrice: source.oldPrice == null ? null : Number(source.oldPrice),
      stock: Number(source.stock ?? 0),
      images:
        Array.isArray(source.images) && source.images.length
          ? source.images
          : [source.image],
      isFeatured: Boolean(source.isFeatured),
      isActive: source.active !== false,
      barcode: source.barcode || null,
      tags: [...new Set([source.cat, ...(source.seoKeywords ?? [])])],
      categoryId: categoryIds.get(source.cat) ?? null,
      brandId: brand.id,
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

    const existing = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    await db.product.upsert({
      where: { slug },
      update: data,
      create: data,
    });
    if (existing) updated += 1;
    else created += 1;
  }

  const featuredSources = products.filter((product) => product.isFeatured).slice(0, banners.length);
  const bannerProductIds = {};
  for (const [index, bannerInput] of banners.entries()) {
    const source = featuredSources[index] ?? products[index];
    const existing = await db.banner.findFirst({ where: { title: bannerInput.title } });
    const data = {
      ...bannerInput,
      imageUrl: source?.image ?? null,
      darkText: false,
      isActive: true,
      order: index,
    };
    const saved = existing
      ? await db.banner.update({ where: { id: existing.id }, data })
      : await db.banner.create({ data });
    bannerProductIds[saved.id] = source ? [slugify(source.id, { lower: true, strict: true, locale: "tr" })] : [];
  }

  await db.siteSettings.upsert({
    where: { id: "global" },
    update: brandSettings,
    create: { id: "global", ...brandSettings },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        categories: categoryIds.size,
        products: products.length,
        banners: banners.length,
        created,
        updated,
      },
      null,
      2,
    ),
  );
} finally {
  await db.$disconnect();
}