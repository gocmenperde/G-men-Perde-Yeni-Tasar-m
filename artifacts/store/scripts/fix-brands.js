#!/usr/bin/env node
/**
 * fix-brands.js — toplu UPDATE: marka başına tek SQL
 */
process.emitWarning = () => {};
const { execFileSync } = require('child_process');
const fs = require('fs');

const DB   = 'postgresql://postgres.eykyfavgfocbjsuihsnd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';
const PASS = 'Muhammed.19997558';
const LOG  = '/tmp/fix-brands.log';

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  process.stdout.write(line + '\n');
  try { fs.appendFileSync(LOG, line + '\n'); } catch(_) {}
}

function psql(sql) {
  try {
    return execFileSync('psql', [DB, '-t', '-A', '-F|', '-c', sql], {
      env: { ...process.env, PGPASSWORD: PASS },
      stdio: 'pipe', timeout: 60000,
    }).toString().trim();
  } catch(e) { log('PSQL ERR: ' + (e.stderr?.toString() || e.message).slice(0,300)); return ''; }
}

function psqlExec(sql) {
  try {
    const out = execFileSync('psql', [DB, '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: PASS },
      stdio: 'pipe', timeout: 60000,
    }).toString().trim();
    return out;
  } catch(e) { log('PSQL EXEC ERR: ' + (e.stderr?.toString() || e.message).slice(0,200)); return ''; }
}

function pgEsc(s) { return "'" + String(s || '').replace(/'/g, "''") + "'"; }

function norm(s) {
  return (s || '').toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

function findBrandInName(productName, brands) {
  const normName = norm(productName);
  const sorted = [...brands].sort((a, b) => b.normName.length - a.normName.length);
  for (const brand of sorted) {
    if (!brand.normName || brand.normName.length < 3) continue;
    const escaped = brand.normName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|-)${escaped}(\\s|-|$)`);
    if (regex.test(normName)) return brand;
  }
  for (const brand of sorted) {
    if (!brand.normName || brand.normName.length < 4) continue;
    if (normName.includes(brand.normName)) return brand;
  }
  return null;
}

async function main() {
  log('=== fix-brands başladı ===');

  const brandRows = psql(`SELECT id, name FROM public."Brand" ORDER BY name`).split('\n').filter(r => r.trim());
  const brands = brandRows.map(r => {
    const [id, name] = r.split('|');
    return { id, name, normName: norm(name) };
  });
  log(`${brands.length} marka yüklendi`);

  const productRows = psql(`
    SELECT id, name FROM public."Product"
    WHERE "isActive" = true AND ("brandId" IS NULL OR "brandId" = '')
    ORDER BY name ASC
    LIMIT 5000
  `).split('\n').filter(r => r.trim());

  log(`${productRows.length} markasız ürün işlenecek`);

  // Marka başına ürün ID'lerini grupla
  const brandMap = {}; // brandId → [productId, ...]
  let notFound = 0;

  for (const row of productRows) {
    const pipeIdx = row.indexOf('|');
    if (pipeIdx < 0) continue;
    const id = row.slice(0, pipeIdx);
    const name = row.slice(pipeIdx + 1);
    const match = findBrandInName(name, brands);
    if (match) {
      if (!brandMap[match.id]) brandMap[match.id] = [];
      brandMap[match.id].push(id);
    } else {
      notFound++;
    }
  }

  const brandIds = Object.keys(brandMap);
  log(`${brandIds.length} farklı marka eşleşti — toplu UPDATE başlıyor`);

  let totalFixed = 0;
  for (const brandId of brandIds) {
    const ids = brandMap[brandId];
    const idList = ids.map(pgEsc).join(',');
    const res = psqlExec(
      `UPDATE public."Product" SET "brandId" = ${pgEsc(brandId)}, "updatedAt" = NOW() WHERE id IN (${idList}) AND ("brandId" IS NULL OR "brandId"='');`
    );
    totalFixed += ids.length;
    const brandName = brands.find(b => b.id === brandId)?.name || brandId;
    log(`[✓] ${brandName} → ${ids.length} ürün güncellendi`);
  }

  log(`=== TAMAMLANDI — Atanan: ${totalFixed} | Bulunamayan: ${notFound} ===`);

  // Kontrol
  const remaining = psql(`SELECT COUNT(*) FROM public."Product" WHERE "isActive"=true AND ("brandId" IS NULL OR "brandId"='')`);
  log(`Hâlâ markasız: ${remaining}`);
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
