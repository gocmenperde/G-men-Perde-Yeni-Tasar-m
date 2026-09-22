import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db, catalogDb } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import slugify from "slugify";
import { getPublicImageUrl } from "@/lib/image-url";

export const dynamic = "force-dynamic";
const LIVE_CATALOG_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    const categories = await catalogDb.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: categories.map((category) => ({
      ...category,
      image: getPublicImageUrl(category.image),
    })) }, {
      headers: LIVE_CATALOG_HEADERS,
    });
  } catch {
    return NextResponse.json(
      { error: "Kategoriler alınamadı." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const { name, image, parentId } = await req.json();
    if (!name)
      return NextResponse.json({ error: "Ad zorunludur." }, { status: 400 });
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    const category = await db.category.create({
      data: { name, slug, image: image ?? null, parentId: parentId ?? null },
    });
    revalidateTag("storefront-products");
    revalidateTag("storefront-homepage");
    return NextResponse.json({ data: category }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kategori oluşturulamadı." },
      { status: 500 },
    );
  }
}
