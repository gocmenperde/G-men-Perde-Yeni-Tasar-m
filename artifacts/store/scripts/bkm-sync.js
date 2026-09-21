#!/usr/bin/env node
/**
 * BKM Kitap Fiyat & Stok Senkronizasyon Scripti
 * ------------------------------------------------
 * Kullanım:
 *   node scripts/bkm-sync.js                  → tüm BKM ürünlerini güncelle
 *   node scripts/bkm-sync.js --dry-run        → sadece kontrol et, DB'ye yazma
 *   node scripts/bkm-sync.js --batch 100      → her seferinde 100 ürün işle
 *   node scripts/bkm-sync.js --new-only       → sadece yeni ürünleri ekle
 *   node scripts/bkm-sync.js --offset 500     → 500. üründen başla
 *
 * Ortam değişkeni: DATABASE_URL veya NEON_DATABASE_URL
 */

process.emitWarning = () => {};

const https = require('https');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// ─── Ayarlar ─────────────────────────────────────────────────────────────────
const NEON_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const CLOUDINARY_CLOUD = 'dbzdls18g';
const BKM_BASE = 'https://www.bkmkitap.com';
const SLUGS_FILE = path.join(__dirname, 'bkm_slugs.json');
const LOG_FILE = path.join(__dirname, 'bkm-sync.log');
const CONCURRENT_REQUESTS = 8;
const REQUEST_DELAY_MS = 80;

// ─── Argüman ayrıştırma ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const NEW_ONLY = args.includes('--new-only');
const BATCH_IDX = args.indexOf('--batch');
const BATCH_SIZE = BATCH_IDX !== -1 ? parseInt(args[BATCH_IDX + 1]) || 500 : 500;
const OFFSET_IDX = args.indexOf('--offset');
const OFFSET = OFFSET_IDX !== -1 ? parseInt(args[OFFSET_IDX + 1]) || 0 : 0;

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function fetchPage(url) {
  return new Promise(resolve => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, status: res.statusCode }));
    });
    req.on('error', () => resolve({ html: '', status: 0 }));
    req.setTimeout(12000, () => { req.destroy(); resolve({ html: '', status: 0 }); });
  });
}

function parseJsonLd(html) {
  try {
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const j = JSON.parse(m[1]);
        if (j['@type'] === 'Product' && j.offers?.price) return j;
      } catch (e) {}
    }
  } catch (e) {}
  return null;
}

function slugify(t) {
  return t.toString().toLowerCase()
    .replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[şŞ]/g, 's')
    .replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Türkçe ve uluslararası fiyat formatlarını doğru parse eder.
 *  "1.200,50" → 1200.50  |  "1,200.50" → 1200.50  |  "120.50" → 120.50
 */
function parseTrPrice(raw) {
  if (raw == null) return 0;
  const s = String(raw).trim();
  if (!s) return 0;
  // Hem nokta hem virgül varsa: hangi format olduğunu son ayırıcıdan anla
  if (s.includes('.') && s.includes(',')) {
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Türkçe: "1.200,50" → binlik=nokta, ondalık=virgül
      return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      // İngilizce: "1,200.50" → binlik=virgül, ondalık=nokta
      return parseFloat(s.replace(/,/g, '')) || 0;
    }
  }
  // Sadece virgül: ondalık ayırıcı
  if (s.includes(',') && !s.includes('.')) {
    return parseFloat(s.replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

function decodeHtml(s) {
  return (s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/&uuml;/g, 'ü').replace(/&ccedil;/g, 'ç').replace(/&ouml;/g, 'ö')
    .replace(/&iuml;/g, 'ı').replace(/&scaron;/g, 'ş').replace(/&gbreve;/g, 'ğ')
    .replace(/&Uuml;/g, 'Ü').replace(/&Ccedil;/g, 'Ç').replace(/&Ouml;/g, 'Ö')
    .replace(/&Scaron;/g, 'Ş').replace(/&Gbreve;/g, 'Ğ')
    .replace(/&#\d+;/g, '').replace(/&[a-zA-Z]+;/g, '').trim();
}

function normalizeName(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function nameMatchScore(localName, sourceName) {
  const local = normalizeName(localName);
  const source = normalizeName(sourceName);
  if (!local || !source) return 0;
  if (local === source) return 1;
  if (local.includes(source) || source.includes(local)) return 0.92;

  const localTokens = new Set(local.split(' ').filter(token => token.length > 1));
  const sourceTokens = new Set(source.split(' ').filter(token => token.length > 1));
  if (!localTokens.size || !sourceTokens.size) return 0;
  let overlap = 0;
  for (const token of localTokens) {
    if (sourceTokens.has(token)) overlap++;
  }
  return overlap / Math.max(localTokens.size, sourceTokens.size);
}

async function inTransaction(client, work) {
  await client.query('BEGIN');
  try {
    const result = await work();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

function toCloudinary(imgUrl) {
  if (!imgUrl) return imgUrl;
  if (imgUrl.includes('cdn.bkmkitap.com')) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${imgUrl}`;
  }
  return imgUrl;
}

function isInStock(availability) {
  if (!availability) return true;
  return availability.toLowerCase().includes('instock');
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) {}
}

// ─── Ana işlem ────────────────────────────────────────────────────────────────
async function main() {
  log('='.repeat(60));
  log(`BKM Senkronizasyon başlıyor${DRY_RUN ? ' [DRY-RUN]' : ''}${NEW_ONLY ? ' [SADECE YENİ]' : ''}`);
  log(`Batch: ${BATCH_SIZE} | Offset: ${OFFSET}`);

  if (!NEON_URL) {
    log('KRİTİK HATA: DATABASE_URL veya NEON_DATABASE_URL env değişkeni gerekli.');
    process.exit(1);
  }

  if (!fs.existsSync(SLUGS_FILE)) {
    log('HATA: bkm_slugs.json bulunamadı!');
    process.exit(1);
  }

  const allSlugs = JSON.parse(fs.readFileSync(SLUGS_FILE, 'utf-8'));
  log(`Toplam BKM slug: ${allSlugs.length}`);

  const db = new Client({ connectionString: NEON_URL });
  await db.connect();
  log('Veritabanı bağlantısı kuruldu.');

  const existingRows = await db.query('SELECT id, name, slug, price, stock FROM "Product"');
  const dbBySlug = new Map(existingRows.rows.map(r => [r.slug, r]));
  const dbSlugs = new Set(existingRows.rows.map(r => r.slug));
  log(`Veritabanındaki mevcut ürün: ${dbSlugs.size}`);

  // Hangi slug'ları işleyeceğimizi belirle
  let slugsToProcess;
  if (NEW_ONLY) {
    slugsToProcess = allSlugs.filter(s => {
      let found = dbBySlug.has(s);
      if (!found) {
        for (let i = 2; i <= 5; i++) if (dbBySlug.has(s + '-' + i)) { found = true; break; }
      }
      return !found;
    });
    log(`Veritabanında olmayan yeni slug: ${slugsToProcess.length}`);
  } else {
    slugsToProcess = allSlugs;
    log(`Fiyat/stok güncellenecek slug: ${slugsToProcess.length}`);
  }

  slugsToProcess = slugsToProcess.slice(OFFSET, OFFSET + BATCH_SIZE);
  log(`Bu çalıştırmada işlenecek: ${slugsToProcess.length} slug (offset: ${OFFSET})`);

  const stats = {
    fetched: 0, priceUpdated: 0, stockUpdated: 0,
    newInserted: 0, notFound: 0, errors: 0, skipped: 0
  };

  // Toplu işlem
  for (let i = 0; i < slugsToProcess.length; i += CONCURRENT_REQUESTS) {
    const chunk = slugsToProcess.slice(i, i + CONCURRENT_REQUESTS);
    const results = await Promise.all(
      chunk.map(s => fetchPage(`${BKM_BASE}/${s}`))
    );

    for (let j = 0; j < chunk.length; j++) {
      const bkmSlug = chunk[j];
      const { html, status } = results[j];

      if (status === 404) { stats.notFound++; continue; }
      if (!html) { stats.errors++; continue; }

      const product = parseJsonLd(html);
      if (!product) { stats.skipped++; continue; }

      stats.fetched++;

      const newPrice = parseTrPrice(product.offers?.price);
      const inStock = isInStock(product.offers?.availability);
      const newStock = inStock ? 100 : 0;
      const sourceName = decodeHtml(product.name || '');

      // DB'de bu slug'u bul (exact veya -2/-3 varyantı)
      let dbRecord = dbBySlug.get(bkmSlug);
      if (!dbRecord) {
        for (let k = 2; k <= 5; k++) {
          dbRecord = dbBySlug.get(bkmSlug + '-' + k);
          if (dbRecord) break;
        }
      }

      if (dbRecord) {
        const matchScore = nameMatchScore(dbRecord.name, sourceName);
        if (matchScore < 0.72) {
          stats.skipped++;
          log(`  Atlandı — ürün adı eşleşmedi [${bkmSlug}] (${matchScore.toFixed(2)}): "${dbRecord.name}" ≠ "${sourceName}"`);
          continue;
        }
        if (newPrice <= 0) {
          stats.skipped++;
          log(`  Atlandı — geçersiz kaynak fiyatı [${bkmSlug}]`);
          continue;
        }

        // Mevcut ürünü güncelle
        const oldPrice = parseFloat(dbRecord.price);
        const oldStock = parseInt(dbRecord.stock);
        const priceChanged = Math.abs(oldPrice - newPrice) > 0.01;
        const stockChanged = oldStock !== newStock;

        if (priceChanged || stockChanged) {
          if (!DRY_RUN) {
            await inTransaction(db, () =>
              db.query(
                `UPDATE "Product" SET price=$1, stock=$2, "updatedAt"=NOW() WHERE id=$3`,
                [newPrice, newStock, dbRecord.id],
              ),
            );
          }
          if (priceChanged) {
            stats.priceUpdated++;
            if (priceChanged) log(`  Fiyat güncellendi [${bkmSlug}]: ${oldPrice} → ${newPrice} TL`);
          }
          if (stockChanged) {
            stats.stockUpdated++;
            if (stockChanged && !priceChanged) log(`  Stok güncellendi [${bkmSlug}]: ${oldStock > 0 ? 'Var' : 'Yok'} → ${newStock > 0 ? 'Var' : 'Yok'}`);
          }
        }
      } else if (NEW_ONLY || !dbRecord) {
        // Yeni ürün ekle
        try {
           const name = sourceName;
          if (!name || newPrice <= 0) { stats.skipped++; continue; }

          let finalSlug = bkmSlug, c = 2;
          while (dbSlugs.has(finalSlug)) finalSlug = bkmSlug + '-' + (c++);
          dbSlugs.add(finalSlug);

          const bName = product.brand?.name ? decodeHtml(product.brand.name) : null;
          const bSlug = bName ? slugify(bName) : null;
          const cats = product.category ? product.category.split('>').map(s => s.trim()).filter(Boolean) : [];
          const cSlug = cats.length ? slugify(cats[cats.length - 1]) : null;
          const imgs = (Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []))
            .map(toCloudinary);
          const id = 'bkm_' + (product.productId || finalSlug.replace(/-/g, '_').slice(0, 20));

          let bId = null;
          if (bSlug && bName) {
             await inTransaction(db, () =>
               db.query(
                 `INSERT INTO "Brand"(id,name,slug,"createdAt","updatedAt") VALUES($1,$2,$3,NOW(),NOW()) ON CONFLICT(slug) DO NOTHING`,
                 ['br_' + bSlug.slice(0, 25), bName, bSlug],
               ),
             );
            const br = await db.query('SELECT id FROM "Brand" WHERE slug=$1', [bSlug]);
            bId = br.rows[0]?.id || null;
          }

          let cId = null;
          if (cSlug && cats.length) {
            const cName = cats[cats.length - 1];
             await inTransaction(db, () =>
               db.query(
                 `INSERT INTO "Category"(id,name,slug,"createdAt","updatedAt") VALUES($1,$2,$3,NOW(),NOW()) ON CONFLICT(slug) DO NOTHING`,
                 ['cat_' + cSlug.slice(0, 25), cName, cSlug],
               ),
             );
            const cr = await db.query('SELECT id FROM "Category" WHERE slug=$1', [cSlug]);
            cId = cr.rows[0]?.id || null;
          }

          if (!DRY_RUN) {
            await db.query(
              `INSERT INTO "Product"(id,name,slug,sku,description,price,stock,images,"isFeatured","isActive",tags,"categoryId","brandId","createdAt","updatedAt")
               VALUES($1,$2,$3,$4,$5,$6,100,$7,false,true,'{}',$8,$9,NOW(),NOW()) ON CONFLICT(slug) DO NOTHING`,
              [id, name, finalSlug, product.sku || null, decodeHtml(product.description || name), newPrice, imgs, cId, bId]
            );
          }

          stats.newInserted++;
          log(`  Yeni ürün eklendi [${bkmSlug}]: ${name} — ${newPrice} TL`);
          dbBySlug.set(finalSlug, { id, slug: finalSlug, price: newPrice, stock: 100 });
        } catch (e) {
          stats.errors++;
        }
      }
    }

    // İlerleme göster (her 100 üründe bir)
    const processed = Math.min(i + CONCURRENT_REQUESTS, slugsToProcess.length);
    if (processed % 100 === 0 || processed === slugsToProcess.length) {
      const pct = ((processed / slugsToProcess.length) * 100).toFixed(1);
      log(`İlerleme: ${processed}/${slugsToProcess.length} (${pct}%) — Güncellenen fiyat: ${stats.priceUpdated} | Stok: ${stats.stockUpdated} | Yeni: ${stats.newInserted}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  await db.end();

  log('─'.repeat(60));
  log('SONUÇ:');
  log(`  Çekilen sayfa     : ${stats.fetched}`);
  log(`  Fiyat güncellenen : ${stats.priceUpdated}`);
  log(`  Stok güncellenen  : ${stats.stockUpdated}`);
  log(`  Yeni eklenen      : ${stats.newInserted}`);
  log(`  Bulunamayan (404) : ${stats.notFound}`);
  log(`  Hata              : ${stats.errors}`);
  log(`  Atlanan           : ${stats.skipped}`);
  log(`Log dosyası        : ${LOG_FILE}`);
  log('='.repeat(60));
}

main().catch(e => {
  log('KRİTİK HATA: ' + e.message);
  process.exit(1);
});
