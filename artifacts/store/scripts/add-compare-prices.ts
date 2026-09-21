import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function nicePrice(raw: number): number {
  if (raw < 20)   return Math.round(raw * 2) / 2;
  if (raw < 50)   return Math.ceil(raw / 5) * 5 - 0.01;
  if (raw < 200)  return Math.ceil(raw / 5) * 5 - 0.01;
  if (raw < 500)  return Math.ceil(raw / 10) * 10 - 0.01;
  return Math.ceil(raw / 50) * 50 - 0.01;
}

const MARKUPS = [15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 28, 30];

function pickMarkup(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return MARKUPS[Math.abs(h) % MARKUPS.length];
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, price: true, slug: true },
  });

  console.log(`Toplam ${products.length} ürün bulundu.`);
  let updated = 0;

  for (const p of products) {
    const price = Number(p.price);
    if (price <= 0) continue;

    const pct = pickMarkup(p.id);
    const comparePrice = nicePrice(price * (1 + pct / 100));

    await prisma.product.update({
      where: { id: p.id },
      data: { comparePrice },
    });

    console.log(`  ✓ ${p.slug.slice(0, 40).padEnd(40)} ₺${price.toFixed(2)} → ₺${comparePrice.toFixed(2)}  (%${pct})`);
    updated++;
  }

  console.log(`\n✅ ${updated} ürün güncellendi.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
