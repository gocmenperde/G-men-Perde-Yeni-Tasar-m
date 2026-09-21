import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const { type, id, mode, value, minPrice, applyOnlyNoDiscount } = await req.json();

  if (!type || !["category", "brand", "all"].includes(type))
    return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
  if (!mode || !["percent", "fixed"].includes(mode))
    return NextResponse.json({ error: "Geçersiz mod." }, { status: 400 });
  if (typeof value !== "number" || value <= 0)
    return NextResponse.json({ error: "Geçersiz değer." }, { status: 400 });

  const where: any = { isActive: true };
  if (type === "category" && id) where.categoryId = id;
  if (type === "brand" && id) where.brandId = id;
  if (minPrice) where.price = { gte: minPrice };
  if (applyOnlyNoDiscount) where.comparePrice = null;

  const products = await db.product.findMany({ where, select: { id: true, price: true } });
  if (products.length === 0)
    return NextResponse.json({ error: "Bu filtreye uyan ürün bulunamadı." }, { status: 404 });

  let updated = 0;
  await Promise.all(
    products.map(async (p) => {
      const original = Number(p.price);
      let newPrice: number;
      if (mode === "percent") {
        newPrice = parseFloat((original * (1 - value / 100)).toFixed(2));
      } else {
        newPrice = parseFloat((original - value).toFixed(2));
      }
      if (newPrice < 0.01) return;
      await db.product.update({
        where: { id: p.id },
        data: { comparePrice: original, price: newPrice },
      });
      updated++;
    }),
  );

  return NextResponse.json({ updated, total: products.length });
}

export async function DELETE(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const { type, id } = await req.json();
  const where: any = { isActive: true, comparePrice: { not: null } };
  if (type === "category" && id) where.categoryId = id;
  if (type === "brand" && id) where.brandId = id;

  const products = await db.product.findMany({
    where,
    select: { id: true, comparePrice: true },
  });

  await Promise.all(
    products.map((p) =>
      db.product.update({
        where: { id: p.id },
        data: { price: p.comparePrice!, comparePrice: null },
      }),
    ),
  );

  return NextResponse.json({ restored: products.length });
}
