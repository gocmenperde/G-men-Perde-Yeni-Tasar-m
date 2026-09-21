import { NextRequest, NextResponse } from "next/server";
import { db, catalogDb } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { notifyProductUpdated, notifyIndexNow } from "@/lib/indexnow";
import { revalidateProductCatalog } from "@/lib/storefront-revalidation";
import { getPublicImageUrl, sanitizeImageList } from "@/lib/image-url";

export const dynamic = "force-dynamic";
const PUBLIC_CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=3600";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await catalogDb.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        reviews: { include: { user: { select: { name: true } } } },
      },
    });
    if (!product)
      return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
    const safeProduct = {
      ...product,
      images: sanitizeImageList(product.images),
      brand: product.brand
        ? { ...product.brand, logo: getPublicImageUrl(product.brand.logo) }
        : product.brand,
      category: product.category
        ? { ...product.category, image: getPublicImageUrl(product.category.image) }
        : product.category,
    };
    return NextResponse.json({ data: safeProduct }, {
      headers: {
        "Cache-Control": PUBLIC_CACHE,
        "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Alınamadı." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const { id } = await params;
    const body = await req.json();
    const price = body.price === undefined ? undefined : Number(body.price);
    const comparePrice = body.comparePrice === undefined || body.comparePrice === null || body.comparePrice === ""
      ? body.comparePrice === undefined ? undefined : null
      : Number(body.comparePrice);
    const barcode = body.barcode === undefined
      ? undefined
      : body.barcode === null
        ? null
        : String(body.barcode).trim() || null;
    if (price !== undefined && (!Number.isFinite(price) || price <= 0)) {
      return NextResponse.json({ error: "Geçerli bir satış fiyatı girin." }, { status: 400 });
    }
    if (comparePrice !== undefined && comparePrice !== null &&
        (!Number.isFinite(comparePrice) || comparePrice <= 0 || (price !== undefined && comparePrice <= price))) {
      return NextResponse.json({ error: "Üst fiyat, satış fiyatından büyük olmalıdır." }, { status: 400 });
    }
    const before = await db.product.findUnique({
      where: { id },
      select: { slug: true, isActive: true },
    });
    const product = await db.product.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(price !== undefined && { price }),
        ...(body.comparePrice !== undefined && {
          comparePrice,
        }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.description !== undefined && {
          description: body.description === null ? null : String(body.description).trim(),
        }),
        ...(body.images && { images: body.images }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.brandId !== undefined && { brandId: body.brandId }),
        ...(body.sku !== undefined && { sku: body.sku || null }),
        ...(barcode !== undefined && { barcode }),
        ...(body.tags && { tags: body.tags }),
        ...(body.unit !== undefined && { unit: body.unit || null }),
        ...(body.isMeter !== undefined && { isMeter: Boolean(body.isMeter) }),
        ...(body.isSquareMeter !== undefined && { isSquareMeter: Boolean(body.isSquareMeter) }),
        ...(body.requiresWidth !== undefined && { requiresWidth: Boolean(body.requiresWidth) }),
        ...(body.requiresHeight !== undefined && { requiresHeight: Boolean(body.requiresHeight) }),
        ...(body.features !== undefined && { features: body.features || null }),
        ...(body.badge !== undefined && { badge: body.badge || null }),
        ...(body.shippingFee !== undefined && { shippingFee: body.shippingFee == null ? null : Number(body.shippingFee) }),
        ...(body.shippingNote !== undefined && { shippingNote: body.shippingNote || null }),
        ...(body.serialNumber !== undefined && { serialNumber: body.serialNumber || null }),
        ...(body.specs !== undefined && { specs: body.specs }),
        ...(body.care !== undefined && { care: body.care }),
      },
    });
    // IndexNow: güncellenen ürün URL'sini ve ürün listesi görünümünü bildir.
    notifyProductUpdated(product.slug).catch(() => {});
    if (before?.slug && before.slug !== product.slug) {
      notifyIndexNow(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"}/products/${before.slug}`).catch(() => {});
    }
    revalidateProductCatalog(product.slug);

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const { id } = await params;

    // Silmeden önce slug'ı oku — 410 kaydı için gerekli
    const existing = await db.product.findUnique({
      where: { id },
      select: { slug: true, name: true },
    });

    await db.product.delete({ where: { id } });

    // Silinen ürünü kaydet: middleware bu listeyi okuyarak
    // eski URL'lere 410 Gone döndürür; Google sayfayı index'ten çıkarır.
    if (existing?.slug) {
      await db.deletedProduct.upsert({
        where:  { slug: existing.slug },
        update: { deletedAt: new Date() },
        create: { slug: existing.slug, name: existing.name ?? null },
      }).catch(() => {});
      notifyIndexNow(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"}/products/${existing.slug}`).catch(() => {});
      revalidateProductCatalog(existing.slug);
    }

    return NextResponse.json({ message: "Silindi." });
  } catch {
    return NextResponse.json({ error: "Silinemedi." }, { status: 500 });
  }
}
