import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  const sp = req.nextUrl.searchParams;
  const page       = Math.max(1, parseInt(sp.get("page") ?? "1") || 1);
  const limit      = Math.min(50, Math.max(10, parseInt(sp.get("limit") ?? "24") || 24));
  const filter     = sp.get("filter") ?? "all";
  const categoryId = sp.get("categoryId") ?? "";
  const brandId    = sp.get("brandId") ?? "";
  const search     = (sp.get("search") ?? "").trim();

  const where: Record<string, unknown> = {};
  if (filter === "noimages") where.images = { equals: [] };
  if (filter === "noimage_or_empty") {
    where.OR = [
      { images: { equals: [] } },
      { images: null },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (brandId)    where.brandId    = brandId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku:  { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        price: true,
        comparePrice: true,
        stock: true,
        images: true,
        sku: true,
        barcode: true,
        isActive: true,
        category: { select: { id: true, name: true } },
        brand:    { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map(p => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
