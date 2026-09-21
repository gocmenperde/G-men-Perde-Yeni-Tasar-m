#!/usr/bin/env node
/**
 * SahraSoft Ürün Listesi Import Scripti
 * Kullanım: pnpm --filter @workspace/store exec node scripts/sahrasoft-import.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new PrismaClient();

const EXCEL_PATH = join(
  __dirname,
  "../../../attached_assets/SahraSoft_Urun_Listesi_300Zam_Nokta2_1779609211700.xlsx"
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function parsePrice(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(",", ".")) || 0;
}

const CAT_MAP = {
  "KIRTASİYE": "Kırtasiye",
  "KİTAP": "Kitap",
  "BELİRTİLMEDİ": "Diğer",
  "RİSALE-İ NUR KÜLLİYATI": "Dini Kitaplar",
  "KURANI KERİM": "Dini Kitaplar",
  "İHTİYAÇ": "Diğer",
  "OYUNCAK": "Oyuncak",
  "YAPRAK TEST": "Test & Sınav",
  "DERGİ": "Dergi",
  "ESANS": "Diğer",
  "MESH": "Diğer",
  "YABANCI DİL": "Yabancı Dil",
  "EĞİTİM": "Eğitim",
  "TAKVİM": "Kırtasiye",
  "ŞEMSİYE": "Diğer",
  "DENEME": "Test & Sınav",
  "TEKNOLOJİ": "Teknoloji",
  "CEP BOY RİSALE": "Dini Kitaplar",
  "CEVŞEN": "Dini Kitaplar",
  "ÇANTA": "Çanta",
  "HAZIRLIK": "Test & Sınav",
  "DUA": "Dini Kitaplar",
  "TEKSTİL": "Diğer",
};

async function main() {
  console.log("📂 Excel okunuyor...");
  const buf = readFileSync(EXCEL_PATH);
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  console.log(`✅ ${rows.length} satır bulundu.`);

  // Benzersiz kategori adları
  const uniqueCatNames = [...new Set(
    rows.map(r => CAT_MAP[r["Kategori"]] || "Diğer")
  )];

  console.log(`\n📁 ${uniqueCatNames.length} kategori oluşturuluyor...`);
  const catIdMap = {};
  for (const name of uniqueCatNames) {
    const slug = slugify(name);
    const cat = await db.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    catIdMap[name] = cat.id;
  }
  console.log("✅ Kategoriler hazır.");

  // Benzersiz stok kodları → brand
  const uniqueBrands = [...new Set(
    rows.map(r => (r["Stok Kodu"] || "").trim()).filter(Boolean)
  )];

  console.log(`\n🏷️  ${uniqueBrands.length} marka oluşturuluyor...`);
  const brandIdMap = {};
  for (const name of uniqueBrands) {
    const slug = slugify(name) || `brand-${Math.random().toString(36).slice(2, 8)}`;
    try {
      const brand = await db.brand.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      brandIdMap[name] = brand.id;
    } catch {
      // slug çakışması
    }
  }
  console.log("✅ Markalar hazır.");

  // Mevcut barkodları çek (çakışma önleme)
  console.log("\n🔍 Mevcut barkodlar alınıyor...");
  const existing = await db.product.findMany({
    select: { sku: true, slug: true },
  });
  const existingSkus = new Set(existing.map(p => p.sku).filter(Boolean));
  const existingSlugs = new Set(existing.map(p => p.slug));
  console.log(`📊 DB'de ${existing.length} ürün var.`);

  // Ürünleri import et
  console.log("\n🚀 Ürünler import ediliyor...");
  let created = 0, skipped = 0, errors = 0;
  const BATCH = 50;

  const validRows = rows.filter(r => {
    const barcode = String(r["Barkod"] || "").trim();
    const name = (r["Ürün Adı"] || "").trim();
    const price = parsePrice(r["Satış Fiyatı"]);
    return name && price > 0;
  });

  console.log(`📦 ${validRows.length} geçerli ürün işlenecek (${rows.length - validRows.length} fiyatsız/adsız atlandı)`);

  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH);

    for (const row of batch) {
      const barcode = String(row["Barkod"] || "").trim();
      const name = (row["Ürün Adı"] || "").trim();
      const price = parsePrice(row["Satış Fiyatı"]);
      const purchasePrice = parsePrice(row["Alış Fiyatı"]);
      const stock = parseInt(row["Miktar"]) || 0;
      const catName = CAT_MAP[row["Kategori"]] || "Diğer";
      const brandName = (row["Stok Kodu"] || "").trim();

      // Barkod zaten varsa atla
      if (barcode && existingSkus.has(barcode)) {
        skipped++;
        continue;
      }

      // Slug üret (benzersiz)
      let baseSlug = slugify(name) || `urun-${barcode}`;
      let slug = baseSlug;
      let suffix = 1;
      while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${barcode ? barcode.slice(-4) : suffix++}`;
      }
      existingSlugs.add(slug);
      if (barcode) existingSkus.add(barcode);

      try {
        await db.product.create({
          data: {
            name,
            slug,
            sku: barcode || undefined,
            barcode: barcode || undefined,
            price,
            comparePrice: purchasePrice > 0 && purchasePrice < price ? purchasePrice : undefined,
            stock,
            images: [],
            isActive: true,
            categoryId: catIdMap[catName] || null,
            brandId: brandName ? (brandIdMap[brandName] || null) : null,
          },
        });
        created++;
      } catch (e) {
        errors++;
        if (errors <= 5) console.error(`  ❌ ${name}: ${e.message}`);
      }
    }

    const pct = Math.round(((i + BATCH) / validRows.length) * 100);
    process.stdout.write(`\r  İlerleme: ${Math.min(i + BATCH, validRows.length)}/${validRows.length} (%${Math.min(pct, 100)}) — ✅${created} ⏭️${skipped} ❌${errors}`);
  }

  console.log(`\n\n🎉 Tamamlandı!`);
  console.log(`  ✅ Eklenen  : ${created}`);
  console.log(`  ⏭️  Atlanan  : ${skipped}`);
  console.log(`  ❌ Hata     : ${errors}`);

  const total = await db.product.count();
  console.log(`\n📊 DB'de toplam ürün: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
