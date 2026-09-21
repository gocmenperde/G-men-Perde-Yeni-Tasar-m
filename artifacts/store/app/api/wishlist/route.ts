import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";
import { sanitizeImageList } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ data: [] });

    const items = await db.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = items.map((w) => ({
      ...w,
      product: {
        ...w.product,
        images: sanitizeImageList(w.product.images),
        price: Number(w.product.price),
        comparePrice: w.product.comparePrice ? Number(w.product.comparePrice) : null,
      },
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[WISHLIST_GET]", error);
    return NextResponse.json({ error: "Favoriler alınamadı." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "productId zorunludur." }, { status: 400 });

    const existing = await db.wishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existing) {
      await db.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ data: null, action: "removed" });
    }

    const item = await db.wishlist.create({
      data: { userId: user.id, productId },
    });
    return NextResponse.json({ data: item, action: "added" }, { status: 201 });
  } catch (error) {
    console.error("[WISHLIST_POST]", error);
    return NextResponse.json({ error: "Favori işlemi başarısız." }, { status: 500 });
  }
}
