import { unstable_cache } from "next/cache";
import { db, catalogDb } from "@/lib/db";
import { serializeProducts } from "@/lib/serialize";
import { homepageProductSelect } from "@/lib/product-selects";
import { getPublicImageUrl, sanitizeImageList } from "@/lib/image-url";
import {
  CURTAIN_CATALOG_CATEGORY_SLUGS,
  getCurtainCategoryProductWhere,
} from "@/lib/catalog-taxonomy";

type HomepageCatalogResult = {
  featured: any[];
  newest: any[];
  categories: any[];
  brands: any[];
  curated: any[];
  categoryProducts: Record<string, any[]>;
};

const homepageBannerSelect = {
  id: true,
  title: true,
  subtitle: true,
  badge: true,
  ctaText: true,
  ctaHref: true,
  cta2Text: true,
  cta2Href: true,
  imageUrl: true,
  gradient: true,
  darkText: true,
  order: true,
} as const;

function serializeHomepageProducts(products: any[]) {
  return serializeProducts(products, { imageLimit: 4 });
}

function categoryProductWhere(slug: string) {
  const base = {
    isActive: true,
    stock: { gt: 0 },
  };

  const categoryWhere = getCurtainCategoryProductWhere(slug);
  return { ...categoryWhere, ...base };
}

const getCachedMenuCategories = unstable_cache(
  async () => {
    const categories = await catalogDb.category.findMany({
      where: { products: { some: { isActive: true } } },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
      take: 18,
    });

    return categories.map((category) => ({
      ...category,
      image: getPublicImageUrl(category.image),
    }));
  },
  ["storefront-menu-categories-v2"],
  { revalidate: false, tags: ["storefront-homepage"] },
);

const getCachedHomepageBanners = unstable_cache(
  async () => {
    const banners = await db.banner.findMany({
      where: { isActive: true },
      select: homepageBannerSelect,
      orderBy: { order: "asc" },
    });

    return banners.map((banner) => ({
      ...banner,
      imageUrl: getPublicImageUrl(banner.imageUrl),
    }));
  },
  ["storefront-homepage-banners-v2"],
  { revalidate: false, tags: ["storefront-homepage"] },
);

/**
 * The home page is intentionally a small, cacheable read model. Keeping this
 * query outside the page means Vercel can reuse it across requests and the
 * database does not have to resend the same catalogue payload for every hit.
 */
const getCachedHomepageCatalog = unstable_cache(
  async (selectedProductIdsJson: string): Promise<HomepageCatalogResult> => {
    const selectedProductIds: string[] = JSON.parse(selectedProductIdsJson);

    const [featuredRaw, newestRaw, categories, brandCatalogRaw, curatedRaw, categoryProductsRaw] =
      await Promise.all([
        catalogDb.product.findMany({
          where: { isFeatured: true, isActive: true, stock: { gt: 0 } },
          select: homepageProductSelect,
          take: 8,
          orderBy: { createdAt: "desc" },
        }),
        catalogDb.product.findMany({
          where: { isActive: true, stock: { gt: 0 } },
          select: homepageProductSelect,
          take: 8,
          orderBy: { createdAt: "desc" },
        }),
        catalogDb.category.findMany({
          where: { products: { some: { isActive: true } } },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            parentId: true,
            _count: { select: { products: true } },
          },
          orderBy: { name: "asc" },
        }),
        catalogDb.brand.findMany({
          where: { products: { some: { isActive: true, stock: { gt: 0 } } } },
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            _count: { select: { products: true } },
            products: {
              where: { isActive: true, stock: { gt: 0 } },
              select: homepageProductSelect,
              orderBy: { createdAt: "desc" },
              take: 4,
            },
          },
          orderBy: { name: "asc" },
          take: 10,
        }),
        selectedProductIds.length
          ? catalogDb.product.findMany({
              where: {
                id: { in: selectedProductIds },
                isActive: true,
                stock: { gt: 0 },
              },
              select: homepageProductSelect,
            })
          : Promise.resolve([]),
        Promise.all(
          CURTAIN_CATALOG_CATEGORY_SLUGS.map((slug) =>
            catalogDb.product.findMany({
              where: categoryProductWhere(slug),
              select: homepageProductSelect,
              orderBy: { createdAt: "desc" },
              take: 4,
            }),
          ),
        ),
      ]);

    return {
      featured: serializeHomepageProducts(featuredRaw),
      newest: serializeHomepageProducts(newestRaw),
      categories: categories.map((category) => ({
        ...category,
        image: getPublicImageUrl(category.image),
      })),
      brands: brandCatalogRaw.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: getPublicImageUrl(brand.logo),
        productCount: brand._count.products,
        products: serializeHomepageProducts(brand.products),
      })),
      curated: serializeHomepageProducts(curatedRaw),
      categoryProducts: Object.fromEntries(
        CURTAIN_CATALOG_CATEGORY_SLUGS.map((slug, index) => [
          slug,
          serializeHomepageProducts(categoryProductsRaw[index] ?? []),
        ]),
      ),
    };
  },
  ["storefront-homepage-catalog-v4"],
  { revalidate: false, tags: ["storefront-homepage"] },
);

export function getHomepageCatalog(selectedProductIds: string[]) {
  const ids = Array.from(new Set(selectedProductIds)).sort();
  return getCachedHomepageCatalog(JSON.stringify(ids));
}

export { getCachedHomepageBanners, getCachedMenuCategories };