import type { Prisma } from "@prisma/client";

/**
 * Public catalog cards do not need the product's long description, tags, SEO
 * fields, or internal flags. Keeping the selection explicit prevents those
 * columns from crossing the database/server boundary on every catalog view.
 */
const catalogProductBaseSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  stock: true,
  images: true,
  unit: true,
  isMeter: true,
  isSquareMeter: true,
  requiresWidth: true,
  requiresHeight: true,
  features: true,
  badge: true,
  shippingFee: true,
  shippingNote: true,
  serialNumber: true,
  specs: true,
  care: true,
  createdAt: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export const listingProductSelect = catalogProductBaseSelect;

/**
 * Homepage rails never show review details. Omitting that relation keeps the
 * ISR/data-cache payload small while ProductTile still renders its existing
 * unrated fallback.
 */
export const homepageProductSelect = catalogProductBaseSelect;

export const catalogProductSelect = {
  ...catalogProductBaseSelect,
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductSelect;

/**
 * Product cards also support quick view and comparison, so they retain the
 * small identifying fields and description those interactions need.
 */
export const productCardSelect = {
  ...catalogProductSelect,
  sku: true,
  barcode: true,
  description: true,
} satisfies Prisma.ProductSelect;

export const productMetadataSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  barcode: true,
  description: true,
  metaTitle: true,
  metaDescription: true,
  price: true,
  stock: true,
  images: true,
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

export const productDetailSelect = {
  id: true,
  categoryId: true,
  isActive: true,
  name: true,
  slug: true,
  sku: true,
  barcode: true,
  metaTitle: true,
  metaDescription: true,
  description: true,
  price: true,
  comparePrice: true,
  stock: true,
  images: true,
  unit: true,
  isMeter: true,
  isSquareMeter: true,
  requiresWidth: true,
  requiresHeight: true,
  features: true,
  badge: true,
  shippingFee: true,
  shippingNote: true,
  serialNumber: true,
  specs: true,
  care: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true, slug: true } },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.ProductSelect;