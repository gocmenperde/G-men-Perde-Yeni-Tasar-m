#!/usr/bin/env node
/**
 * Barkod Bazlı Resim & Fiyat Güncelleme
 * ---------------------------------------
 * 1. ISBN (978/979) → BKM Kitap barkod araması
 * 2. EAN (gerçek 8+ haneli) → önce BKM, sonra N11
 * 3. Sahte/kısa barkod → DB'deki benzer ürün resmi (keyword eşleştirme)
 *
 * Kullanım:
 *   node scripts/barcode-lookup.js
 *   node scripts/barcode-lookup.js --dry-run
 *   node scripts/barcode-lookup.js --batch 200 --offset 0
 *   node scripts/barcode-lookup.js --phase isbn|ean|keyword
 */

process.emitWarning = () => {};
const fs   = require('fs');
const path = require('path');
const http  = require('http');
const https = require('https');
const { execFileSync } = require('child_process');

// ─── Config ───────────────────────────────────────────────────────────────────
const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';
const PLACEHOLDER = 'https://placehold.co/400x400/f1f5f9/94a3b8';
const CDN  = 'https://res.cloudinary.com/dbzdls18g/image/fetch/q_auto,f_auto/';
const LOG  = path.join(__dirname, 'barcode-lookup.log');
const SQL  = path.join(__dirname, '_barcode_batch.sql');
const CONCURRENCY = 3;   // paralel istek sayısı
const DELAY_MS    = 700; // istekler arası bekleme (ms)

// ─── Argümanlar ───────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const DRY    = args.includes('--dry-run');
const BI     = args.indexOf('--batch');
const BATCH  = BI !== -1 ? parseInt(args[BI+1])||500 : 9999999;
const OI     = args.indexOf('--offset');
const OFFSET = OI !== -1 ? parseInt(args[OI+1])||0 : 0;
const PI     = args.indexOf('--phase');
const PHASE  = PI !== -1 ? args[PI+1] : 'all'; // isbn | ean | keyword | all

// ─── Log ──────────────────────────────────────────────────────────────────────
function log(m) {
  const l = `[${new Date().toISOString()}] ${m}`;
  console.log(l);
  try { fs.appendFileSync(LOG, l+'\n'); } catch(_) {}
}

// ─── DB ───────────────────────────────────────────────────────────────────────
function psql(sql) {
  return execFileSync('psql', [DB,'-t','-A','-F|','-c', sql], {
    env: {...process.env, PGPASSWORD: PASS}, stdio:'pipe'
  }).toString().trim();
}
function runFile(f) {
  try {
    execFileSync('psql', [DB,'-f',f], {env:{...process.env,PGPASSWORD:PASS}, stdio:'pipe'});
    return true;
  } catch(e) { log('SQL err: '+(e.stderr?.toString()||e.message).slice(0,120)); return false; }
}
function flushUpdates(lines) {
  if (!lines.length) return;
  if (DRY) { log(`[DRY] ${lines.length} güncelleme atlandı`); return; }
  const sql = 'BEGIN;\n' + lines.join('\n') + '\nCOMMIT;\n';
  fs.writeFileSync(SQL, sql);
  runFile(SQL);
}
function pgStr(s) { return "'"+String(s).replace(/'/g,"''")+"'"; }
function pgArr(a) { return 'ARRAY['+a.map(pgStr).join(',')+']'; }

// ─── HTTP ─────────────────────────────────────────────────────────────────────
const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];
let uaIdx = 0;
function nextUA() { return UA_LIST[uaIdx++ % UA_LIST.length]; }

function fetchHtml(url, timeout=14000) {
  return new Promise(resolve => {
    const lib = url.startsWith('https') ? https : http;
    try {
      const req = lib.get(url, {
        headers: {
          'User-Agent': nextUA(),
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'identity',
          'Cache-Control': 'no-cache',
        }
      }, res => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8'), status: res.statusCode }));
      });
      req.on('error', () => resolve({ html:'', status:0 }));
      req.setTimeout(timeout, () => { req.destroy(); resolve({ html:'', status:0 }); });
    } catch(e) { resolve({ html:'', status:0 }); }
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── BKM Kitap Arama ─────────────────────────────────────────────────────────
async function searchBKM(query) {
  const url = `https://www.bkmkitap.com/arama?q=${encodeURIComponent(query)}`;
  const { html, status } = await fetchHtml(url);
  if (status !== 200 || !html) return null;

  // Ürün resmi: cdn.bkmkitap.com
  const imgMatch = html.match(/https:\/\/cdn\.bkmkitap\.com\/[^"'\s]+?-O\.jpg/);
  if (!imgMatch) return null;

  // Fiyat
  let price = null;
  const priceMatch = html.match(/"price":"?(\d+[\.,]\d+)"?/) ||
                     html.match(/(\d{1,5}[,\.]\d{2})\s*(?:TL|₺)/);
  if (priceMatch) price = parseFloat(priceMatch[1].replace(',','.'));

  return { source:'bkm', img: CDN + imgMatch[0], price };
}

// ─── BKM Slug Arama (doğrudan ürün sayfası) ──────────────────────────────────
async function searchBKMDirect(slug) {
  const url = `https://www.bkmkitap.com/${slug}`;
  const { html, status } = await fetchHtml(url);
  if (status !== 200 || !html) return null;
  const imgMatch = html.match(/https:\/\/cdn\.bkmkitap\.com\/[^"'\s]+?-O\.jpg/);
  if (!imgMatch) return null;
  let price = null;
  const pm = html.match(/"price":"?(\d+[\.,]\d+)"?/);
  if (pm) price = parseFloat(pm[1].replace(',','.'));
  return { source:'bkm_direct', img: CDN + imgMatch[0], price };
}

// ─── N11 Arama ────────────────────────────────────────────────────────────────
async function searchN11(query) {
  const url = `https://www.n11.com/arama?q=${encodeURIComponent(query)}`;
  const { html, status } = await fetchHtml(url);
  if (status !== 200 || !html) return null;
  const imgMatch = html.match(/"imageUrl":"(https:\/\/n11scdn\.akamaized\.net\/a1\/[^"]+)"/);
  if (!imgMatch) return null;
  let price = null;
  const pm = html.match(/(\d{1,5}[,\.]\d{2})\s*(?:TL|₺)/);
  if (pm) price = parseFloat(pm[1].replace(',','.'));
  return { source:'n11', img: imgMatch[1], price };
}

// ─── Keyword Eşleştirme ───────────────────────────────────────────────────────
const KEYWORDS = [
  // Defter
  'konulu defter','spiralli defter','kareli defter','cizgili defter','cizgisiz defter',
  'sert kapak defter','plastik kapak defter','not defteri','planlama defteri',
  'ajanda','defter',
  // Kalem
  'versatil kalem','uclu kalem','kursun kalem','tukenmez kalem','keceli kalem',
  'fosforlu kalem','jel kalem','gel kalem','beyaz tahta kalemi','marker',
  // Kalem tek kelime tetikleyicileri
  'tukenmez','kursun','keceli','fosforlu','versatil',
  'kalem',
  // Boya
  'akrilik boya','pastel boya','suluboya','guaj boya','firca seti',
  'firca','boya',
  // Diğer kırtasiye
  'tel zimba','zimba teli','zimba makinesi','zimba',
  'stick yapistirici','glue stick','yapistirici','pritt','yapiştırıcı',
  'toz tutmaz silgi','sinav silgisi','silgi',
  'plastik atac','raptiye','atac',
  'ogrencu makasi','makas',
  'pergel','iletki','cetvel',
  'koli bant','maskeleme bandi','bant',
  'klasor','dosya',
  'fotokopi kagidi','renkli kagit','karton','kagit',
  'oyun hamuru','puzzle','boyama kitabi','etiket',
  'hesap makinesi','tebesir','tahta silgisi',
  // Su matarası
  'matara','suluk',
  // Çanta
  'canta',
  // Bloknot
  'bloknot','blok not',
  // Kırtasiye genel
  'kirtasiye',
  // Kitap
  'roman','hikaye','sozluk','atlas','sozluk',
];

function normalize(s) {
  return String(s||'').toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

function findKeywords(name) {
  const n = normalize(name);
  return KEYWORDS.filter(kw => n.includes(normalize(kw)));
}

// ─── Yardımcı: Barkod tipi ───────────────────────────────────────────────────
function barcodeType(sku) {
  if (!sku || sku.length < 8) return 'fake';
  if (!/^\d+$/.test(sku)) return 'fake';
  if (sku.startsWith('978') || sku.startsWith('979')) return 'isbn';
  return 'ean';
}

// ─── Concurrency limiter ─────────────────────────────────────────────────────
async function withConcurrency(items, limit, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
      await sleep(DELAY_MS);
    }
  }
  const workers = Array.from({length: Math.min(limit, items.length)}, worker);
  await Promise.all(workers);
  return results;
}

// ─── Ana Fonksiyon ────────────────────────────────────────────────────────────
async function main() {
  log('='.repeat(60));
  log(`Barkod Resim & Fiyat Güncelleme${DRY?' [DRY-RUN]':''} [${PHASE}]`);
  log(`Batch: ${BATCH} | Offset: ${OFFSET}`);

  // Tüm placeholder ürünleri çek (id, sku, name, slug, price)
  const rows = psql(
    `SELECT id, sku, name, slug, price FROM "Product"
     WHERE images[1]=${pgStr(PLACEHOLDER)}
     ORDER BY "createdAt" ASC`
  ).split('\n').filter(Boolean);

  const products = rows.map(r => {
    const p = r.split('|');
    return { id:p[0]||'', sku:p[1]||'', name:p[2]||'', slug:p[3]||'', price:parseFloat(p[4])||0 };
  }).filter(p => p.id);

  log(`Toplam placeholder: ${products.length}`);

  // Faz bazlı filtrele
  let filtered = products;
  if (PHASE === 'isbn')    filtered = products.filter(p => barcodeType(p.sku)==='isbn');
  if (PHASE === 'ean')     filtered = products.filter(p => barcodeType(p.sku)==='ean');
  if (PHASE === 'keyword') filtered = products.filter(p => barcodeType(p.sku)==='fake');

  const slice = filtered.slice(OFFSET, OFFSET + BATCH);
  log(`Faz "${PHASE}" → ${filtered.length} ürün | Bu batch: ${slice.length}`);

  // Keyword haritasını hazırla
  let kwImageMap = new Map();
  if (PHASE === 'all' || PHASE === 'keyword') {
    log('Keyword resim haritası hazırlanıyor...');
    const realRows = psql(
      `SELECT name, images[1] FROM "Product"
       WHERE images[1] LIKE 'https://res.cloudinary.com/%'
       AND array_length(images,1) > 0
       LIMIT 5000`
    ).split('\n').filter(Boolean);

    for (const row of realRows) {
      const [rName, img] = row.split('|');
      if (!rName || !img || !img.startsWith('http')) continue;
      const kws = findKeywords(rName);
      for (const kw of kws) {
        if (!kwImageMap.has(kw)) kwImageMap.set(kw, []);
        if (kwImageMap.get(kw).length < 30) kwImageMap.get(kw).push(img);
      }
    }
    log(`Keyword haritası: ${kwImageMap.size} kategori`);
  }

  const kwRoundRobin = new Map();

  function keywordFallback(name) {
    const kws = findKeywords(name);
    for (const kw of kws) {
      const imgs = kwImageMap.get(kw);
      if (imgs && imgs.length > 0) {
        const idx = (kwRoundRobin.get(kw)||0) % imgs.length;
        kwRoundRobin.set(kw, idx+1);
        return { source:'keyword', img:imgs[idx], price:null, kw };
      }
    }
    return null;
  }

  // İşleme
  const stats = { total:slice.length, bkm:0, n11:0, keyword:0, noMatch:0, priceUpdated:0 };
  const sqlLines = [];
  let done = 0;

  await withConcurrency(slice, CONCURRENCY, async (product) => {
    done++;
    const type = barcodeType(product.sku);
    let result = null;

    try {
      // ── ISBN → BKM ──────────────────────────────────────────────
      if (type === 'isbn' && (PHASE==='all'||PHASE==='isbn')) {
        result = await searchBKM(product.sku);
        if (!result) result = await searchBKM(product.name);
      }
      // ── EAN → BKM, sonra N11 ────────────────────────────────────
      else if (type === 'ean' && (PHASE==='all'||PHASE==='ean')) {
        result = await searchBKM(product.sku);
        if (!result) {
          await sleep(300);
          result = await searchN11(product.sku);
        }
        // İkisi de bulamazsa isimle dene
        if (!result) result = await searchBKM(product.name);
      }

      // ── Keyword fallback ─────────────────────────────────────────
      if (!result && (PHASE==='all'||PHASE==='keyword')) {
        result = keywordFallback(product.name);
      }
    } catch(e) {
      log(`HATA [${product.name}]: ${e.message}`);
    }

    if (result) {
      const src = result.source;
      if (src==='bkm'||src==='bkm_direct') stats.bkm++;
      else if (src==='n11') stats.n11++;
      else stats.keyword++;

      let sql = `UPDATE "Product" SET images=${pgArr([result.img])}, "updatedAt"=NOW()`;
      if (result.price && result.price > 0) {
        sql += `, price=${result.price}`;
        stats.priceUpdated++;
      }
      sql += ` WHERE id=${pgStr(product.id)};`;
      sqlLines.push(sql);

      if (done <= 10 || done % 50 === 0) {
        log(`[${done}/${slice.length}] ✓ ${src.toUpperCase()} | ${product.name.slice(0,35)} | ${result.price ? result.price+'₺' : '-'}`);
      }
    } else {
      stats.noMatch++;
      if (stats.noMatch <= 5) {
        log(`[${done}] ✗ Bulunamadı: ${product.name.slice(0,40)} (${product.sku})`);
      }
    }

    // Her 100 üründe bir yaz
    if (sqlLines.length >= 100) {
      const chunk = sqlLines.splice(0, 100);
      flushUpdates(chunk);
      log(`  → DB'ye ${chunk.length} güncelleme yazıldı`);
    }
  });

  // Kalanları yaz
  if (sqlLines.length > 0) {
    flushUpdates(sqlLines);
    log(`  → DB'ye ${sqlLines.length} güncelleme yazıldı (son batch)`);
  }

  log('─'.repeat(60));
  log('SONUÇ:');
  log(`  İşlenen        : ${stats.total}`);
  log(`  BKM buldu      : ${stats.bkm}`);
  log(`  N11 buldu      : ${stats.n11}`);
  log(`  Keyword eşleşti: ${stats.keyword}`);
  log(`  Bulunamadı     : ${stats.noMatch}`);
  log(`  Fiyat güncellendi: ${stats.priceUpdated}`);
  log(`  Başarı oranı   : ${(((stats.total-stats.noMatch)/stats.total)*100).toFixed(1)}%`);
  log('='.repeat(60));
}

main().catch(e => { log('FATAL: '+e.message); process.exit(1); });
