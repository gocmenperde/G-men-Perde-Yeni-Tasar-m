#!/usr/bin/env node
/**
 * Multi-Kaynak Resim & Fiyat Güncelleme Scripti
 * -----------------------------------------------
 * Placeholder resimli ürünler için N11 ve BKM Kitap'tan
 * benzer/muadil ürün resmi ve fiyatı bulur.
 *
 * Kullanım:
 *   node scripts/multi-source-images.js
 *   node scripts/multi-source-images.js --dry-run
 *   node scripts/multi-source-images.js --batch 200 --offset 0
 *   node scripts/multi-source-images.js --input /tmp/placeholder_with_names.txt
 *
 * Format: id|slug|name|price (her satır)
 */

process.emitWarning = () => {};

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ─── Ayarlar ─────────────────────────────────────────────────────────────────
const DB_CONN = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const DB_PASS = 'npg_QDG0cV8pRgFS';
const CLOUDINARY_CLOUD = 'dbzdls18g';
const PLACEHOLDER = 'https://placehold.co/400x400/f1f5f9/94a3b8';
const LOG_FILE = path.join(__dirname, 'multi-source.log');
const SQL_FILE = path.join(__dirname, '_multi_batch.sql');
const CONCURRENT = 5;
const DELAY_MS = 120;
const SQL_BATCH_SIZE = 50;

// ─── Argümanlar ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const BATCH_IDX = args.indexOf('--batch');
const BATCH_SIZE = BATCH_IDX !== -1 ? parseInt(args[BATCH_IDX + 1]) || 200 : 999999;
const OFFSET_IDX = args.indexOf('--offset');
const OFFSET = OFFSET_IDX !== -1 ? parseInt(args[OFFSET_IDX + 1]) || 0 : 0;
const INPUT_IDX = args.indexOf('--input');
const INPUT_FILE = INPUT_IDX !== -1 ? args[INPUT_IDX + 1] : '/tmp/placeholder_with_names.txt';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) {}
}

// ─── HTTP Fetch ───────────────────────────────────────────────────────────────
function fetchHtml(url, opts = {}) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': opts.mobile
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        ...(opts.headers || {}),
      }
    }, res => {
      if ([301, 302, 303].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchHtml(next, opts).then(resolve);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8'), status: res.statusCode }));
    });
    req.on('error', () => resolve({ html: '', status: 0 }));
    req.setTimeout(opts.timeout || 14000, () => { req.destroy(); resolve({ html: '', status: 0 }); });
  });
}

// ─── Arama Sorgusu Oluştur ────────────────────────────────────────────────────
function makeSearchQuery(name) {
  // Parantez içini temizle, sayıları koru (ölçü için önemli)
  return name
    .replace(/[()\/\\[\]{}*+?.^$|]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 60); // N11 çok uzun sorgu sevmez
}

// ─── N11 Arama ────────────────────────────────────────────────────────────────
async function searchN11(query) {
  const url = `https://www.n11.com/arama?q=${encodeURIComponent(query)}`;
  const { html, status } = await fetchHtml(url);
  if (status !== 200 || !html) return null;

  // JSON imageUrl alanı: "imageUrl":"https://n11scdn..."
  const imgMatch = html.match(/"imageUrl":"(https:\/\/n11scdn\.akamaized\.net\/a1\/[^"]+)"/);
  if (!imgMatch) return null;

  const imgUrl = imgMatch[1];

  // Fiyat: "168,21 TL" veya "168.21 TL" formatı
  let price = null;
  const tlPrice = html.match(/(\d{1,5}[,\.]\d{2})\s*(?:TL|₺)/);
  if (tlPrice) {
    price = parseFloat(tlPrice[1].replace(',', '.'));
  }

  return { source: 'n11', img: imgUrl, price };
}

// ─── BKM Kitap Arama ─────────────────────────────────────────────────────────
async function searchBKM(slug, name) {
  // Önce slug ile dene
  const directUrl = `https://www.bkmkitap.com/${slug}`;
  const { html: directHtml, status: directStatus } = await fetchHtml(directUrl);

  if (directStatus === 200 && directHtml) {
    const product = parseBKMJsonLd(directHtml);
    if (product) {
      const imgs = extractBKMImages(product);
      const price = product.offers?.price ? parseFloat(product.offers.price) : null;
      if (imgs.length > 0) return { source: 'bkm-direct', img: toCloudinary(imgs[0]), price };
    }
  }

  return null;
}

function parseBKMJsonLd(html) {
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1].trim());
      if (['Product', 'Book', 'IndividualProduct'].includes(j['@type'])) return j;
      if (Array.isArray(j)) { const p = j.find(x => ['Product', 'Book', 'IndividualProduct'].includes(x?.['@type'])); if (p) return p; }
      if (j['@graph']) { const p = j['@graph'].find(x => ['Product', 'Book', 'IndividualProduct'].includes(x?.['@type'])); if (p) return p; }
    } catch (e) {}
  }
  return null;
}

function extractBKMImages(product) {
  const raw = Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []);
  return raw.map(img => typeof img === 'string' ? img : (img?.url || '')).filter(u => u?.startsWith('http'));
}

function toCloudinary(url) {
  if (!url || url.includes('cloudinary.com')) return url;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/q_auto,f_auto/${url}`;
}

// ─── SQL Yardımcıları ─────────────────────────────────────────────────────────
function pgArray(arr) {
  return 'ARRAY[' + arr.map(s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'").join(',') + ']';
}

function runSqlFile(filePath) {
  try {
    execFileSync('psql', [DB_CONN, '-f', filePath], {
      env: { ...process.env, PGPASSWORD: DB_PASS }, stdio: 'pipe'
    });
    return true;
  } catch (e) {
    log('SQL hata: ' + (e.stderr?.toString() || e.message).slice(0, 150));
    return false;
  }
}

// ─── Ana İşlem ────────────────────────────────────────────────────────────────
async function main() {
  log('='.repeat(60));
  log(`Multi-Kaynak Resim & Fiyat Güncelleme${DRY_RUN ? ' [DRY-RUN]' : ''}`);
  log(`Batch: ${BATCH_SIZE} | Offset: ${OFFSET}`);

  if (!fs.existsSync(INPUT_FILE)) {
    log(`HATA: ${INPUT_FILE} bulunamadı`);
    process.exit(1);
  }

  const lines = fs.readFileSync(INPUT_FILE, 'utf-8').split('\n').filter(Boolean);
  const products = lines.map(line => {
    const parts = line.split('|');
    return {
      id: (parts[0] || '').trim(),
      slug: (parts[1] || '').trim(),
      name: (parts[2] || '').trim(),
      currentPrice: parseFloat(parts[3]) || 0,
    };
  }).filter(p => p.id && p.slug && p.name);

  log(`Toplam ürün: ${products.length}`);
  const slice = products.slice(OFFSET, OFFSET + BATCH_SIZE);
  log(`İşlenecek: ${slice.length} (offset: ${OFFSET})`);

  const stats = { total: slice.length, n11Found: 0, bkmFound: 0, placeholder: 0, priceUpdated: 0, errors: 0 };
  let sqlBuffer = [];

  async function flushSql() {
    if (sqlBuffer.length === 0) return;
    const batch = sqlBuffer.splice(0);
    if (DRY_RUN) { log(`  [DRY-RUN] ${batch.length} güncelleme atlandı`); return; }
    fs.writeFileSync(SQL_FILE, 'BEGIN;\n' + batch.join('\n') + '\nCOMMIT;\n');
    const ok = runSqlFile(SQL_FILE);
    log(ok ? `  → ${batch.length} satır DB'ye yazıldı ✓` : `  → Hata ✗`);
  }

  for (let i = 0; i < slice.length; i += CONCURRENT) {
    const chunk = slice.slice(i, i + CONCURRENT);

    const results = await Promise.all(chunk.map(async product => {
      const { id, slug, name, currentPrice } = product;
      try {
        // 1. BKM slug ile dene
        const bkm = await searchBKM(slug, name);
        if (bkm) return { id, slug, name, ...bkm, currentPrice };

        // 2. N11'de ürün adıyla ara
        const query = makeSearchQuery(name);
        const n11 = await searchN11(query);
        if (n11) return { id, slug, name, ...n11, currentPrice };

        return { id, slug, name, source: 'placeholder', img: null, price: null, currentPrice };
      } catch (e) {
        stats.errors++;
        return { id, slug, name, source: 'error', img: null, price: null, currentPrice };
      }
    }));

    for (const r of results) {
      if (r.img) {
        // Gerçek resim bulundu
        const finalImg = r.source === 'n11' ? toCloudinary(r.img) : r.img;
        const imgExpr = pgArray([finalImg]);

        if (r.source === 'n11') stats.n11Found++;
        else stats.bkmFound++;

        let sql = `UPDATE "Product" SET images=${imgExpr}, "updatedAt"=NOW()`;
        // Fiyat güncelleme: N11 fiyatı varsa ve mevcut fiyattan farklıysa güncelle
        if (r.price && r.price > 0 && Math.abs(r.price - r.currentPrice) > 0.5) {
          sql += `, price=${r.price}`;
          stats.priceUpdated++;
        }
        sql += ` WHERE id='${r.id}';`;
        sqlBuffer.push(sql);

        log(`  ✓ [${r.source.toUpperCase()}] ${r.name.slice(0, 40)} → resim bulundu | ${r.price ? r.price + ' TL' : 'fiyat yok'}`);
      } else {
        stats.placeholder++;
      }
    }

    if (sqlBuffer.length >= SQL_BATCH_SIZE) await flushSql();

    const processed = Math.min(i + CONCURRENT, slice.length);
    if (processed % 50 === 0 || processed === slice.length) {
      const pct = ((processed / slice.length) * 100).toFixed(1);
      log(`📊 ${processed}/${slice.length} (${pct}%) | N11:${stats.n11Found} BKM:${stats.bkmFound} Placeholder:${stats.placeholder}`);
    }

    await sleep(DELAY_MS);
  }

  await flushSql();

  log('─'.repeat(60));
  log('SONUÇ:');
  log(`  İşlenen       : ${stats.total}`);
  log(`  N11'den        : ${stats.n11Found}`);
  log(`  BKM'den        : ${stats.bkmFound}`);
  log(`  Hâlâ placeholder: ${stats.placeholder}`);
  log(`  Fiyat güncellendi: ${stats.priceUpdated}`);
  log(`  Hata           : ${stats.errors}`);
  log('='.repeat(60));
}

main().catch(e => {
  log('KRİTİK HATA: ' + e.message);
  process.exit(1);
});
