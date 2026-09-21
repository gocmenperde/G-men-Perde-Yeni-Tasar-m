import { NextRequest, NextResponse } from "next/server";
import { db, catalogDb } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { notifyProductUpdated, notifyHomepageRefresh } from "@/lib/indexnow";
import { revalidateProductCatalog } from "@/lib/storefront-revalidation";
import { sanitizeImageList } from "@/lib/image-url";
import slugify from "slugify";

// GET is a public catalogue read. Keep it cacheable at the edge so repeated
// visits and crawler requests do not execute the same database query at the
// application origin. POST remains protected by the admin check below.
export const revalidate = 300;
const MAX_PAGE = 250;
const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedPage = parseInt(searchParams.get("page") ?? "1", 10);
    if (Number.isFinite(requestedPage) && requestedPage > MAX_PAGE) {
      return NextResponse.json({ error: "Sayfa sınırı aşıldı." }, { status: 400 });
    }
    const page = Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1);
    const requestedTake = parseInt(searchParams.get("take") ?? "20");
    const take = Number.isFinite(requestedTake)
      ? Math.min(50, Math.max(1, requestedTake))
      : 20;
    const search = (searchParams.get("search") ?? searchParams.get("q") ?? "").slice(0, 120);
    const categoryId = searchParams.get("categoryId") ?? "";
    const brandId = searchParams.get("brandId") ?? "";
    const hasDiscount = searchParams.get("hasDiscount") === "true";
    const ids = (searchParams.get("ids") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const includeTotal = searchParams.get("includeTotal") !== "false";

    const excludeBkm = searchParams.get("excludeBkm") === "true";

    const where: any = { isActive: true };
    if (ids.length) where.id = { in: ids };
    if (excludeBkm) where.id = { not: { startsWith: "bkm_" } };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (hasDiscount) where.comparePrice = { not: null };

    const productsPromise = catalogDb.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        comparePrice: true,
        stock: true,
        images: true,
        createdAt: true,
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip: (page - 1) * take,
    });
    const totalPromise = includeTotal ? catalogDb.product.count({ where }) : null;
    const [products, total] = await Promise.all([
      productsPromise,
      totalPromise ?? Promise.resolve(null),
    ]);

    const response = {
      data: products.map((product) => ({
        ...product,
        images: sanitizeImageList(product.images, 2),
      })),
      ...(includeTotal
        ? { total: total ?? 0, page, pages: Math.ceil((total ?? 0) / take) }
        : {}),
    };

    return NextResponse.json(
      response,
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
          "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Ürünler alınamadı." },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const body = await req.json();
    const {
      name,
      price,
      stock,
      categoryId,
      brandId,
      description,
      comparePrice,
      images,
      isFeatured,
      isActive,
      sku,
      tags,
    } = body;
    if (!name || price === undefined)
      return NextResponse.json(
        { error: "Ad ve fiyat zorunludur." },
        { status: 400 },
      );
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    const product = await db.product.create({
      data: {
        name,
        slug,
        sku: sku || null,
        price,
        comparePrice: comparePrice ?? null,
        stock: stock ?? 0,
        description: description ?? null,
        images: images ?? [],
        isFeatured: isFeatured ?? false,
        isActive: isActive !== false,
        categoryId: categoryId ?? null,
        brandId: brandId ?? null,
        tags: tags ?? [],
      },
    });

    // IndexNow: yeni ürünü ve ana sayfayı Google/Bing'e bildir
    if (product.isActive) {
      notifyProductUpdated(product.slug).catch(() => {});
      notifyHomepageRefresh().catch(() => {});
    }
    revalidateProductCatalog(product.slug);

    return NextResponse.json({ data: product }, { status: 201, headers: NO_STORE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Ürün oluşturulamadı." },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
