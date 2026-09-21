#!/usr/bin/env node
/**
 * Tüm ürünlerin resimlerini otomatik olarak düzeltir.
 * Önce barkod, ardından ürün adı+marka ile Trendyol ve N11'den arar.
 * Zaten geçerli resmi olan ürünleri atlar.
 */

process.emitWarning = () => {};

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { execFileSync } = require('child_process');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';
const LOG  = path.join(__dirname, 'fix-all-images.log');
const PLACEHOLDER_RE = /placehold|placeholder|via\.placeholder|dummyimage|lorempixel|picsum/i;

const BATCH_SIZE   = 100;   // DB'den kaç ürün çekilir
const CONCURRENCY  = 5;     // Aynı anda kaç ürün işlenir
const DELAY_BATCH  = 500;   // Her batch arası bekleme (ms)
const DELAY_ITEM   = 100;   // Her ürün arası bekleme (ms)

const args = process.argv.slice(2);
const DRY  = args.includes('--dry-run');
const OFFSET_I = args.indexOf('--offset');
let GLOBAL_OFFSET = OFFSET_I !== -1 ? parseInt(args[OFFSET_I + 1]) || 0 : 0;

let totalProcessed = 0;
let totalFixed     = 0;
let totalSkipped   = 0;
let totalErrors    = 0;
let totalNotFound  = 0;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  process.stdout.write(line + '\n');
  try { fs.appendFileSync(LOG, line + '\n'); } catch (_) {}
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function psql(sql) {
  try {
    return execFileSync('psql', [DB, '-t', '-A', '-F|', '-c', sql], {
      env: { ...process.env, PGPASSWORD: PASS },
      stdio: 'pipe',
      timeout: 30000,
    }).toString().trim();
  } catch (e) {
    log('PSQL ERROR: ' + (e.stderr?.toString() || e.message).slice(0, 200));
    return '';
  }
}

function psqlExec(sql) {
  try {
    execFileSync('psql', [DB, '-c', sql], {
      env: { ...process.env, PGPASSWORD: PASS },
      stdio: 'pipe',
      timeout: 30000,
    });
    return true;
  } catch (e) {
    log('PSQL EXEC ERROR: ' + (e.stderr?.toString() || e.message).slice(0, 200));
    return false;
  }
}

function fetchUrl(url, opts = {}) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': opts.json ? 'application/json' : 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Origin': 'https://www.trendyol.com',
        'Referer': 'https://www.trendyol.com/',
        ...(opts.headers || {}),
      },
      timeout: 12000,
    }, res => {
      if ([301, 302, 303].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchUrl(next, opts).then(resolve);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', () => resolve(''));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function validImg(url) {
  if (!url || !url.startsWith('http')) return false;
  try { new URL(url); } catch (_) { return false; }
  if (/\.(svg|ico|css|js|html|xml|json|txt|pdf|woff|woff2|ttf|eot)(\?|$)/i.test(url)) return false;
  if (/\.(jpe?g|png|webp|gif|avif|bmp)(\?|$|\/|%)/i.test(url)) return true;
  const hints = [
    'cdn.dsmcdn.com', 'productimages.hepsiburada', 'n11cdn', 'img-n11',
    'trendyolcdn', 'dsmcdn', 'hb.akamaized',
  ];
  return hints.some(h => url.includes(h));
}

function isPlaceholderOrBad(images) {
  if (!images || images.length === 0) return true;
  return images.every(u => PLACEHOLDER_RE.test(u) || !validImg(u));
}

async function searchTrendyol(query) {
  try {
    const url = `https://public.trendyol.com/discovery-web-searchgw-service/api/filter/search/v2?q=${encodeURIComponent(query)}&pi=1&culture=tr-TR&userGenderId=1&priceBucketId=1&scoringAlgorithmId=2`;
    const body = await fetchUrl(url, { json: true });
    if (!body) return [];
    const data = JSON.parse(body);
    const products = data?.result?.products ?? [];
    const imgs = [];
    for (const p of products.slice(0, 2)) {
      for (const img of p.images ?? []) {
        const full = img.startsWith('http') ? img : `https://cdn.dsmcdn.com${img}`;
        if (validImg(full) && !imgs.includes(full)) imgs.push(full);
      }
    }
    return imgs.slice(0, 3);
  } catch (_) { return []; }
}

async function searchN11(query) {
  try {
    const url = `https://www.n11.com/arama?q=${encodeURIComponent(query)}&pagingSize=1`;
    const html = await fetchUrl(url);
    if (!html) return [];
    const matches = [...html.matchAll(/(?:data-src|src)="(https:\/\/n11[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)];
    return matches.map(m => m[1]).filter(validImg).slice(0, 2);
  } catch (_) { return []; }
}

function pgEsc(s) { return "'" + String(s || '').replace(/'/g, "''") + "'"; }

async function findImages(name, barcode, brand) {
  const seen = new Set();
  const imgs = [];
  const add = list => {
    for (const u of list) if (validImg(u) && !seen.has(u)) { seen.add(u); imgs.push(u); }
  };

  const br = (brand || '').trim();
  const nameHasBrand = br.length > 2 && name.toLowerCase().includes(br.toLowerCase());
  const fullQ = (!nameHasBrand && br) ? `${br} ${name}`.slice(0, 100) : name.slice(0, 100);

  if (barcode && /^\d{8,14}$/.test(barcode)) {
    add(await searchTrendyol(barcode));
    if (imgs.length < 1) { add(await searchN11(barcode)); await sleep(DELAY_ITEM); }
    await sleep(DELAY_ITEM);
  }

  if (imgs.length < 1) {
    add(await searchTrendyol(fullQ));
    await sleep(DELAY_ITEM);
  }

  if (imgs.length < 1 && fullQ !== name.slice(0, 100)) {
    add(await searchTrendyol(name.slice(0, 80)));
    await sleep(DELAY_ITEM);
  }

  if (imgs.length < 1) {
    add(await searchN11(fullQ));
    await sleep(DELAY_ITEM);
  }

  return imgs.slice(0, 3);
}

async function processProduct(row) {
  const [id, name, barcode, sku, brand, imagesRaw] = row.split('|');

  const images = (() => {
    try {
      const parsed = JSON.parse(imagesRaw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  })();

  if (!isPlaceholderOrBad(images)) {
    return { id, name, status: 'skipped' };
  }

  const bc = (barcode && barcode !== '\\N' && barcode !== '') ? barcode
    : (sku && sku !== '\\N' && sku !== '') ? sku : null;
  const br = (brand && brand !== '\\N') ? brand : null;

  try {
    const found = await findImages(name, bc, br);
    if (found.length === 0) {
      return { id, name, status: 'not_found' };
    }

    if (!DRY) {
      const arrLiteral = "ARRAY[" + found.map(pgEsc).join(',') + "]";
      const sql = `UPDATE "Product" SET images = ${arrLiteral}, "updatedAt" = NOW() WHERE id = ${pgEsc(id)};`;
      psqlExec(sql);

      if (bc && /^\d{8,14}$/.test(bc)) {
        const imgsSql = "ARRAY[" + found.map(pgEsc).join(',') + "]";
        const upsert = `
          INSERT INTO "BarcodeImage" (barcode, images, source, "createdAt", "updatedAt")
          VALUES (${pgEsc(bc)}, ${imgsSql}, 'fix-all', NOW(), NOW())
          ON CONFLICT (barcode) DO UPDATE SET images = ${imgsSql}, source = 'fix-all', "updatedAt" = NOW();
        `.trim();
        try { psqlExec(upsert); } catch (_) {}
      }
    }

    return { id, name, status: 'fixed', count: found.length };
  } catch (e) {
    return { id, name, status: 'error', error: e.message };
  }
}

async function main() {
  log(`=== fix-all-images.js başladı (DRY=${DRY}, offset=${GLOBAL_OFFSET}) ===`);

  const totalRow = psql(`SELECT COUNT(*) FROM "Product" WHERE "isActive" = true`);
  const total = parseInt(totalRow) || 0;
  log(`Toplam aktif ürün: ${total}`);

  let offset = GLOBAL_OFFSET;

  while (offset < total) {
    const rows = psql(`
      SELECT p.id, p.name, p.barcode, p.sku, b.name, p.images::text
      FROM "Product" p
      LEFT JOIN "Brand" b ON b.id = p."brandId"
      WHERE p."isActive" = true
      ORDER BY p."createdAt" ASC
      LIMIT ${BATCH_SIZE} OFFSET ${offset}
    `).split('\n').filter(r => r.trim());

    if (rows.length === 0) break;

    log(`--- Batch: offset=${offset}, satır=${rows.length} ---`);

    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const chunk = rows.slice(i, i + CONCURRENCY);
      const results = await Promise.all(chunk.map(processProduct));

      for (const r of results) {
        totalProcessed++;
        if (r.status === 'fixed')      { totalFixed++;    log(`[DÜZELT] ${r.name} — ${r.count} resim`); }
        else if (r.status === 'skipped') { totalSkipped++; }
        else if (r.status === 'not_found') { totalNotFound++; log(`[YOK]    ${r.name}`); }
        else if (r.status === 'error') { totalErrors++;   log(`[HATA]   ${r.name}: ${r.error}`); }
      }

      if (i + CONCURRENCY < rows.length) await sleep(DELAY_ITEM);
    }

    log(`>>> İlerleme: ${totalProcessed}/${total} — Düzeltilen: ${totalFixed} | Atlanan: ${totalSkipped} | Bulunamayan: ${totalNotFound} | Hata: ${totalErrors}`);
    offset += rows.length;
    await sleep(DELAY_BATCH);
  }

  log(`=== TAMAMLANDI — Düzeltilen: ${totalFixed} | Atlanan: ${totalSkipped} | Bulunamayan: ${totalNotFound} | Hata: ${totalErrors} ===`);
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
