#!/usr/bin/env node
/**
 * Resim Güncelleme Scripti
 * -------------------------
 * Veritabanındaki placeholder resimlerini BKM Kitap'tan gerçek resimlerle değiştirir.
 * Hem "Product" hem de "Book" tipindeki JSON-LD yapılarını destekler.
 *
 * Kullanım:
 *   node scripts/fix-images.js                       → tüm ürünleri işle
 *   node scripts/fix-images.js --dry-run              → DB'ye yazma, sadece test
 *   node scripts/fix-images.js --batch 500            → 500'lük batch
 *   node scripts/fix-images.js --offset 1000          → 1000'den başla
 *   node scripts/fix-images.js --input /tmp/list.txt  → hazır ürün listesi
 *   node scripts/fix-images.js --placeholder-only     → sadece placeholder olanları işle
 *
 * Ortam: DATABASE_URL (veya script içi hardcode)
 */

process.emitWarning = () => {};

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ─── Ayarlar ─────────────────────────────────────────────────────────────────
const DB_CONN = process.env.DATABASE_URL ||
  'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const DB_PASS = process.env.DB_PASS || 'npg_QDG0cV8pRgFS';
const CLOUDINARY_CLOUD = 'dbzdls18g';
const BKM_BASE = 'https://www.bkmkitap.com';
const PLACEHOLDER = 'https://placehold.co/400x400/f1f5f9/94a3b8';
const LOG_FILE = path.join(__dirname, 'fix-images.log');
const SQL_BATCH_FILE = path.join(__dirname, '_batch_update.sql');
const CONCURRENT = 6;
const DELAY_MS = 100;
const SQL_BATCH_SIZE = 50;

// ─── Argümanlar ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PLACEHOLDER_ONLY = args.includes('--placeholder-only');
const BATCH_IDX = args.indexOf('--batch');
const BATCH_SIZE = BATCH_IDX !== -1 ? parseInt(args[BATCH_IDX + 1]) || 500 : 999999;
const OFFSET_IDX = args.indexOf('--offset');
const OFFSET = OFFSET_IDX !== -1 ? parseInt(args[OFFSET_IDX + 1]) || 0 : 0;
const INPUT_IDX = args.indexOf('--input');
const INPUT_FILE = INPUT_IDX !== -1 ? args[INPUT_IDX + 1] : null;

// ─── Yardımcı ─────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) {}
}

function fetchPage(url, redirectCount = 0) {
  if (redirectCount > 3) return Promise.resolve({ html: '', status: 0 });
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      }
    }, res => {
      if ([301, 302, 303].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location : BKM_BASE + res.headers.location;
        return fetchPage(next, redirectCount + 1).then(resolve);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8'), status: res.statusCode }));
    });
    req.on('error', () => resolve({ html: '', status: 0 }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ html: '', status: 0 }); });
  });
}

function parseProduct(html) {
  const matches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  for (const m of matches) {
    try {
      const j = JSON.parse(m[1].trim());
      // Tek obje - Product veya Book
      if (['Product', 'Book', 'IndividualProduct'].includes(j['@type'])) return j;
      // Array formatı
      if (Array.isArray(j)) {
        const p = j.find(x => ['Product', 'Book', 'IndividualProduct'].includes(x['@type']));
        if (p) return p;
      }
      // @graph formatı
      if (j['@graph']) {
        const p = j['@graph'].find(x => ['Product', 'Book', 'IndividualProduct'].includes(x['@type']));
        if (p) return p;
      }
    } catch (e) {}
  }
  return null;
}

function extractImages(product) {
  const raw = Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []);
  const urls = raw.map(img => typeof img === 'string' ? img : (img?.url || img?.['@id'] || ''))
    .filter(u => u && u.startsWith('http'));

  // BKM CDN resimleri Cloudinary fetch ile sun
  return urls.map(u => {
    if (u.includes('cdn.bkmkitap.com')) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/q_auto,f_auto/${u}`;
    }
    return u;
  });
}

function pgArray(arr) {
  const items = arr.map(s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'");
  return 'ARRAY[' + items.join(',') + ']';
}

function runSqlFile(filePath) {
  try {
    execFileSync('psql', [DB_CONN, '-f', filePath], {
      env: { ...process.env, PGPASSWORD: DB_PASS },
      stdio: 'pipe',
    });
    return true;
  } catch (e) {
    log('SQL Hata: ' + (e.stderr?.toString() || e.message).slice(0, 200));
    return false;
  }
}

function exportFromDb(whereClause) {
  try {
    const sql = `SELECT id, slug FROM "Product" WHERE ${whereClause} ORDER BY "createdAt" ASC`;
    const result = execFileSync('psql', [DB_CONN, '-t', '-A', "-F|", '-c', sql], {
      env: { ...process.env, PGPASSWORD: DB_PASS },
      stdio: 'pipe',
    }).toString().trim();
    return result.split('\n').filter(Boolean).map(line => {
      const [id, slug] = line.split('|');
      return { id: (id || '').trim(), slug: (slug || '').trim() };
    }).filter(p => p.id && p.slug);
  } catch (e) {
    log('DB sorgu hatası: ' + e.message.slice(0, 200));
    return [];
  }
}

// ─── Ana işlem ────────────────────────────────────────────────────────────────
async function main() {
  log('='.repeat(60));
  log(`BKM Resim Güncelleme${DRY_RUN ? ' [DRY-RUN]' : ''}${PLACEHOLDER_ONLY ? ' [PLACEHOLDER-ONLY]' : ''}`);
  log(`Batch: ${BATCH_SIZE} | Offset: ${OFFSET}`);

  // Ürün listesini al
  let products = [];

  if (INPUT_FILE && fs.existsSync(INPUT_FILE)) {
    log(`Dosyadan okunuyor: ${INPUT_FILE}`);
    products = fs.readFileSync(INPUT_FILE, 'utf-8')
      .split('\n').filter(Boolean)
      .map(line => { const [id, slug] = line.split('|'); return { id: (id||'').trim(), slug: (slug||'').trim() }; })
      .filter(p => p.id && p.slug);
  } else {
    const where = PLACEHOLDER_ONLY
      ? "images[1] = 'https://placehold.co/400x400/f1f5f9/94a3b8'"
      : "images[1] LIKE 'blob:%' OR images[1] = 'https://placehold.co/400x400/f1f5f9/94a3b8'";
    log('Veritabanından ürünler sorgulanıyor...');
    products = exportFromDb(where);
  }

  log(`Toplam işlenecek ürün: ${products.length}`);
  const slice = products.slice(OFFSET, OFFSET + BATCH_SIZE);
  log(`Bu çalıştırmada: ${slice.length} ürün (offset: ${OFFSET})`);

  const stats = { total: slice.length, found: 0, placeholder: 0, priceUpdated: 0, errors: 0 };
  let sqlBuffer = [];

  async function flushSql() {
    if (sqlBuffer.length === 0) return;
    const toFlush = sqlBuffer.splice(0, sqlBuffer.length);
    if (DRY_RUN) { log(`  [DRY-RUN] ${toFlush.length} güncelleme atlandı`); return; }
    const sql = 'BEGIN;\n' + toFlush.join('\n') + '\nCOMMIT;\n';
    fs.writeFileSync(SQL_BATCH_FILE, sql, 'utf-8');
    const ok = runSqlFile(SQL_BATCH_FILE);
    log(ok ? `  → ${toFlush.length} satır DB'ye yazıldı ✓` : `  → DB yazma hatası ✗`);
  }

  for (let i = 0; i < slice.length; i += CONCURRENT) {
    const chunk = slice.slice(i, i + CONCURRENT);

    const results = await Promise.all(chunk.map(async ({ id, slug }) => {
      try {
        const { html, status } = await fetchPage(`${BKM_BASE}/${slug}`);
        if (status === 404 || !html) return { id, slug, images: [], price: null, found: false, status };
        const product = parseProduct(html);
        if (!product) return { id, slug, images: [], price: null, found: false, status: 'no-data' };
        const images = extractImages(product);
        const price = product.offers?.price ? parseFloat(product.offers.price) : null;
        return { id, slug, images, price, found: images.length > 0, status };
      } catch (e) {
        stats.errors++;
        return { id, slug, images: [], price: null, found: false, status: 'error' };
      }
    }));

    for (const r of results) {
      if (r.images.length > 0) {
        // Gerçek resim bulundu - DB'yi güncelle
        stats.found++;
        const imgExpr = pgArray(r.images);
        let sql = `UPDATE "Product" SET images=${imgExpr}, "updatedAt"=NOW()`;
        if (r.price && r.price > 0) { sql += `, price=${r.price}`; stats.priceUpdated++; }
        sql += ` WHERE id='${r.id}';`;
        sqlBuffer.push(sql);
        log(`  ✓ [${r.slug}]: ${r.images.length} resim | ${r.price || '?'} TL`);
      } else {
        // Bulunamadı - placeholder zaten ayarlı, sadece say
        stats.placeholder++;
      }
    }

    if (sqlBuffer.length >= SQL_BATCH_SIZE) await flushSql();

    const processed = Math.min(i + CONCURRENT, slice.length);
    if (processed % 100 === 0 || processed === slice.length) {
      const pct = ((processed / slice.length) * 100).toFixed(1);
      log(`📊 ${processed}/${slice.length} (${pct}%) | Gerçek: ${stats.found} | Placeholder: ${stats.placeholder} | Hata: ${stats.errors}`);
    }

    await sleep(DELAY_MS);
  }

  await flushSql();

  log('─'.repeat(60));
  log('SONUÇ:');
  log(`  İşlenen          : ${stats.total}`);
  log(`  Gerçek resim      : ${stats.found}`);
  log(`  Placeholder       : ${stats.placeholder}`);
  log(`  Fiyat güncellendi : ${stats.priceUpdated}`);
  log(`  Hata              : ${stats.errors}`);
  log('='.repeat(60));
}

main().catch(e => {
  log('KRİTİK HATA: ' + e.message + '\n' + e.stack);
  process.exit(1);
});
