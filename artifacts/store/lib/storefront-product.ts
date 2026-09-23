import { cache } from "react";
import { unstable_cache } from "next/cache";
import { catalogDb } from "@/lib/db";
import { listingProductSelect, productDetailSelect } from "@/lib/product-selects";

const findProductBySlug = (slug: string) =>
  catalogDb.product.findUnique({
    where: { slug },
    select: productDetailSelect,
  });

const getCachedProductBySlug = (slug: string) =>
  unstable_cache(
    () => findProductBySlug(slug),
    ["storefront-product-by-slug", slug],
    {
      revalidate: 3600,
      tags: ["storefront-products", `storefront-product:${slug}`],
    },
  )();

const getCachedRelatedProducts = (categoryId: string, productId: string) =>
  unstable_cache(
    async () =>
      catalogDb.product.findMany({
        where: {
          categoryId,
          isActive: true,
          NOT: { id: productId },
        },
        select: listingProductSelect,
        take: 6,
      }),
    ["storefront-related-products", categoryId, productId],
    {
      revalidate: 3600,
      tags: ["storefront-products"],
    },
  )();

/**
 * React cache deduplicates generateMetadata() and the page render during the
 * same request. Without this wrapper one product URL caused two identical
 * Prisma reads before ISR could reuse the rendered result.
 */
export const getProductBySlug = cache(async (slug: string) => {
  const cachedProduct = await getCachedProductBySlug(slug);

  // A product can be added or reactivated after a previous request cached a
  // null/inactive result. Do not let that negative cache hide a product that
  // is currently present in the catalog and therefore already in the feeds.
  if (cachedProduct?.isActive) return cachedProduct;

  return findProductBySlug(slug);
});

export const getRelatedProducts = cache((categoryId: string, productId: string) =>
  getCachedRelatedProducts(categoryId, productId),
);