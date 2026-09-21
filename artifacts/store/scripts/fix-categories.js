#!/usr/bin/env node
/**
 * fix-categories.js
 * Resmi olmayan kategorilere Trendyol'dan veya mevcut ürün resimlerinden resim atar.
 */
process.emitWarning = () => {};
const https = require('https');
const http  = require('http');
const { execFileSync } = require('child_process');
const fs = require('fs');

const DB   = 'postgresql://postgres.eykyfavgfocbjsuihsnd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';
const PASS = 'Muhammed.19997558';
const LOG  = '/tmp/fix-categories.log';

let totalFixed = 0, totalNotFound = 0;

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
  // Kötü domain'ler
  const BAD = ['pixabay','hurimg','haber','shakespeare','wikiapis','birgun','tigrishaber','sondakika','milliyet','sabah.com','sozcu','tgrthaber','cumhuriyet'];
  if (BAD.some(d => url.toLowerCase().includes(d))) return false;
  try { new URL(url); } catch(_) { return false; }
  if (/\.(svg|ico|css|js|html|xml|json|txt|pdf|woff|ttf|eot)(\?|$)/i.test(url)) return false;
  if (/\.(jpe?g|png|webp|gif|avif|bmp)(\?|$|\/|%)/i.test(url)) return true;
  // Trendyol CDN
  return ['cdn.dsmcdn.com','productimages.hepsiburada','n11scdn','dsmcdn','hb.akamaized'].some(h => url.includes(h));
}

// Trendyol'dan resim ara — en popüler sonucu al
async function searchTrendyol(query) {
  try {
    const url = `https://public.trendyol.com/discovery-web-searchgw-service/api/filter/search/v2?q=${encodeURIComponent(query)}&pi=1&culture=tr-TR&userGenderId=1&priceBucketId=1&scoringAlgorithmId=2`;
    const body = await fetchUrl(url, { json: true });
    if (!body) return null;
    const data = JSON.parse(body);
    const products = data?.result?.products ?? [];
    for (const p of products.slice(0, 5)) {
      for (const img of p.images ?? []) {
        const full = img.startsWith('http') ? img : `https://cdn.dsmcdn.com${img}`;
        if (validImg(full)) return full;
      }
    }
    return null;
  } catch(_) { return null; }
}

function pgEsc(s) { return "'" + String(s || '').replace(/'/g, "''") + "'"; }

// Kategori adından arama terimi üret
function categoryToSearchQuery(name) {
  // Excel kategorileri (büyük harf) → temizle
  const cleaned = name
    .replace(/^BELİRTİLMEDİ$/i, 'kırtasiye ürünleri')
    .replace(/^KIRTASİYE$/i, 'kırtasiye malzemeleri')
    .replace(/^KİTAP$/i, 'kitap')
    .replace(/^ÇANTA$/i, 'okul çantası')
    .replace(/^RİSALE-İ NUR KÜLLİYATI$/i, 'risale-i nur')
    .replace(/^CEP BOY RİSALE$/i, 'risale-i nur cep boy')
    .replace(/^CEVŞEN$/i, 'cevşen kitap')
    .replace(/^DUA$/i, 'dua kitabı')
    .replace(/^EĞİTİM$/i, 'eğitim seti')
    .replace(/^HAZIRLIK$/i, 'okul öncesi hazırlık seti')
    .replace(/^İHTİYAÇ$/i, 'kırtasiye ihtiyaç')
    .replace(/^DENEME$/i, 'deneme sınavı kitabı')
    .replace(/^DERGİ$/i, 'dergi')
    .replace(/^ESANS$/i, 'esans')
    .replace(/^MESH$/i, 'mesh kalem')
    .replace(/^ŞEMSİYE$/i, 'şemsiye')
    .replace(/^TAKVİM$/i, 'masa takvimi')
    .replace(/^TEKNOLOJİ$/i, 'teknoloji aksesuar')
    .replace(/^TEKSTİL$/i, 'tekstil')
    .replace(/^YAPRAK TEST$/i, 'yaprak test sınavı')
    .replace(/^YABANCI DİL$/i, 'yabancı dil kitabı')
    .replace(/^KURANI KERİM$/i, 'kuran-ı kerim')
    ;
  return cleaned;
}

async function processCategory(row) {
  const [id, name, productImage] = row.split('|');

  // Önce mevcut ürün resmini kullan
  if (productImage && validImg(productImage)) {
    psqlExec(`UPDATE public."Category" SET image = ${pgEsc(productImage)}, "updatedAt" = NOW() WHERE id = ${pgEsc(id)};`);
    totalFixed++;
    log(`[✓] ${name} — ürün resminden`);
    return;
  }

  // Trendyol'dan ara
  const query = categoryToSearchQuery(name);
  const img = await searchTrendyol(query);
  await sleep(250);

  if (img) {
    psqlExec(`UPDATE public."Category" SET image = ${pgEsc(img)}, "updatedAt" = NOW() WHERE id = ${pgEsc(id)};`);
    totalFixed++;
    log(`[✓] ${name} — Trendyol`);
  } else {
    totalNotFound++;
    log(`[?] ${name} — bulunamadı`);
  }
}

async function main() {
  log('=== fix-categories başladı ===');

  // Resmi olmayan kategoriler + o kategorideki herhangi bir ürünün ilk resmi
  const rows = psql(`
    SELECT c.id, c.name, 
      (SELECT p.images[1] FROM public."Product" p 
       WHERE p."categoryId"=c.id AND p."isActive"=true AND array_length(p.images,1)>0 
       LIMIT 1) as product_image
    FROM public."Category" c
    WHERE c.image IS NULL OR c.image=''
    ORDER BY c.name ASC
  `).split('\n').filter(r => r.trim());

  log(`Resim gereken kategori: ${rows.length}`);

  // 2'li gruplarda işle
  for (let i = 0; i < rows.length; i += 2) {
    const chunk = rows.slice(i, i + 2);
    await Promise.all(chunk.map(processCategory));
    await sleep(400);
  }

  log(`=== TAMAMLANDI — Düzeltilen: ${totalFixed} | Bulunamayan: ${totalNotFound} ===`);
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
