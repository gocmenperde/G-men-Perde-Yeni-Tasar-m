import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { CURTAIN_CATALOG_CATEGORY_SLUGS } from "@/lib/catalog-taxonomy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const categories = await db.category.findMany({
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const empty = categories.filter((category) => category._count.products === 0);
  const outsideCatalog = categories.filter(
    (category) => !CURTAIN_CATALOG_CATEGORY_SLUGS.includes(category.slug as (typeof CURTAIN_CATALOG_CATEGORY_SLUGS)[number]),
  );

  return NextResponse.json({
    preview: empty,
    total: empty.length,
    outsideCatalog,
    outsideCatalogTotal: outsideCatalog.length,
  });
}

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const body = await req.json().catch(() => ({}));
  const action = body?.action === "outside" ? "outside" : "empty";

  if (action === "outside") {
    const outsideCatalog = await db.category.findMany({
      where: { slug: { notIn: [...CURTAIN_CATALOG_CATEGORY_SLUGS] } },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    const blocked = outsideCatalog.filter((category) => category._count.products > 0);
    const deletableIds = outsideCatalog
      .filter((category) => category._count.products === 0)
      .map((category) => category.id);

    if (blocked.length > 0) {
      return NextResponse.json(
        {
          error: "Ürün bağlı katalog dışı kategoriler var. Önce bu ürünleri doğru perde kategorisine taşıyın.",
          blocked,
          deletable: outsideCatalog.filter((category) => category._count.products === 0),
        },
        { status: 409 },
      );
    }

    if (deletableIds.length === 0) {
      return NextResponse.json({ message: "Katalog dışı kategori bulunamadı.", deleted: 0 });
    }

    const { count } = await db.category.deleteMany({ where: { id: { in: deletableIds } } });
    revalidateTag("storefront-products");
    revalidateTag("storefront-homepage");
    return NextResponse.json({
      message: `${count} katalog dışı kategori silindi.`,
      deleted: count,
    });
  }

  const empty = await db.category.findMany({
    where: { products: { none: {} } },
    select: { id: true },
  });

  if (empty.length === 0)
    return NextResponse.json({ message: "Silinecek boş kategori bulunamadı.", deleted: 0 });

  const ids = empty.map((c) => c.id);
  const { count } = await db.category.deleteMany({ where: { id: { in: ids } } });
  revalidateTag("storefront-products");
  revalidateTag("storefront-homepage");

  return NextResponse.json({
    message: `${count} boş kategori silindi.`,
    deleted: count,
  });
}
