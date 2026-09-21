#!/usr/bin/env node
/**
 * fix-low-prices.mjs
 * Fiyatı ₺5'in altında olan ürünleri Trendyol'dan çekerek düzeltir.
 *
 * Kullanım:
 *   node scripts/fix-low-prices.mjs              → düzelt (DB'ye yaz)
 *   node scripts/fix-low-prices.mjs --dry-run    → sadece göster, yazma
 *   node scripts/fix-low-prices.mjs --threshold 10  → ₺10 altını düzelt
 */

import { PrismaClient } from "@prisma/client";

const NEON_URL =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  "postgresql://neondb_owner:npg_VjPBvRh7z8SW@ep-rough-snow-al1cznfd.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!NEON_URL) {
  console.error("❌ DATABASE_URL veya NEON_DATABASE_URL env değişkeni gerekli.");
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const threshIdx = args.indexOf("--threshold");
const PRICE_THRESHOLD = threshIdx !== -1 ? parseFloat(args[threshIdx + 1]) : 5;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const db = new PrismaClient({
  log: [],
  datasources: { db: { url: NEON_URL } },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
  process.stdout.write(`[${new Date().toISOString().slice(11, 19)}] ${msg}\n`);
}

/** Fiyatı akıllıca parse et — Türkçe format dahil */
function parsePrice(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  // "1.200,50" → 1200.50 (Türkçe)
  if (s.includes(",") && s.includes(".")) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  }
  // "1200,50" → 1200.50
  if (s.includes(",") && !s.includes(".")) {
    return parseFloat(s.replace(",", "."));
  }
  return parseFloat(s);
}

function calcComparePrice(price) {
  const rates = [0.10, 0.12, 0.15, 0.18, 0.20, 0.25];
  const rate = rates[Math.floor(Math.random() * rates.length)];
  return parseFloat((price * (1 + rate)).toFixed(2));
}

async function safeFetch(url, opts = {}, ms = 10000) {
  try {
    const res = await fetch(url, {
      ...opts,
      signal: AbortSignal.timeout(ms),
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
}

async function trendyolPrice(name, brand) {
  const q = brand ? `${brand} ${name}` : name;
  const url = `https://public.trendyol.com/discovery-web-searchgw-service/api/filter/search/v2?q=${encodeURIComponent(q)}&pi=1&culture=tr-TR&userGenderId=1&priceBucketId=1&scoringAlgorithmId=2&categoryRelevancyEnabled=false&isLegalRequirementConfirmed=false&searchStrategyType=DEFAULT&productStampType=TypeA`;
  const res = await safeFetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "Accept-Language": "tr-TR,tr;q=0.9",
      Origin: "https://www.trendyol.com",
      Referer: "https://www.trendyol.com/",
    },
  });
  if (!res) return null;
  try {
    const data = await res.json();
    const products = data?.result?.products ?? [];
    for (const p of products.slice(0, 3)) {
      const rawPrice =
        p?.price?.sellingPrice?.value ??
        p?.price?.discountedPrice?.value ??
        p?.priceInfo?.price;
      const price = rawPrice != null ? parseFloat(rawPrice) : null;
      if (price && price >= PRICE_THRESHOLD) return price;
    }
  } catch {}
  return null;
}

async function n11Price(name) {
  const url = `https://www.n11.com/arama?q=${encodeURIComponent(name)}&srt=MOST_RELEVANT&pg=1`;
  const res = await safeFetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html",
      "Accept-Language": "tr-TR,tr;q=0.9",
    },
  }, 8000);
  if (!res) return null;
  try {
    const html = await res.text();
    const match = html.match(/"price":\s*"?([\d.,]+)"?/);
    if (match) {
      const p = parsePrice(match[1]);
      if (p && p >= PRICE_THRESHOLD) return p;
    }
  } catch {}
  return null;
}

async function main() {
  log(`🔍 ${DRY_RUN ? "[DRY-RUN] " : ""}Fiyatı ₺${PRICE_THRESHOLD} altında olan ürünler aranıyor...`);

  const products = await db.product.findMany({
    where: { price: { lt: PRICE_THRESHOLD } },
    select: {
      id: true,
      name: true,
      price: true,
      comparePrice: true,
      brand: { select: { name: true } },
    },
    orderBy: { price: "asc" },
  });

  log(`📦 ${products.length} ürün bulundu (₺${PRICE_THRESHOLD} altı fiyat)`);

  if (products.length === 0) {
    log("✅ Düzeltilecek ürün yok.");
    await db.$disconnect();
    return;
  }

  let fixed = 0, notFound = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const brand = p.brand?.name ?? "";
    log(`[${i + 1}/${products.length}] ${p.name.slice(0, 50)} — mevcut: ₺${p.price}`);

    let newPrice = null;

    // 1. Trendyol
    newPrice = await trendyolPrice(p.name, brand);
    await sleep(150);

    // 2. N11 fallback
    if (!newPrice) {
      newPrice = await n11Price(p.name);
      await sleep(150);
    }

    if (newPrice && newPrice >= PRICE_THRESHOLD) {
      const comparePrice = calcComparePrice(newPrice);
      log(`  ✅ Yeni fiyat: ₺${newPrice} (karş: ₺${comparePrice})`);
      if (!DRY_RUN) {
        await db.product.update({
          where: { id: p.id },
          data: { price: newPrice, comparePrice },
        });
      }
      fixed++;
    } else {
      log(`  ⚠️  Kaynak bulunamadı, atlandı.`);
      notFound++;
    }

    // Her 20 üründe bir kısa bekleme
    if ((i + 1) % 20 === 0) {
      log(`  ⏸  Kısa bekleme...`);
      await sleep(1500);
    }
  }

  log(`\n✅ TAMAMLANDI — Düzeltilen: ${fixed} | Bulunamayan: ${notFound}`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ HATA:", e.message);
  await db.$disconnect();
  process.exit(1);
});
