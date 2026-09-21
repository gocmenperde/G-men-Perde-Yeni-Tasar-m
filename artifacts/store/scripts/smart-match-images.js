#!/usr/bin/env node
/**
 * Akıllı Resim Eşleştirme
 * -------------------------
 * Marka + keyword tabanlı eşleştirme ile DB'deki gerçek resimlerden
 * 4000+ placeholder ürüne resim & fiyat ata.
 *
 * Kullanım:
 *   node scripts/smart-match-images.js
 *   node scripts/smart-match-images.js --dry-run
 *   node scripts/smart-match-images.js --batch 500 --offset 0
 */

process.emitWarning = () => {};
const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';
const PLACEHOLDER = 'https://placehold.co/400x400/f1f5f9/94a3b8';
const LOG  = path.join(__dirname, 'smart-match.log');
const SQL  = path.join(__dirname, '_smart_batch.sql');

const args   = process.argv.slice(2);
const DRY    = args.includes('--dry-run');
const BI     = args.indexOf('--batch');
const BATCH  = BI !== -1 ? parseInt(args[BI+1])||9999999 : 9999999;
const OI     = args.indexOf('--offset');
const OFFSET = OI !== -1 ? parseInt(args[OI+1])||0 : 0;

function log(m) {
  const l = `[${new Date().toISOString()}] ${m}`;
  console.log(l);
  try { fs.appendFileSync(LOG, l+'\n'); } catch(_) {}
}

function psql(sql) {
  return execFileSync('psql', [DB,'-t','-A','-F|','-c',sql], {
    env:{...process.env,PGPASSWORD:PASS}, stdio:'pipe'
  }).toString().trim();
}

function runFile(f) {
  try {
    execFileSync('psql',[DB,'-f',f],{env:{...process.env,PGPASSWORD:PASS},stdio:'pipe'});
    return true;
  } catch(e) { log('SQL err: '+(e.stderr?.toString()||e.message).slice(0,120)); return false; }
}

function pgStr(s) { return "'"+String(s).replace(/'/g,"''")+"'"; }
function pgArr(a) { return 'ARRAY['+a.map(pgStr).join(',')+']'; }

// ─── Normalize ────────────────────────────────────────────────────────────────
function norm(s) {
  return String(s||'')
    .replace(/İ/g,'I').replace(/Ğ/g,'G').replace(/Ü/g,'U')
    .replace(/Ş/g,'S').replace(/Ö/g,'O').replace(/Ç/g,'C')
    .toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

// ─── Kategori Kuralları ────────────────────────────────────────────────────────
// Her kural: { match: string|RegExp|string[], category: string, priority: number }
// Yüksek priority → önce denenir
const RULES = [
  // ── Defter çeşitleri (önce spesifik)
  { match: ['konulu defter','konullu'], cat:'konulu defter', pri:100 },
  { match: ['spiralli','spiralli defter'], cat:'spiralli defter', pri:100 },
  { match: ['kareli defter'], cat:'kareli defter', pri:100 },
  { match: ['cizgili defter','cizgili'], cat:'cizgili defter', pri:95 },
  { match: ['cizgisiz defter'], cat:'cizgisiz defter', pri:95 },
  { match: ['sert kapak defter'], cat:'sert kapak defter', pri:95 },
  { match: ['not defteri','bloknot','blok not'], cat:'not defteri', pri:90 },
  { match: ['planlama defteri','planlayici'], cat:'planlama defteri', pri:90 },
  { match: ['ajanda'], cat:'ajanda', pri:90 },
  { match: ['resim defteri'], cat:'resim defteri', pri:90 },
  { match: ['defter','notebook'], cat:'defter', pri:70 },
  // ── Kalem - spesifik
  { match: ['versatil kalem','uçlu kalem','uclu kalem','uçlu','uclu','matic','auto 0','auto 05','grip 0','grip05'], cat:'uclu kalem', pri:100 },
  { match: ['fosforlu kalem','fosforlu'], cat:'fosforlu kalem', pri:100 },
  { match: ['keçeli kalem','keceli kalem','keçeli','keceli','marker','tahta kalemi'], cat:'keceli kalem', pri:100 },
  { match: ['tükenmez kalem','tukenmez kalem','tukenmez','triball','lüks tükenmez'], cat:'tukenmez kalem', pri:100 },
  { match: ['kurşun kalem','kursun kalem','kurşun','kursun','hb kalem','2b kalem','miss bic'], cat:'kursun kalem', pri:100 },
  { match: ['jel kalem','gel kalem','jell'], cat:'jel kalem', pri:100 },
  { match: ['kalem ucu','kalem uç','uc tüp','uc tup'], cat:'kalem ucu', pri:95 },
  { match: ['kopya kalemi'], cat:'kursun kalem', pri:90 },
  { match: ['kalemlik','kalem cantasi','kalem çantası'], cat:'kalemlik', pri:90 },
  { match: ['kalem'], cat:'kalem', pri:60 },
  // ── Boya
  { match: ['akrilik boya'], cat:'akrilik boya', pri:100 },
  { match: ['pastel boya'], cat:'pastel boya', pri:100 },
  { match: ['suluboya','sulu boya','by sulu'], cat:'suluboya', pri:100 },
  { match: ['guaj boya'], cat:'guaj boya', pri:100 },
  { match: ['yüz boyasi','yuz boyasi'], cat:'boya', pri:90 },
  { match: ['parmak boyasi'], cat:'boya', pri:90 },
  { match: ['boya fırçası','boya fircasi','firca seti','fırça seti'], cat:'firca', pri:90 },
  { match: ['boya'], cat:'boya', pri:60 },
  // ── Zimba & Ataç
  { match: ['tel zimba','zimba teli','zimba makinesi'], cat:'zimba', pri:100 },
  { match: ['zimba'], cat:'zimba', pri:80 },
  { match: ['plastik atac','metal atac','plastik ataç','ataç'], cat:'atac', pri:95 },
  { match: ['atac'], cat:'atac', pri:80 },
  { match: ['raptiye'], cat:'raptiye', pri:90 },
  // ── Yapıştırıcı
  { match: ['stick yapistirici','glue stick','pritt','yapıştırıcı çubuk','glue'], cat:'stick yapistirici', pri:100 },
  { match: ['sıvı yapıştırıcı','sivi yapistirici','japon yapistirici'], cat:'yapistirici', pri:90 },
  { match: ['yapistirici','yapıştırıcı'], cat:'yapistirici', pri:70 },
  // ── Silgi
  { match: ['sinav silgisi','toz tutmaz silgi','dust free silgi'], cat:'silgi', pri:100 },
  { match: ['silgi'], cat:'silgi', pri:80 },
  { match: ['silindir açacak','silindir acak','açacak','acak'], cat:'kalem trasas', pri:80 },
  // ── Makas
  { match: ['öğrenci makası','ogrencu makasi','plastik makas'], cat:'makas', pri:100 },
  { match: ['makas'], cat:'makas', pri:80 },
  { match: ['maket bicagi','maket bıçağı','uc kucuk','uc buyuk'], cat:'makas', pri:80 },
  // ── Cetvel & Geometri
  { match: ['pergel'], cat:'pergel', pri:100 },
  { match: ['iletki'], cat:'iletki', pri:100 },
  { match: ['cetvel takimi','cetvel seti'], cat:'cetvel', pri:95 },
  { match: ['daire sablonu','daire şablonu'], cat:'iletki', pri:90 },
  { match: ['cetvel'], cat:'cetvel', pri:80 },
  // ── Bant
  { match: ['koli bant','koli band'], cat:'bant', pri:100 },
  { match: ['maskeleme bant','maskeleme band'], cat:'bant', pri:100 },
  { match: ['selophan bant','selefon bant'], cat:'bant', pri:100 },
  { match: ['kirtasiye bant','kırtasiye bantı'], cat:'bant', pri:90 },
  { match: ['bant makinesi'], cat:'bant', pri:90 },
  { match: ['bant','band'], cat:'bant', pri:60 },
  // ── Dosya & Klasör
  { match: ['klasor','klasör','telli dosya','plastik dosya'], cat:'klasor', pri:100 },
  { match: ['dosya'], cat:'dosya', pri:80 },
  { match: ['cilt','proje cantasi'], cat:'dosya', pri:70 },
  // ── Kağıt
  { match: ['fotokopi kagidi','fotokopi kagit','a4 kagid','a4 kagit'], cat:'fotokopi kagidi', pri:100 },
  { match: ['elisi kagid','elisi kagit','elisi kagidi'], cat:'karton', pri:100 },
  { match: ['renkli kagit','renkli karton'], cat:'karton', pri:95 },
  { match: ['karton','eva'], cat:'karton', pri:80 },
  { match: ['ambalaj jelatin','jelatin','seffaf ambalaj'], cat:'karton', pri:80 },
  { match: ['kraft'], cat:'fotokopi kagidi', pri:70 },
  { match: ['kagid','kagit'], cat:'fotokopi kagidi', pri:50 },
  // ── Oyun & Hobi
  { match: ['oyun hamuru'], cat:'oyun hamuru', pri:100 },
  { match: ['puzzle','yapboz','puzlle'], cat:'puzzle', pri:100 },
  { match: ['boyama kitabi','boyama kitap'], cat:'boya', pri:90 },
  { match: ['sayi cubugu','sayi fasulye','mishab','mishap'], cat:'oyun hamuru', pri:80 },
  // ── Etiket & Sticker
  { match: ['etiket'], cat:'etiket', pri:90 },
  { match: ['pul','sim'], cat:'etiket', pri:70 },
  // ── Matara & Suluk
  { match: ['matara','suluk'], cat:'matara', pri:90 },
  // ── Çanta
  { match: ['çanta','canta'], cat:'canta', pri:90 },
  // ── Hesap Makinesi & Tebeşir
  { match: ['hesap makinesi'], cat:'hesap makinesi', pri:100 },
  { match: ['tebesir','tebeşir'], cat:'tebesir', pri:100 },
  { match: ['tahta silgisi'], cat:'silgi', pri:90 },
  // ── Kumbara
  { match: ['kumbara'], cat:'oyun hamuru', pri:70 },
  // ── Lastik
  { match: ['lastik','misine'], cat:'atac', pri:60 },
  // ── Kitap türleri
  { match: ['roman','hikaye','anı','biyografi'], cat:'kitap roman', pri:80 },
  { match: ['sozluk','sözlük'], cat:'kitap sozluk', pri:80 },
  { match: ['atlas','harita'], cat:'kitap atlas', pri:80 },
  { match: ['ilmihal','kuran','namaz','dua','oruc','imanin'], cat:'kitap dini', pri:80 },
  { match: ['risale','bediuzzaman','gulen','nursi'], cat:'kitap dini', pri:80 },
  { match: ['kitap','yayinlari','yayınları'], cat:'kitap', pri:50 },
];

// ─── Marka → Kategori Haritası ───────────────────────────────────────────────
const BRAND_MAP = [
  // Kalem markaları
  { brands:['faber castell','faber-castell','faber castel'], cats:['kalem','silgi','boya'], pri:50 },
  { brands:['pensan'], cats:['tukenmez kalem','kursun kalem'], pri:50 },
  { brands:['bic','miss bic'], cats:['kursun kalem','tukenmez kalem'], pri:50 },
  { brands:['stabilo'], cats:['fosforlu kalem','keceli kalem'], pri:50 },
  { brands:['pilot'], cats:['tukenmez kalem'], pri:50 },
  { brands:['rotring'], cats:['uclu kalem'], pri:50 },
  { brands:['scrikss','steelpen','steel pen','zebra'], cats:['tukenmez kalem'], pri:50 },
  { brands:['moso','micra','perfect','mok'], cats:['uclu kalem'], pri:50 },
  { brands:['aihao','aihaoo'], cats:['fosforlu kalem'], pri:50 },
  { brands:['edding'], cats:['keceli kalem'], pri:50 },
  // Defter markaları
  { brands:['cinar','çınar'], cats:['spiralli defter','kareli defter'], pri:50 },
  { brands:['mopak'], cats:['defter','fotokopi kagidi'], pri:50 },
  { brands:['keskin color','keskin-color'], cats:['defter','etiket'], pri:50 },
  { brands:['gipta','gıpta'], cats:['defter'], pri:50 },
  { brands:['klas','gazelle','gıpta quarter','gipta chromo'], cats:['defter'], pri:50 },
  { brands:['long'], cats:['defter'], pri:50 },
  // Boya markaları
  { brands:['nova color'], cats:['akrilik boya'], pri:50 },
  { brands:['adel'], cats:['pastel boya'], pri:50 },
  { brands:['fatih'], cats:['pastel boya'], pri:50 },
  { brands:['bu-bu','bubu'], cats:['firca'], pri:50 },
  { brands:['brons'], cats:['firca','atac','zimba'], pri:50 },
  // Yapıştırıcı
  { brands:['mikro','maxx','tenora','uhu'], cats:['stick yapistirici'], pri:50 },
  // Zimba
  { brands:['sid','mas','rapid','mimaks','monopol'], cats:['zimba'], pri:50 },
  // Diğer
  { brands:['lets','let s'], cats:['oyun hamuru'], pri:50 },
  { brands:['ticon','tıcon'], cats:['karton'], pri:50 },
  { brands:['bevitton'], cats:['canta'], pri:50 },
  { brands:['alper'], cats:['etiket'], pri:50 },
  { brands:['ark'], cats:['kalem'], pri:40 },
  { brands:['yuçiz','yuciz'], cats:['pergel'], pri:50 },
  { brands:['maped'], cats:['makas','silgi'], pri:50 },
  { brands:['hatas'], cats:['iletki'], pri:50 },
];

// ─── Kategori → DB'deki keyword eşleşmesi ─────────────────────────────────────
// DB ürün adlarında hangi kelimeler o kategoriyi temsil eder
const CAT_KEYWORDS = {
  'konulu defter':    ['konulu defter'],
  'spiralli defter':  ['spiralli defter','spiralli','karizma defter','colormaxi'],
  'kareli defter':    ['kareli defter','kareli'],
  'cizgili defter':   ['cizgili defter','cizgili'],
  'cizgisiz defter':  ['cizgisiz defter','cizgisiz'],
  'sert kapak defter':['sert kapak defter','iplik dikis defter'],
  'not defteri':      ['not defteri','bloknot','blok'],
  'planlama defteri': ['planlama defteri','planlayici','suresiz'],
  'ajanda':           ['ajanda'],
  'resim defteri':    ['resim defteri'],
  'defter':           ['defter'],
  'uclu kalem':       ['uclu kalem','versatil'],
  'fosforlu kalem':   ['fosforlu kalem','fosforlu'],
  'keceli kalem':     ['keceli kalem','keçeli','beyaz tahta','marker'],
  'tukenmez kalem':   ['tukenmez kalem','tukenmez'],
  'kursun kalem':     ['kursun kalem','kursun'],
  'jel kalem':        ['jel kalem','gel'],
  'kalem ucu':        ['uclu kalem'],
  'kalemlik':         ['kalemlik'],
  'kalem trasas':     ['silindir'],
  'kalem':            ['kalem'],
  'akrilik boya':     ['akrilik boya'],
  'pastel boya':      ['pastel boya'],
  'suluboya':         ['suluboya','sulu'],
  'guaj boya':        ['boya'],
  'firca':            ['firca'],
  'boya':             ['boya'],
  'zimba':            ['zimba'],
  'atac':             ['atac','ataç'],
  'raptiye':          ['raptiye'],
  'stick yapistirici':['yapistirici','pritt','stick'],
  'yapistirici':      ['yapistirici'],
  'silgi':            ['silgi'],
  'kalem trasas':     ['acak'],
  'makas':            ['makas'],
  'pergel':           ['pergel'],
  'iletki':           ['iletki','daire'],
  'cetvel':           ['cetvel'],
  'bant':             ['bant'],
  'klasor':           ['klasor','dosya'],
  'dosya':            ['dosya'],
  'fotokopi kagidi':  ['fotokopi kagidi','kagit','a4'],
  'karton':           ['karton','renkli'],
  'oyun hamuru':      ['oyun hamuru','hamur'],
  'puzzle':           ['puzzle'],
  'etiket':           ['etiket'],
  'matara':           ['matara'],
  'canta':            ['canta','çanta'],
  'hesap makinesi':   ['hesap makinesi'],
  'tebesir':          ['tebesir'],
  'kitap roman':      ['roman','hikaye'],
  'kitap sozluk':     ['sozluk'],
  'kitap atlas':      ['atlas'],
  'kitap dini':       ['kuran','namaz','dua'],
  'kitap':            ['kitap'],
};

// ─── Kategoriyi bul ───────────────────────────────────────────────────────────
function findCategory(name) {
  const n = norm(name);

  // 1. Keyword kuralları (yüksek priority önce)
  const sorted = [...RULES].sort((a,b) => b.pri - a.pri);
  for (const rule of sorted) {
    const terms = Array.isArray(rule.match) ? rule.match : [rule.match];
    for (const t of terms) {
      const nt = norm(t);
      if (n.includes(nt)) return { cat: rule.cat, via: 'keyword:'+t };
    }
  }

  // 2. Marka bazlı (hiçbir keyword eşleşmediyse)
  for (const bm of BRAND_MAP) {
    for (const brand of bm.brands) {
      if (n.includes(norm(brand))) {
        return { cat: bm.cats[0], via: 'brand:'+brand };
      }
    }
  }

  return null;
}

// ─── Ana Fonksiyon ────────────────────────────────────────────────────────────
async function main() {
  log('='.repeat(60));
  log(`Akıllı Resim Eşleştirme${DRY?' [DRY-RUN]':''}`);
  log(`Batch: ${BATCH} | Offset: ${OFFSET}`);

  // 1. Gerçek resimli ürünlerden keyword-image haritası oluştur
  log('Gerçek resimli ürünler sorgulanıyor...');
  const realRows = psql(
    `SELECT name, images[1], price FROM "Product"
     WHERE images[1] LIKE 'https://res.cloudinary.com/%'
     AND array_length(images,1) > 0
     LIMIT 6000`
  ).split('\n').filter(Boolean);

  // cat → [{img, price}]
  const catPool = new Map();
  let realCount = 0;
  for (const row of realRows) {
    const parts = row.split('|');
    const [rName, img, priceStr] = parts;
    if (!rName || !img || !img.startsWith('http')) continue;
    const hit = findCategory(rName);
    if (!hit) continue;
    realCount++;
    if (!catPool.has(hit.cat)) catPool.set(hit.cat, []);
    const arr = catPool.get(hit.cat);
    if (arr.length < 40) {
      arr.push({ img, price: parseFloat(priceStr)||0 });
    }
  }
  log(`Gerçek resim havuzu: ${catPool.size} kategori, ${realCount} ürün`);
  for (const [cat, items] of [...catPool.entries()].slice(0, 15)) {
    log(`  "${cat}": ${items.length} resim`);
  }

  // 2. Placeholder ürünleri çek
  log('Placeholder ürünler sorgulanıyor...');
  const rows = psql(
    `SELECT id, sku, name, price FROM "Product"
     WHERE images[1]=${pgStr(PLACEHOLDER)}
     ORDER BY "createdAt" ASC`
  ).split('\n').filter(Boolean);

  const products = rows.map(r => {
    const p = r.split('|');
    return { id:p[0]||'', sku:p[1]||'', name:p[2]||'', price:parseFloat(p[3])||0 };
  }).filter(p => p.id && p.name);

  log(`Toplam placeholder: ${products.length}`);
  const slice = products.slice(OFFSET, OFFSET + BATCH);
  log(`İşlenecek: ${slice.length}`);

  // 3. Her ürüne kategori bul, resim ata
  const catRR = new Map(); // round-robin index
  const stats = { total:slice.length, matched:0, noMatch:0, priceUsed:0 };
  const sqlLines = [];

  for (const prod of slice) {
    const hit = findCategory(prod.name);
    if (!hit) {
      stats.noMatch++;
      if (stats.noMatch <= 10) log(`  ✗ "${prod.name.slice(0,45)}" → kategori yok`);
      continue;
    }

    const pool = catPool.get(hit.cat);
    if (!pool || pool.length === 0) {
      // Fallback: üst kategori dene
      const fallbackCats = ['kalem','defter','boya','silgi','zimba','dosya','bant','karton'];
      let found = false;
      for (const fb of fallbackCats) {
        const fbPool = catPool.get(fb);
        if (fbPool && fbPool.length > 0) {
          const idx = (catRR.get(fb)||0) % fbPool.length;
          catRR.set(fb, idx+1);
          const item = fbPool[idx];
          stats.matched++;
          sqlLines.push(buildSql(prod.id, [item.img]));
          found = true;
          break;
        }
      }
      if (!found) stats.noMatch++;
      continue;
    }

    // Round-robin resim seç
    const idx = (catRR.get(hit.cat)||0) % pool.length;
    catRR.set(hit.cat, idx+1);
    const item = pool[idx];
    stats.matched++;

    // Fiyat: ürünün kendi fiyatı varsa koru, yoksa havuzdakini kullan
    let sql = `UPDATE "Product" SET images=${pgArr([item.img])}, "updatedAt"=NOW()`;
    if ((!prod.price || prod.price < 1) && item.price > 0) {
      sql += `, price=${item.price}`;
      stats.priceUsed++;
    }
    sql += ` WHERE id=${pgStr(prod.id)};`;
    sqlLines.push(sql);

    if (stats.matched <= 5 || stats.matched % 200 === 0) {
      log(`  ✓ "${prod.name.slice(0,40)}" → [${hit.cat}] via ${hit.via}`);
    }

    // Her 500 satırda flush
    if (sqlLines.length >= 500) {
      const chunk = sqlLines.splice(0, 500);
      if (!DRY) { runChunk(chunk); log(`  → ${chunk.length} güncelleme yazıldı`); }
    }
  }

  // Kalan
  if (sqlLines.length > 0) {
    if (!DRY) { runChunk(sqlLines); log(`  → ${sqlLines.length} güncelleme yazıldı (son)`); }
    else { log(`  [DRY] ${sqlLines.length} güncelleme atlandı`); }
  }

  log('─'.repeat(60));
  log('SONUÇ:');
  log(`  İşlenen       : ${stats.total}`);
  log(`  Eşleşen       : ${stats.matched}`);
  log(`  Eşleşmeyen    : ${stats.noMatch}`);
  log(`  Fiyat eklendi : ${stats.priceUsed}`);
  log(`  Başarı oranı  : ${((stats.matched/stats.total)*100).toFixed(1)}%`);
  log('='.repeat(60));
}

function buildSql(id, imgs) {
  return `UPDATE "Product" SET images=${pgArr(imgs)}, "updatedAt"=NOW() WHERE id=${pgStr(id)};`;
}

function runChunk(lines) {
  const sql = 'BEGIN;\n' + lines.join('\n') + '\nCOMMIT;\n';
  fs.writeFileSync(SQL, sql);
  runFile(SQL);
}

main().catch(e => { log('FATAL: '+e.message+'\n'+e.stack); process.exit(1); });
