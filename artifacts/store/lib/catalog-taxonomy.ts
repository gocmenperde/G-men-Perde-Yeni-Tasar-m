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