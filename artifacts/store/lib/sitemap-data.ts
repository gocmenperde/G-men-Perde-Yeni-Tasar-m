import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { catalogDb } from "@/lib/db";
import { getPublicImageUrl } from "@/lib/image-url";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenperde.com.tr"
).replace(/\/$/, "");

const PRODUCTS_PER_SITEMAP = 500;
const SITEMAP_CACHE_TAG = "storefront-sitemap";

export const getSitemapProductCount = unstable_cache(
  async () => catalogDb.product.count({ where: { isActive: true } }),
  ["storefront-sitemap-count-v2"],
  { revalidate: false, tags: [SITEMAP_CACHE_TAG] },
);

export const getSitemapChunkCount = async () => {
  const total = await getSitemapProductCount();
  return Math.max(1, Math.ceil(total / PRODUCTS_PER_SITEMAP)) + 1;
};

const getSitemapTaxonomy = unstable_cache(
  async () =>
    Promise.all([
      catalogDb.category.findMany({
        where: { products: { some: { isActive: true } } },
        select: { slug: true, updatedAt: true },
      }),
      catalogDb.brand.findMany({
        where: { products: { some: { isActive: true } } },
        select: { slug: true, updatedAt: true },
      }),
    ]),
  ["storefront-sitemap-taxonomy-v1"],
  { revalidate: false, tags: [SITEMAP_CACHE_TAG] },
);

function getSitemapProductChunk(sitemapId: number) {
  return unstable_cache(
    async () =>
      catalogDb.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true, images: true },
        orderBy: { updatedAt: "desc" },
        skip: (sitemapId - 1) * PRODUCTS_PER_SITEMAP,
        take: PRODUCTS_PER_SITEMAP,
      }),
  ["storefront-sitemap-products-v2", String(sitemapId)],
    { revalidate: false, tags: [SITEMAP_CACHE_TAG] },
  )();
}

export async function getSitemapEntries(sitemapId: number): Promise<MetadataRoute.Sitemap> {
  if (!Number.isInteger(sitemapId) || sitemapId < 0) return [];

  if (sitemapId === 0) {
    let categories: { slug: string; updatedAt: Date }[] = [];
    let brands: { slug: string; updatedAt: Date }[] = [];

    try {
      [categories, brands] = await getSitemapTaxonomy();
    } catch {}

    const staticPages: MetadataRoute.Sitemap = [
      { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
      { url: `${BASE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
      { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${BASE_URL}/measure-guide`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${BASE_URL}/hikayemiz`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${BASE_URL}/uygulama-ilham`, changeFrequency: "weekly", priority: 0.7 },
      { url: `${BASE_URL}/sizden-gelenler`, changeFrequency: "weekly", priority: 0.7 },
      { url: `${BASE_URL}/delivery`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${BASE_URL}/returns`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${BASE_URL}/sales-policy`, changeFrequency: "yearly", priority: 0.3 },
    ];

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${BASE_URL}/kategori/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
      url: `${BASE_URL}/marka/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    return [...staticPages, ...categoryPages, ...brandPages];
  }

  try {
    const products = await getSitemapProductChunk(sitemapId);
    const entries: MetadataRoute.Sitemap = [];

    for (const product of products) {
      const images = Array.isArray(product.images)
        ? product.images
            .map(getPublicImageUrl)
            .filter((image): image is string => Boolean(image))
        : [];
      const imageUrls = images
        .slice(0, 3)
        .map((image) => {
          try {
            return new URL(image, BASE_URL).toString();
          } catch {
            return null;
          }
        })
        .filter((image): image is string => Boolean(image));

      entries.push({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.85,
        ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
      });

    }

    return entries;
  } catch {
    return [];
  }
}