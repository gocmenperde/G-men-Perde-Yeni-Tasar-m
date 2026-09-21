import { sanitizeImageList } from "@/lib/image-url";

type CatalogSerializationOptions = {
  imageLimit?: number;
};

export function serializeProduct(
  product: any,
  options: CatalogSerializationOptions = {},
): any {
  if (!product) return product;

  // Image values are part of the server-to-client payload. Strip embedded
  // data/blob URLs here, before React Flight can place their bytes in HTML or
  // an RSC response. The browser-side image component is too late for this.
  const imageList = sanitizeImageList(product.images, options.imageLimit);

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
