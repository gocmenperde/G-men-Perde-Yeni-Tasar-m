import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Portrait-ratio Trendyol patterns → almost always fashion/clothing photos, not stationery
const SUSPICIOUS_PATTERNS = [
  "mnresize/1200/1800",
  "mnresize/620/920",
  "mnresize/415/622",
  "mnresize/480/720",
  "mnresize/300/450",
];

export async function GET(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = 48;
    const skip = (page - 1) * limit;

    const allProducts = await db.product.findMany({
      where: {
        images: { isEmpty: false },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        images: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    // Filter to those with any suspicious image URL
    const suspicious = allProducts.filter((p) =>
      p.images.some((img) =>
        SUSPICIOUS_PATTERNS.some((pat) => img.includes(pat))
      )
    );

    const total = suspicious.length;
    const paged = suspicious.slice(skip, skip + limit);

    return NextResponse.json({ data: paged, total, page, limit });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sorgu başarısız" }, { status: 500 });
  }
}

// Bulk clear suspicious images from multiple products
export async function DELETE(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const { ids }: { ids: string[] } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0)
      return NextResponse.json({ error: "Geçersiz liste" }, { status: 400 });

    // For each product: remove only the suspicious images, keep clean ones
    const updated = await Promise.all(
      ids.map(async (id) => {
        const p = await db.product.findUnique({ where: { id }, select: { images: true } });
        if (!p) return null;
        const clean = p.images.filter(
          (img) => !SUSPICIOUS_PATTERNS.some((pat) => img.includes(pat))
        );
        return db.product.update({
          where: { id },
          data: { images: clean },
          select: { id: true },
        });
      })
    );

    return NextResponse.json({ updated: updated.filter(Boolean).length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Silme başarısız" }, { status: 500 });
  }
}
