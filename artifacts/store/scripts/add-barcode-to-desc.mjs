import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const products = await db.product.findMany({
    where: {
      OR: [{ barcode: { not: null } }, { sku: { not: null } }],
    },
    select: { id: true, name: true, barcode: true, sku: true, description: true },
  });

  console.log(`Barkodu olan toplam ürün: ${products.length}`);

  let updated = 0;
  let skipped = 0;

  for (const p of products) {
    const barcodeVal = p.barcode ?? p.sku;
    if (!barcodeVal) { skipped++; continue; }

    // Zaten "Barkod:" içeriyorsa atla
    if (p.description && p.description.includes("Barkod:")) {
      skipped++;
      continue;
    }

    const suffix = `\n\nBarkod: ${barcodeVal}`;
    const newDesc = p.description ? `${p.description.trim()}${suffix}` : `Barkod: ${barcodeVal}`;

    await db.product.update({
      where: { id: p.id },
      data: { description: newDesc },
    });

    updated++;
    console.log(`✅ ${p.name} → Barkod: ${barcodeVal}`);
  }

  console.log(`\n--- Tamamlandı ---`);
  console.log(`Güncellenen: ${updated}`);
  console.log(`Atlanan (zaten vardı): ${skipped}`);
}

main()
  .catch((e) => { console.error("HATA:", e.message); process.exit(1); })
  .finally(() => db.$disconnect());
