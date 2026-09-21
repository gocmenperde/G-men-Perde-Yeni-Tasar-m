#!/usr/bin/env node
/**
 * Anahtar Kelime Eşleştirme ile Resim Güncelleme
 * ------------------------------------------------
 * Veritabanındaki gerçek resimli ürünlerden anahtar kelime → resim
 * haritası oluşturur ve placeholder ürünlere benzer ürünlerin resimlerini atar.
 *
 * Kullanım:
 *   node scripts/keyword-match-images.js
 *   node scripts/keyword-match-images.js --dry-run
 *   node scripts/keyword-match-images.js --batch 500 --offset 0
 */

process.emitWarning = () => {};

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const DB_CONN = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const DB_PASS = 'npg_QDG0cV8pRgFS';
const PLACEHOLDER = 'https://placehold.co/400x400/f1f5f9/94a3b8';
const LOG_FILE = path.join(__dirname, 'keyword-match.log');
const SQL_FILE = path.join(__dirname, '_kw_batch.sql');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const BATCH_IDX = args.indexOf('--batch');
const BATCH_SIZE = BATCH_IDX !== -1 ? parseInt(args[BATCH_IDX + 1]) || 1000 : 999999;
const OFFSET_IDX = args.indexOf('--offset');
const OFFSET = OFFSET_IDX !== -1 ? parseInt(args[OFFSET_IDX + 1]) || 0 : 0;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) {}
}

function psql(sql) {
  return execFileSync('psql', [DB_CONN, '-t', '-A', '-F|', '-c', sql], {
    env: { ...process.env, PGPASSWORD: DB_PASS }, stdio: 'pipe'
  }).toString().trim();
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

function normalize(s) {
  return (s || '').toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Türkçe ürün tipi anahtar kelimeleri - öncelik sırasına göre
const KEYWORDS = [
  // Defter çeşitleri
  'konulu defter', 'spiralli defter', 'kareli defter', 'cizgili defter', 'cizgisiz defter',
  'sert kapak defter', 'plastik kapak defter', 'iplik dikis defter', 'not defteri',
  'planlama defteri', 'ajanda', 'defter',
  // Kalem çeşitleri
  'kursun kalem', 'tukenmez kalem', 'keceli kalem', 'fosforlu kalem', 'gel kalem', 'jel kalem',
  'beyaz tahta kalemi', 'marker', 'versatil kalem', 'uclu kalem',
  'kalem',
  // Boya çeşitleri
  'akrilik boya', 'pastel boya', 'suluboya', 'guaj boya', 'yuz boyasi', 'parmak boyasi',
  'boya firca', 'firca', 'boya',
  // Zimba & bağlama
  'tel zimba', 'zimba teli', 'zimba makinesi', 'zimba',
  // Yapıştırıcı
  'stick yapistirici', 'sivi yapistirici', 'yapiştırıcı', 'pritt', 'japon yapistirici',
  // Silgi
  'toz tutmaz silgi', 'silgi',
  // Ataç & raptiye
  'plastik atac', 'metal atac', 'raptiye', 'atac',
  // Makas
  'ogrencu makasi', 'makas',
  // Cetvel & geometri
  'pergel', 'iletki', 'cetvel takimi', 'cetvel',
  // Bant
  'koli bant', 'selophan bant', 'bant makinesi', 'bant',
  // Dosya & klasör
  'klasor', 'dosya',
  // Kağıt
  'fotokopi kagidi', 'renkli kagit', 'karton', 'ambalaj kagidi',
  // Oyun & hobi
  'oyun hamuru', 'puzzle', 'yapboz', 'boyama kitabi',
  // Etiket & sticker
  'etiket',
  // Diğer kırtasiye
  'hesap makinesi', 'tebesir', 'tahta silgisi', 'daire sablonu',
  // Kitap türleri
  'roman', 'hikaye kitabi', 'cocuk kitabi', 'egitim kitabi', 'sozluk', 'atlas',
  // Genel
  'kirtasiye',
];

function extractKeywords(name) {
  const norm = normalize(name);
  const found = [];
  for (const kw of KEYWORDS) {
    const normKw = normalize(kw);
    if (norm.includes(normKw)) {
      found.push(kw);
    }
  }
  return found;
}

function pgArray(arr) {
  return 'ARRAY[' + arr.map(s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'").join(',') + ']';
}

async function main() {
  log('='.repeat(60));
  log(`Anahtar Kelime Resim Eşleştirme${DRY_RUN ? ' [DRY-RUN]' : ''}`);

  // 1. Gerçek resimli ürünleri çek - anahtar kelime haritası oluştur
  log('Gerçek resimli ürünler sorgulanıyor...');
  const realRows = psql(
    'SELECT name, images[1] FROM "Product" WHERE images[1] LIKE \'https://res.cloudinary.com/%\' AND array_length(images,1) > 0 LIMIT 5000'
  ).split('\n').filter(Boolean);

  // keyword → [img1, img2, ...] haritası
  const keywordImages = new Map();
  for (const row of realRows) {
    const [name, img] = row.split('|');
    if (!name || !img || !img.startsWith('http')) continue;
    const kws = extractKeywords(name);
    if (kws.length === 0) continue;
    for (const kw of kws) {
      if (!keywordImages.has(kw)) keywordImages.set(kw, []);
      const arr = keywordImages.get(kw);
      if (arr.length < 20) arr.push(img); // Her keyword için max 20 resim sakla
    }
  }

  log(`Keyword haritası: ${keywordImages.size} kategori`);
  for (const [kw, imgs] of [...keywordImages.entries()].slice(0, 10)) {
    log(`  "${kw}": ${imgs.length} resim`);
  }

  // 2. Placeholder ürünleri çek
  log('Placeholder ürünler sorgulanıyor...');
  const placeholderRows = psql(
    `SELECT id, name, price FROM "Product" WHERE images[1] = '${PLACEHOLDER}' ORDER BY "createdAt" ASC`
  ).split('\n').filter(Boolean);

  const products = placeholderRows.map(row => {
    const parts = row.split('|');
    return { id: (parts[0] || '').trim(), name: (parts[1] || '').trim(), price: parseFloat(parts[2]) || 0 };
  }).filter(p => p.id && p.name);

  log(`Toplam placeholder ürün: ${products.length}`);

  const slice = products.slice(OFFSET, OFFSET + BATCH_SIZE);
  log(`İşlenecek: ${slice.length} (offset: ${OFFSET})`);

  const stats = { total: slice.length, matched: 0, noMatch: 0 };
  const sqlLines = [];

  // Her keyword için döngüsel index (round-robin - aynı resmi tekrar etmemek için)
  const kwIndex = new Map();

  for (const product of slice) {
    const kws = extractKeywords(product.name);

    // En spesifik keyword'den başla (ilk eşleşen)
    let img = null;
    for (const kw of kws) {
      const imgs = keywordImages.get(kw);
      if (imgs && imgs.length > 0) {
        // Round-robin seçim
        const idx = (kwIndex.get(kw) || 0) % imgs.length;
        kwIndex.set(kw, idx + 1);
        img = imgs[idx];
        break;
      }
    }

    if (img) {
      stats.matched++;
      const imgExpr = pgArray([img]);
      sqlLines.push(`UPDATE "Product" SET images=${imgExpr}, "updatedAt"=NOW() WHERE id='${product.id}';`);
      // Sadece eşleşen ilk 10'u logla
      if (stats.matched <= 10 || stats.matched % 100 === 0) {
        log(`  ✓ "${product.name.slice(0, 40)}" → [${kws[0]}]`);
      }
    } else {
      stats.noMatch++;
      if (stats.noMatch <= 5) {
        log(`  ✗ "${product.name.slice(0, 40)}" → keyword bulunamadı`);
      }
    }
  }

  // 3. SQL'i toplu çalıştır
  if (sqlLines.length > 0) {
    if (!DRY_RUN) {
      const chunkSize = 500;
      let written = 0;
      for (let i = 0; i < sqlLines.length; i += chunkSize) {
        const chunk = sqlLines.slice(i, i + chunkSize);
        const sql = 'BEGIN;\n' + chunk.join('\n') + '\nCOMMIT;\n';
        fs.writeFileSync(SQL_FILE, sql);
        const ok = runSqlFile(SQL_FILE);
        written += chunk.length;
        log(`  → ${written}/${sqlLines.length} güncelleme yazıldı${ok ? ' ✓' : ' ✗'}`);
      }
    } else {
      log(`  [DRY-RUN] ${sqlLines.length} güncelleme yapılacaktı`);
    }
  }

  log('─'.repeat(60));
  log('SONUÇ:');
  log(`  İşlenen        : ${stats.total}`);
  log(`  Eşleşen resim  : ${stats.matched}`);
  log(`  Eşleşmeyen     : ${stats.noMatch}`);
  log(`  Başarı oranı   : ${((stats.matched / stats.total) * 100).toFixed(1)}%`);
  log('='.repeat(60));
}

main().catch(e => {
  log('HATA: ' + e.message);
  process.exit(1);
});
