/**
 * Katalog importunun desteklediği kategori slugg'ları.
 *
 * Bu liste, perde ürünlerinin admin ekranında katalogla
 * karışmasını tespit etmek için kullanılır. Ürün bağlı kategoriler otomatik
 * silinmez; önce ürünlerin doğru kategoriye taşınması gerekir.
 */
export const CURTAIN_CATALOG_CATEGORY_SLUGS = [
  "carsaf",
  "tul-perde",
  "plise-perde",
  "stor-perde",
  "zebra-perde",
  "koltuk",
  "ormetulperde",
  "guneslik",
  "fonperdeler",
] as const;

export function isCurtainCatalogCategory(slug: string) {
  return (CURTAIN_CATALOG_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

/**
 * Örme tül ürünleri eski katalog aktarımında tül-perde kategorisine yazılmış
 * olabilir. Yeni aktarımlar doğru kategoriye taşınır; bu sorgu da eski kayıtları
 * vitrinde kaybetmeden aynı kategori altında gösterir.
 */
export function getCurtainCategoryProductWhere(slug: string) {
  const base = {
    isActive: true,
  };

  if (slug !== "ormetulperde") {
    return { ...base, category: { slug } };
  }

  return {
    ...base,
    OR: [
      { category: { slug } },
      {
        category: { slug: "tul-perde" },
        name: { contains: "örme", mode: "insensitive" as const },
      },
      {
        category: { slug: "tul-perde" },
        name: { contains: "orme", mode: "insensitive" as const },
      },
      {
        category: { slug: "tul-perde" },
        slug: { contains: "orme", mode: "insensitive" as const },
      },
    ],
  };
}