import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/bulk-price-update
// Body: {
//   operation: "increase" | "decrease" | "remove-sale" | "add-sale"
//   percentage: number          (1-99, gözardı edilir remove-sale için)
//   scope: "all" | "category" | "brand"
//   scopeId?: string
// }
export async function POST(req: NextRequest) {
  try {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
   return NextResponse.json(
     { error: "Otomatik toplu fiyat değişikliği devre dışıdır. Fiyatlar CSV/XLSX ile yönetilir." },
     { status: 410 },
   );

  const body = await req.json().catch(() => ({}));
  const { operation, percentage, scope, scopeId } = body;

  if (!["increase", "decrease", "remove-sale", "add-sale"].includes(operation)) {
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  }

  const pct = Number(percentage ?? 0);
  if (operation !== "remove-sale" && (isNaN(pct) || pct <= 0 || pct > 99)) {
    return NextResponse.json({ error: "Yüzde 1–99 arasında olmalı" }, { status: 400 });
  }

  const where: any = { isActive: true };
  if (scope === "category" && scopeId) where.categoryId = scopeId;
  if (scope === "brand" && scopeId) where.brandId = scopeId;

  const products = await db.product.findMany({
    where,
    select: { id: true, price: true, comparePrice: true },
  });

  if (products.length === 0) {
    return NextResponse.json({ updated: 0, message: "Kapsama giren ürün bulunamadı." });
  }

  const multiplier = pct / 100;
  let updated = 0;

  const CHUNK = 50;
  for (let i = 0; i < products.length; i += CHUNK) {
    const chunk = products.slice(i, i + CHUNK);

    await Promise.all(
      chunk.map((p) => {
        const price = Number(p.price);
        const comparePrice = p.comparePrice ? Number(p.comparePrice) : null;

        let data: { price?: number; comparePrice?: number | null } = {};

        if (operation === "increase") {
          // Hem fiyat hem karşılaştırma fiyatını artır
          data.price = Math.round(price * (1 + multiplier) * 100) / 100;
          if (comparePrice) {
            data.comparePrice = Math.round(comparePrice * (1 + multiplier) * 100) / 100;
          }
        } else if (operation === "decrease") {
          // Fiyatı düşür, compare fiyatını koru (indirim göstergesi artsın)
          data.price = Math.max(0.01, Math.round(price * (1 - multiplier) * 100) / 100);
          if (comparePrice) {
            data.comparePrice = Math.round(comparePrice * (1 - multiplier) * 100) / 100;
          }
        } else if (operation === "add-sale") {
          // comparePrice = eski fiyat, price = indirimli fiyat
          data.comparePrice = price;
          data.price = Math.max(0.01, Math.round(price * (1 - multiplier) * 100) / 100);
        } else if (operation === "remove-sale") {
          // comparePrice kaldır
          data.comparePrice = null;
        }

        updated++;
        return db.product.update({ where: { id: p.id }, data });
      })
    );
  }

  return NextResponse.json({
    ok: true,
    updated,
    message: `${updated} ürün güncellendi.`,
  });
  } catch (e) {
    console.error("[bulk-price-update]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
