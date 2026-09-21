import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateProductCatalog(slug?: string) {
  revalidateTag("storefront-products");
  revalidateTag("storefront-homepage");
  revalidateTag("storefront-sitemap");
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemap/0.xml");
  if (slug) revalidatePath(`/products/${slug}`);
}