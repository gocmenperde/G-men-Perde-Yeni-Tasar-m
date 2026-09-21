import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — istatistik
export async function GET(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();
    return NextResponse.json(
      { error: "Otomatik açıklama zenginleştirme devre dışıdır. Açıklamalar CSV/XLSX ile yönetilir." },
      { status: 410 },
    );

    const [total, withBarcode, alreadyTagged] = await Promise.all([
      db.product.count(),
      db.product.count({
        where: { OR: [{ barcode: { not: null } }, { sku: { not: null } }] },
      }),
      db.product.count({
        where: {
          description: { contains: "Barkod:" },
          OR: [{ barcode: { not: null } }, { sku: { not: null } }],
        },
      }),
    ]);

    return NextResponse.json({ total, withBarcode, alreadyTagged, pending: withBarcode - alreadyTagged });
  } catch (e) {
    console.error("[barcode-to-desc GET]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// POST — toplu barkod ekle
export async function POST(req: NextRequest) {
  try {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
   return NextResponse.json(
     { error: "Otomatik açıklama zenginleştirme devre dışıdır. Açıklamalar CSV/XLSX ile yönetilir." },
     { status: 410 },
   );

  const body = await req.json().catch(() => ({}));
  const dryRun = body.dryRun === true;

  // Barkodu olan ve henüz "Barkod:" içermeyen ürünleri çek
  const products = await db.product.findMany({
    where: {
      OR: [{ barcode: { not: null } }, { sku: { not: null } }],
      NOT: { description: { contains: "Barkod:" } },
    },
    select: { id: true, barcode: true, sku: true, description: true },
  });

  if (dryRun) {
    return NextResponse.json({ count: products.length, dryRun: true });
  }

  let updated = 0;
  let skipped = 0;

  // Batch güncelle
  const BATCH = 50;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (p) => {
        const barcodeVal = p.barcode ?? p.sku;
        if (!barcodeVal) { skipped++; return; }

        const suffix = `\n\nBarkod: ${barcodeVal}`;
        const newDesc = p.description ? `${p.description.trim()}${suffix}` : `Barkod: ${barcodeVal}`;

        await db.product.update({
          where: { id: p.id },
          data: { description: newDesc },
        });
        updated++;
      })
    );
  }

  return NextResponse.json({ updated, skipped, total: products.length });
  } catch (e) {
    console.error("[barcode-to-desc]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
