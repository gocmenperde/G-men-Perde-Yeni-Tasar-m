import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const empty = await db.category.findMany({
    where: { products: { none: {} } },
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ preview: empty, total: empty.length });
}

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const empty = await db.category.findMany({
    where: { products: { none: {} } },
    select: { id: true },
  });

  if (empty.length === 0)
    return NextResponse.json({ message: "Silinecek boş kategori bulunamadı.", deleted: 0 });

  const ids = empty.map((c) => c.id);
  const { count } = await db.category.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({
    message: `${count} boş kategori silindi.`,
    deleted: count,
  });
}
