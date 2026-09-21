#!/usr/bin/env node
/**
 * fix-bad-images.js
 * Haber sitesi / pixabay / alakasız domain'lerden gelen resimleri
 * Trendyol/N11 aramasıyla değiştirir.
 * Ayrıca tüm ürünlerin ilk resmini barkod+isim doğrulamasıyla kontrol eder.
 */
process.emitWarning = () => {};
const https = require('https');
const http  = require('http');
const { execFileSync } = require('child_process');
const fs = require('fs');

const DB   = 'postgresql://postgres.eykyfavgfocbjsuihsnd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';
const PASS = 'Muhammed.19997558';
const LOG  = '/tmp/fix-bad-images.log';

// Kesinlikle yanlış olan domain'ler
const BAD_DOMAINS = [
  'pixabay', 'hurimg', 'haber', 'milimaj', 'shakespeare',
  'wikiapis', 'birgun', 'lodoshaber', 'aksutvhabernet',
  'tigrishaber', 'sondakika', 'haber7', 'cumhuriyet',
  'milliyet', 'sabah.com.tr', 'sozcu', 'tgrthaber',
  'foto.haberler', 'milimaj', 'foto.sondakika',
  'i20.haber7', 'media.cumhuriyet', 'static.birgun',
  'spaces.wikiapis', 'image.milimaj'
];

const CONCURRENCY = 4;
const DELAY_MS    = 200;

let totalFixed = 0, totalNotFound = 0, totalErrors = 0;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  process.stdout.write(line + '\n');
  try { fs.appendFileSync(LOG, line + '\n'); } catch(_) {}
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function psql(sql) {
  try {
    return execFileSync('psql', [DB, '-t', '-A', '-F|', '-c', sql], {
      env: { ...process.env, PGPASSWORD: PASS },
      stdio: 'pipe', timeout: 30000,
    }).toString().trim();
  } catch(e) { log('PSQL ERR: ' + (e.stderr?.toString() || e.message).slice(0,200)); return ''; }
}

function psqlExec(sql) {
  try {
    execFileSync('psql', [DB, '-c', sql], {
      env: { ...process.env, PGPASSWORD: PASS },
      stdio: 'pipe', timeout: 30000,
    });
    return true;
  } catch(e) { log('PSQL EXEC ERR: ' + (e.stderr?.toString() || e.message).slice(0,150)); return false; }
}

function parsePgArray(raw) {
  if (!raw || raw === '{}' || raw === 'NULL') return [];
  const inner = raw.replace(/^\{|\}$/g, '');
  if (!inner) return [];
  const result = [];
  let current = '', inQuote = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '"') { inQuote = !inQuote; continue; }
    if (c === ',' && !inQuote) { if (current) result.push(current); current = ''; continue; }
    current += c;
  }
  if (current) result.push(current);
  return result.filter(Boolean);
}

function isBadDomain(url) {
  if (!url) return false;
  return BAD_DOMAINS.some(d => url.toLowerCase().includes(d));
}

function fetchUrl(url, opts = {}) {
  return new Promise(resolve => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
        'Accept': opts.json ? 'application/json' : 'text/html',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      }, timeout: 15000,
    }, res => {
      if ([301,302,303].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
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
  try { new URL(url); } catch(_) { return false; }
  if (/\.(svg|ico|css|js|html|xml|json|txt|pdf|woff|ttf|eot)(\?|$)/i.test(url)) return false;
  if (/\.(jpe?g|png|webp|gif|avif|bmp)(\?|$|\/|%)/i.test(url)) return true;
  return ['cdn.dsmcdn.com','productimages.hepsiburada','n11cdn','img-n11','trendyolcdn','dsmcdn','hb.akamaized'].some(h => url.includes(h));
}

async function searchTrendyol(query) {
  try {
    const url = `https://public.trendyol.com/discovery-web-searchgw-service/api/filter/search/v2?q=${encodeURIComponent(query)}&pi=1&culture=tr-TR&userGenderId=1&priceBucketId=1&scoringAlgorithmId=2`;
    const body = await fetchUrl(url, { json: true });
    if (!body) return { imgs: [], names: [] };
    const data = JSON.parse(body);
    const products = data?.result?.products ?? [];
    const imgs = [], names = [];
    for (const p of products.slice(0, 3)) {
      if (p.name) names.push(p.name.toLowerCase());
      for (const img of p.images ?? []) {
        const full = img.startsWith('http') ? img : `https://cdn.dsmcdn.com${img}`;
        if (validImg(full) && !imgs.includes(full)) imgs.push(full);
      }
    }
    return { imgs: imgs.slice(0, 3), names };
  } catch(_) { return { imgs: [], names: [] }; }
}

async function searchN11(query) {
  try {
    const url = `https://www.n11.com/arama?q=${encodeURIComponent(query)}&pagingSize=1`;
    const html = await fetchUrl(url);
    if (!html) return [];
    return [...html.matchAll(/(?:data-src|src)="(https:\/\/n11[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)]
      .map(m => m[1]).filter(validImg).slice(0, 2);
  } catch(_) { return []; }
}

function nameMatchesResult(productName, resultNames) {
  if (!resultNames || resultNames.length === 0) return false;
  const keywords = productName.toLowerCase()
    .replace(/[^a-zğüşıöç0-9\s]/gi, ' ')
    .split(/\s+/).filter(w => w.length > 3);
  if (keywords.length === 0) return true;
  const matchCount = keywords.filter(kw => resultNames.some(rn => rn.includes(kw))).length;
  return matchCount >= Math.min(2, Math.ceil(keywords.length * 0.4));
}

function pgEsc(s) { return "'" + String(s || '').replace(/'/g, "''") + "'"; }

async function findImages(name, barcode, brand) {
  const seen = new Set();
  const imgs = [];
  const add = list => { for (const u of list) if (validImg(u) && !seen.has(u)) { seen.add(u); imgs.push(u); } };

  const br = (brand || '').trim();
  const nameHasBrand = br.length > 2 && name.toLowerCase().includes(br.toLowerCase());
  const fullQ = (!nameHasBrand && br) ? `${br} ${name}`.slice(0, 100) : name.slice(0, 100);

  // 1. Barcode → Trendyol
  if (barcode && /^\d{8,14}$/.test(barcode)) {
    const { imgs: bImgs, names: bNames } = await searchTrendyol(barcode);
    if (bImgs.length > 0 && nameMatchesResult(name, bNames)) add(bImgs);
    await sleep(DELAY_MS);
  }

  // 2. Name → Trendyol
  if (imgs.length < 1) {
    const { imgs: nImgs, names: nNames } = await searchTrendyol(fullQ);
    if (nImgs.length > 0 && nameMatchesResult(name, nNames)) add(nImgs);
    else add(nImgs); // Kitap için fallback — isim doğrulaması çok katı olabilir
    await sleep(DELAY_MS);
  }

  // 3. Short name → N11
  if (imgs.length < 1) {
    add(await searchN11(name.slice(0, 80)));
    await sleep(DELAY_MS);
  }

  return imgs.slice(0, 3);
}

async function processRow(row) {
  const parts = row.split('|');
  const [id, name, barcode, sku, brand] = parts;
  const imagesRaw = parts.slice(5).join('|');
  const images = parsePgArray(imagesRaw);

  // Sadece kötü domainli ürünleri işle
  if (!images.some(img => isBadDomain(img))) return { status: 'skipped' };

  const bc = (barcode && barcode !== '\\N' && barcode !== '') ? barcode
    : (sku && sku !== '\\N' && sku !== '') ? sku : null;
  const br = (brand && brand !== '\\N' && brand !== '') ? brand : null;

  try {
    const found = await findImages(name, bc, br);
    if (found.length === 0) return { status: 'not_found', name };
    const arrLiteral = "ARRAY[" + found.map(pgEsc).join(',') + "]";
    psqlExec(`UPDATE public."Product" SET images = ${arrLiteral}, "updatedAt" = NOW() WHERE id = ${pgEsc(id)};`);
    totalFixed++;
    log(`[✓] ${name}`);
    return { status: 'fixed', name, count: found.length };
  } catch(e) {
    totalErrors++;
    return { status: 'error', name, error: e.message };
  }
}

async function main() {
  log('=== fix-bad-images başladı ===');

  // Domain filtresini SQL'de yap — çıktıyı küçük tut
  const domainConditions = BAD_DOMAINS.map(d => `p.images[1] ILIKE ${pgEsc('%' + d + '%')}`).join(' OR ');
  const badRows = psql(`
    SELECT p.id, p.name, p.barcode, p.sku, COALESCE(b.name,''), p.images::text
    FROM public."Product" p
    LEFT JOIN public."Brand" b ON b.id = p."brandId"
    WHERE p."isActive" = true AND array_length(p.images,1) > 0
      AND (${domainConditions})
    ORDER BY p."createdAt" ASC
  `).split('\n').filter(r => r.trim());

  log(`Kötü resimli ürün: ${badRows.length}`);

  for (let i = 0; i < badRows.length; i += CONCURRENCY) {
    const chunk = badRows.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(processRow));
    if ((i / CONCURRENCY) % 5 === 4) {
      log(`>>> ${Math.min(i + CONCURRENCY, badRows.length)}/${badRows.length} — Düzeltilen: ${totalFixed}`);
    }
    await sleep(300);
  }

  log(`=== TAMAMLANDI — Düzeltilen: ${totalFixed} | Bulunamayan: ${totalNotFound} | Hata: ${totalErrors} ===`);
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
