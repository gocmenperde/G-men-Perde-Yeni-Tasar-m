import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { BURSA_ILCELER, MARKALAR, TURKIYE_SEHIRLER } from '@/lib/seo-keywords';

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.gocmenkirtasiye.com.tr'
).replace(/\/$/, '');

const staticSlug = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/sales-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/kirtasiye`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];
  let barcodePages: MetadataRoute.Sitemap = [];
  let databaseBrandPages: MetadataRoute.Sitemap = [];

  try {
    const [categories, products] = await Promise.all([
      db.category.findMany({
        select: { slug: true, updatedAt: true },
      }).catch(() => []),
      db.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }).catch(() => []),
    ]);

    categoryPages = categories.map((category) => ({
      url: `${BASE_URL}/kategori/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    productPages = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    const rawBarcodeRows = await db.$queryRawUnsafe<Array<{ code: string; updatedAt: Date }>>(
      `SELECT COALESCE(\"barcode\", \"sku\") AS code, \"updatedAt\"
       FROM \"Product\"
       WHERE \"isActive\" = true AND COALESCE(\"barcode\", \"sku\") IS NOT NULL`,
    ).catch(() => []);

    barcodePages = rawBarcodeRows.map((product) => ({
      url: `${BASE_URL}/barkod/${encodeURIComponent(product.code)}`,
      lastModified: product.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    const rawBrandRows = await db.$queryRawUnsafe<Array<{ slug: string; updatedAt: Date }>>(
      `SELECT \"slug\", \"updatedAt\" FROM \"Brand\"`,
    ).catch(() => []);

    databaseBrandPages = rawBrandRows.map((brand) => ({
      url: `${BASE_URL}/marka/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));
  } catch {
    // Sitemap must stay available even if the database is temporarily unavailable.
  }

  const fallbackBrandPages: MetadataRoute.Sitemap = MARKALAR.map((brand) => ({
    url: `${BASE_URL}/marka/${staticSlug(brand)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const cityPages: MetadataRoute.Sitemap = [
    'bursa',
    ...BURSA_ILCELER,
    ...TURKIYE_SEHIRLER.filter((city) => city !== 'bursa'),
  ].map((city) => ({
    url: `${BASE_URL}/kirtasiye/${staticSlug(city)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...(databaseBrandPages.length > 0 ? databaseBrandPages : fallbackBrandPages),
    ...productPages,
    ...barcodePages,
    ...cityPages,
  ];
}
