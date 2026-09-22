import { sanitizeImageList } from "@/lib/image-url";
import slugify from "slugify";
import { GOCMEN_PRODUCTS } from "@/data/gocmen-catalog";

type CatalogSerializationOptions = {
  imageLimit?: number;
};

const sourceProductImages = new Map(
  GOCMEN_PRODUCTS.map((source) => {
    const key = slugify(String(source.id || source.name || ""), {
      lower: true,
      strict: true,
      locale: "tr",
    });
    const images = sanitizeImageList([
      ...(Array.isArray(source.images) ? source.images : []),
      source.image,
    ], 4);
    return [key, images] as const;
  }),
);

export function serializeProduct(
  product: any,
  options: CatalogSerializationOptions = {},
): any {
  if (!product) return product;

  // Image values are part of the server-to-client payload. Strip embedded
  // data/blob URLs here, before React Flight can place their bytes in HTML or
  // an RSC response. The browser-side image component is too late for this.
  const sourceImages = sourceProductImages.get(String(product.slug || ""));
  const imageList = sanitizeImageList(
    [
      ...(Array.isArray(product.images) ? product.images : []),
      ...(sourceImages ?? []),
    ],
    options.imageLimit,
  );

  return {
    ...product,
    images: imageList,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    shippingFee: product.shippingFee ? Number(product.shippingFee) : null,
    createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() ?? product.updatedAt,
    reviews: product.reviews?.map((r: any) => ({
      ...r,
      createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
      updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
    })) ?? undefined,
  };
}

export function serializeProducts(
  products: any[],
  options: CatalogSerializationOptions = {},
): any[] {
  return products.map((product) => serializeProduct(product, options));
}

export function serializeOrder(order: any): any {
  if (!order) return order;
  return {
    ...order,
    total: Number(order.total),
    subtotal: order.subtotal ? Number(order.subtotal) : undefined,
    discount: order.discount ? Number(order.discount) : null,
    shipping: order.shipping ? Number(order.shipping) : null,
    createdAt: order.createdAt?.toISOString?.() ?? order.createdAt,
    updatedAt: order.updatedAt?.toISOString?.() ?? order.updatedAt,
    items: order.items?.map((item: any) => ({
      ...item,
      price: Number(item.price),
      product: item.product ? serializeProduct(item.product) : undefined,
    })),
    address: order.address
      ? {
          ...order.address,
          createdAt: order.address.createdAt?.toISOString?.() ?? order.address.createdAt,
        }
      : null,
  };
}
