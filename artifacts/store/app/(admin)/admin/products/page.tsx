import { db } from "@/lib/db";
import { serializeProducts } from "@/lib/serialize";
import AdminProductsClient from "@/components/admin/products-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Ürünler" };

const PAGE_SIZE = 50;

const SORT_MAP: Record<string, object> = {
  newest:     { createdAt: "desc" },
  oldest:     { createdAt: "asc" },
  "name-asc": { name: "asc" },
  "name-desc":{ name: "desc" },
  "price-asc":{ price: "asc" },
  "price-desc":{ price: "desc" },
  "stock-asc": { stock: "asc" },
  "stock-desc":{ stock: "desc" },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    filter?: string;
    brandId?: string;
    categoryId?: string;
    sort?: string;
  };
}) {
  const page       = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const search     = (searchParams.search ?? "").trim();
  const filter     = searchParams.filter ?? "all";
  const brandId    = searchParams.brandId ?? "";
  const categoryId = searchParams.categoryId ?? "";
  const sort       = searchParams.sort ?? "newest";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku:  { contains: search, mode: "insensitive" } },
    ];
  }
  if (filter === "featured")  where.isFeatured  = true;
  if (filter === "sale")      where.comparePrice = { not: null };
  if (filter === "active")    where.isActive = true;
  if (filter === "passive")   where.isActive = false;
  if (filter === "nostock")   where.stock = 0;
  if (filter === "lowstock")  where.stock = { gt: 0, lte: 5 };

  if (brandId)    where.brandId    = brandId;
  if (categoryId) where.categoryId = categoryId;

  const orderBy = SORT_MAP[sort] ?? SORT_MAP.newest;

  const [rawProducts, totalCount, categories, brands, outOfStock, lowStock, onSale] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.product.count({ where: { isActive: true, stock: 0 } }),
    db.product.count({ where: { isActive: true, stock: { gt: 0, lte: 5 } } }),
    db.product.count({ where: { isActive: true, comparePrice: { not: null } } }),
  ]);

  const products = serializeProducts(rawProducts);

  return (
    <AdminProductsClient
      products={products}
      categories={categories}
      brands={brands}
      totalCount={totalCount}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      filter={filter}
      brandId={brandId}
      categoryId={categoryId}
      sort={sort}
      stockStats={{ outOfStock, lowStock, onSale }}
    />
  );
}
