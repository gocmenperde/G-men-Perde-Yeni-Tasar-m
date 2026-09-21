import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q) return NextResponse.json({ data: [] });

    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { barcode: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        images: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ error: "Arama başarısız" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const body = await req.json();
    const { id, images } = body;

    if (!id || !Array.isArray(images))
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

    const product = await db.product.update({
      where: { id },
      data: { images: images.filter((u: string) => u?.trim()) },
      select: { id: true, images: true },
    });

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
