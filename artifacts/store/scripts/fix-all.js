#!/usr/bin/env node
// Tüm ürünler için: 1) kategori düzelt 2) alakalı resim ata 3) açıklamaya barkod ekle
process.emitWarning = () => {};
const { execFileSync } = require('child_process');
const fs = require('fs');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';

function psql(sql) {
  return execFileSync('psql', [DB, '-t', '-A', '-F|', '-c', sql], {
    env: { ...process.env, PGPASSWORD: PASS },
    stdio: 'pipe',
    maxBuffer: 50 * 1024 * 1024,
  }).toString().trim();
}

function psqlFile(path) {
  return execFileSync('psql', [DB, '-f', path], {
    env: { ...process.env, PGPASSWORD: PASS },
    stdio: 'pipe',
    maxBuffer: 10 * 1024 * 1024,
  }).toString().trim();
}

function pgStr(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function pgArr(a) { return 'ARRAY[' + a.map(pgStr).join(',') + ']'; }

function norm(s) {
  return String(s || '')
    .replace(/İ/g,'I').replace(/Ğ/g,'G').replace(/Ü/g,'U')
    .replace(/Ş/g,'S').replace(/Ö/g,'O').replace(/Ç/g,'C')
    .toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

// ─── KATEGORİ HARİTASI ────────────────────────────────────────────────────
// Öncelik sırasıyla: ilk eşleşen kategoriyi kullan
const CAT_RULES = [
  // Versatil/Uçlu Kalemler
  { keywords: ['versatil','uclu kalem','ucluk','0.3 mm','0.5 mm','0.7 mm','0.9 mm','grip matic','grip 0','tri matic','poly matic','rx5','rx7','rotring 600'], id: 'cat_versatil_uclu_kalemler' },
  // Fineliner
  { keywords: ['fineliner','ecobullet','ecopen','fine liner'], id: 'cat_fineliner_kalemler' },
  // Jel Kalem
  { keywords: ['jel kalem','gel kalem','jell kalem','signo','uniball jel'], id: 'cat_jel_kalemler' },
  // Fosforlu
  { keywords: ['fosforlu','highlighter','stabilo boss','swing cool','lumocolour'], id: 'cat_fosforlu_kalemler' },
  // Keçeli Boya
  { keywords: ['keceli boya','keçeli boya','carioca','sumo','jumbo keçeli'], id: 'cat_keceli_boya_kalemler' },
  // Tahta/Markör
  { keywords: ['tahta kalemi','beyaz tahta','kuru tahta','white board','whiteboard','cd marker','obd','akın marker','maxx marker'], id: 'cat_markor_kalemler' },
  // Tükenmez
  { keywords: ['tukenmez kalem','tükenmez kalem','tukenmez','tükenmez','triball','cristal','bic tukenmez','pensan','mile'], id: 'cat_tukenmez_kalemler' },
  // Kurşun Kalem
  { keywords: ['kursun kalem','kurşun kalem','kursun','9000','goldfaber','greengraph','blackpeps','blacklead','hb kalem','2b kalem','4b kalem','6b kalem','8b kalem','graphite'], id: 'cat_kursun-kalemler' },
  // Dereceli Çizim
  { keywords: ['dereceli cizim','teknik cizim','rapidograph','rotring isograph','mars lumograph','staedtler'], id: 'cat_dereceli_cizim_kalemleri' },
  // Mum Boya
  { keywords: ['mum boya','wax','crayola','jumbo mum'], id: 'cat_mum_boyalar' },
  // Pastel Boya (kuru)
  { keywords: ['kuru pastel','oil pastel','yagla pastel','pastel kalem'], id: 'cat_kuru_boyalar' },
  // Pastel
  { keywords: ['pastel boya','pastel'], id: 'cat_pastel_boyalar' },
  // Guaj
  { keywords: ['guaj','gouache'], id: 'cat_guaj_boyalar' },
  // Parmak Boyası
  { keywords: ['parmak boyasi','parmak boya','finger paint'], id: 'cat_parmak_boyasi' },
  // Yağlı Boya
  { keywords: ['yagli boya','yağlı boya','oil paint','oil colour'], id: 'cmpbs60y7000x68chdj6xezd5' },
  // Sulu Boya
  { keywords: ['sulu boya','suluboya','watercolor','aquarel','pebeo'], id: 'cat_sulu_boyalar' },
  // Akrilik Boya
  { keywords: ['akrilik boya','akrilik','acrylic'], id: 'cmpbs613d001168ch6zgl20a8' },
  // Fırça
  { keywords: ['boya fircasi','firca seti','fırça seti','fırça','firca'], id: 'cat_firca' },
  // Palet
  { keywords: ['palet','palette'], id: 'cat_palet' },
  // Boyama Seti
  { keywords: ['boyama seti','boya seti','art set','creativity set'], id: 'cat_boyama_setleri' },
  // Resim Defteri/Blok
  { keywords: ['resim defteri','resim blok','eskiz defter','sketch defter','art defter','gramajli'], id: 'cat_resim-defteri-ve-bloklari' },
  // Silgi
  { keywords: ['sinav silgisi','toz tutmaz','dust free','kauçuk silgi','silgi'], id: 'cat_silgiler' },
  // Kalemtraş
  { keywords: ['kalemtras','kalemtraş','sharpener','cep kalemtras'], id: 'cat_kalemtraslar' },
  // Kalem Kutusu
  { keywords: ['kalem kutusu','kalem cantasi','kalemlik','kalem kutu'], id: 'cat_kalem-kutulari' },
  // Makas
  { keywords: ['makas','scissor'], id: 'cmpbs61o3001h68chgrwrv0eq' },
  // Stick Yapıştırıcı
  { keywords: ['glue stick','stick yapistirici','stick yapıştırıcı','pritt stick','uhu stick'], id: 'cat_stick_yapistirici' },
  // Tutkal
  { keywords: ['sivi yapistirici','japon yapistirici','tutkal','yapistirici','glue'], id: 'cat_tutkallar' },
  // Bant
  { keywords: ['koli bant','seffaf bant','maskeleme bant','bant'], id: 'cat_bantlar' },
  // Zımba
  { keywords: ['zimba teli','zimba makinesi','tel sokuc','zımba','zimba'], id: 'cat_zimbalar' },
  // Ataş/Kıskaç
  { keywords: ['kiskac','atas','paper clip','binder clip'], id: 'cat_kiskac_ve_atas' },
  // Cetvel
  { keywords: ['cetvel','ruler'], id: 'cat_cetvel' },
  // Not Kağıdı
  { keywords: ['post-it','post it','yapiskan not','yapışkan not'], id: 'cat_not_kagitlari_post_it' },
  // Planlayıcı
  { keywords: ['planlayici','planlayıcı','bullet journal','haftalik plan','gunluk plan'], id: 'cat_planlayicilar' },
  // Ajanda
  { keywords: ['ajanda'], id: 'cat_diger-ajandalar' },
  // Butik Defter
  { keywords: ['butik defter','spiral defter','spiralli defter','colormax','colormaxi'], id: 'cat_butik_defterler' },
  // Çizgili Defter
  { keywords: ['cizgili defter','çizgili defter','lined notebook'], id: 'cat_cizgili_defter' },
  // Kareli Defter
  { keywords: ['kareli defter','squared notebook'], id: 'cat_kareli_defter' },
  // Çizgisiz Defter
  { keywords: ['cizgisiz defter','çizgisiz defter','blank notebook','noktali defter','noktalı'], id: 'cat_cizgisiz_defter' },
  // Not Defteri
  { keywords: ['not defteri','blok not','bloknot','memo defter'], id: 'cat_not_defterleri_ve_bloknot' },
  // Defter genel
  { keywords: ['defter','notebook'], id: 'cat_defterler' },
  // Oyun Hamuru
  { keywords: ['oyun hamuru','play doh','playdoh'], id: 'cat_oyun_hamuru' },
  // Kil
  { keywords: ['kil','proje hamuru'], id: 'cat_kil_ve_proje_hamurla' },
  // Anaokulu
  { keywords: ['anaokulu','kesme yapistirma','finger'], id: 'cat_anaokulu_etkinlik_malzeme' },
  // Sticker/Etiket
  { keywords: ['sticker','etiket','label'], id: 'cat_sticker-ve-etiket' },
  // Sırt Çantası
  { keywords: ['sirt cantasi','sırt çantası','okul cantasi','backpack'], id: 'cat_sirt-cantasi' },
  // Kırtasiye Seti
  { keywords: ['kirtasiye seti','kırtasiye seti','okul seti','school set'], id: 'cat_kirtasiye_setleri' },
  // Karton/Kağıt
  { keywords: ['fon kartonu','renkli karton','eva'], id: 'cat_kagit_ve_kartonlar' },
];

// ─── RESİM EŞLEŞTİRME KURALLARI ─────────────────────────────────────────
const IMG_RULES = [
  { m:['versatil','uclu kalem','tri matic','poly matic','grip matic','grip 0','auto 0'], c:'uclu_kalem' },
  { m:['fineliner','ecobullet','ecopen'], c:'fineliner' },
  { m:['jel kalem','gel kalem'], c:'jel_kalem' },
  { m:['fosforlu','highlighter','swing cool'], c:'fosforlu' },
  { m:['keceli boya','keçeli boya','carioca'], c:'keceli' },
  { m:['tahta kalemi','whiteboard','white board','kuru tahta','marker'], c:'marker' },
  { m:['tukenmez','tükenmez','triball','cristal'], c:'tukenmez' },
  { m:['kursun kalem','kurşun kalem','goldfaber','9000 '], c:'kursun' },
  { m:['kuru pastel','oil pastel'], c:'kuru_pastel' },
  { m:['pastel boya','pastel'], c:'pastel' },
  { m:['guaj','gouache'], c:'guaj' },
  { m:['parmak boya','finger paint'], c:'parmak_boya' },
  { m:['yagli boya','yağlı boya','oil paint'], c:'yagli_boya' },
  { m:['sulu boya','suluboya','aquarel'], c:'sulu_boya' },
  { m:['akrilik boya','akrilik'], c:'akrilik' },
  { m:['mum boya','wax','crayola'], c:'mum_boya' },
  { m:['boya fircasi','firca seti','fırça'], c:'firca' },
  { m:['palet'], c:'palet' },
  { m:['boyama seti','boya seti'], c:'boya_seti' },
  { m:['resim defteri','resim blok','eskiz'], c:'resim_defteri' },
  { m:['silgi'], c:'silgi' },
  { m:['kalemtras','kalemtraş'], c:'kalemtras' },
  { m:['makas'], c:'makas' },
  { m:['glue stick','stick yapistirici','pritt'], c:'stick' },
  { m:['japon yapistirici','yapistirici','tutkal'], c:'tutkal' },
  { m:['bant'], c:'bant' },
  { m:['zimba'], c:'zimba' },
  { m:['atas','kiskac'], c:'atas' },
  { m:['spiralli defter','colormaxi','colormax'], c:'spiralli_defter' },
  { m:['not defteri','bloknot'], c:'not_defteri' },
  { m:['cizgili defter','çizgili defter'], c:'cizgili_defter' },
  { m:['kareli defter'], c:'kareli_defter' },
  { m:['butik defter'], c:'butik_defter' },
  { m:['defter'], c:'defter' },
  { m:['oyun hamuru'], c:'oyun_hamuru' },
  { m:['sticker','etiket'], c:'etiket' },
  { m:['sirt cantasi','sırt çantası','okul cantasi'], c:'canta' },
  { m:['cetvel'], c:'cetvel' },
  { m:['kalem kutusu','kalemlik'], c:'kalemlik' },
  { m:['post-it','post it','yapiskan not'], c:'post_it' },
];

const IMG_BRAND_RULES = [
  { b:['faber castell','faber-castell'], c:'kursun' },
  { b:['stabilo'], c:'fosforlu' },
  { b:['rotring'], c:'uclu_kalem' },
  { b:['edding'], c:'marker' },
  { b:['carioca'], c:'keceli' },
  { b:['nova color'], c:'akrilik' },
  { b:['lets'], c:'oyun_hamuru' },
  { b:['gıpta','gipta'], c:'defter' },
  { b:['keskin color'], c:'defter' },
];

function findImgCat(name) {
  const n = norm(name);
  for (const r of IMG_RULES) {
    for (const m of r.m) {
      if (n.includes(norm(m))) return r.c;
    }
  }
  for (const b of IMG_BRAND_RULES) {
    for (const bk of b.b) {
      if (n.includes(norm(bk))) return b.c;
    }
  }
  return null;
}

function findCatId(name) {
  const n = norm(name);
  for (const r of CAT_RULES) {
    for (const kw of r.keywords) {
      if (n.includes(norm(kw))) return r.id;
    }
  }
  return null; // değiştirme
}

// ─── 1. Resim havuzu oluştur ──────────────────────────────────────────────
console.log('Cloudinary resim havuzu yükleniyor...');
const imgRows = psql(
  `SELECT name, images[1] FROM "Product" WHERE images[1] LIKE 'https://res.cloudinary.com/%' LIMIT 7000`
).split('\n').filter(Boolean);

const imgPool = new Map(); // cat → [url, ...]
for (const row of imgRows) {
  const pi = row.indexOf('|');
  if (pi < 0) continue;
  const rName = row.slice(0, pi);
  const img   = row.slice(pi + 1);
  if (!img.startsWith('http')) continue;
  const cat = findImgCat(rName);
  if (!cat) continue;
  if (!imgPool.has(cat)) imgPool.set(cat, []);
  if (imgPool.get(cat).length < 80) imgPool.get(cat).push(img);
}
console.log(`Havuz: ${imgPool.size} kategori, toplamda ${[...imgPool.values()].reduce((s,a)=>s+a.length,0)} resim`);

// ─── 2. Tüm ürünleri çek ─────────────────────────────────────────────────
console.log('Tüm ürünler çekiliyor...');
const prodRows = psql(
  `SELECT p.id, p.name, p.sku, p.description, p.images[1], c.name as catname
   FROM "Product" p
   LEFT JOIN "Category" c ON p."categoryId" = c.id
   ORDER BY p."createdAt" ASC`
).split('\n').filter(Boolean);

const products = prodRows.map(r => {
  const parts = r.split('|');
  return {
    id:    parts[0],
    name:  parts[1] || '',
    sku:   parts[2] || '',
    desc:  parts[3] || '',
    img:   parts[4] || '',
    cat:   parts[5] || '',
  };
}).filter(p => p.id && p.name);

console.log(`Toplam ürün: ${products.length}`);

// ─── 3. SQL üret ─────────────────────────────────────────────────────────
const catRR  = new Map();
const imgLines  = [];
const catLines  = [];
const descLines = [];

const FALLBACK_CATS = ['kursun','tukenmez','fosforlu','uclu_kalem','keceli','akrilik','sulu_boya','silgi','defter','bant'];

function getImg(name) {
  let cat = findImgCat(name);
  if (!cat || !imgPool.has(cat)) {
    for (const fb of FALLBACK_CATS) {
      if (imgPool.has(fb)) { cat = fb; break; }
    }
  }
  const pool = imgPool.get(cat);
  if (!pool || !pool.length) return null;
  const idx = (catRR.get(cat) || 0) % pool.length;
  catRR.set(cat, idx + 1);
  return pool[idx];
}

let imgChanged = 0, catChanged = 0, descChanged = 0;

for (const prod of products) {
  // Resim güncelle (hepsi için — alakalı resim ata)
  const newImg = getImg(prod.name);
  if (newImg && newImg !== prod.img) {
    imgLines.push(
      `UPDATE "Product" SET images=${pgArr([newImg])}, "updatedAt"=NOW() WHERE id=${pgStr(prod.id)};`
    );
    imgChanged++;
  }

  // Kategori düzelt
  const newCatId = findCatId(prod.name);
  if (newCatId) {
    catLines.push(
      `UPDATE "Product" SET "categoryId"=${pgStr(newCatId)}, "updatedAt"=NOW() WHERE id=${pgStr(prod.id)};`
    );
    catChanged++;
  }

  // Açıklamaya barkod ekle (SKU 8-14 haneli rakam = barkod)
  if (/^\d{8,14}$/.test(prod.sku)) {
    const barcodeText = `Barkod: ${prod.sku}`;
    const hasBarcodeInDesc = prod.desc.includes('Barkod:') || prod.desc.includes(prod.sku);
    if (!hasBarcodeInDesc) {
      const newDesc = prod.desc
        ? prod.desc.trim() + '\n' + barcodeText
        : barcodeText;
      descLines.push(
        `UPDATE "Product" SET description=${pgStr(newDesc)}, "updatedAt"=NOW() WHERE id=${pgStr(prod.id)};`
      );
      descChanged++;
    }
  }
}

console.log(`Değiştirilecek: ${imgChanged} resim, ${catChanged} kategori, ${descChanged} açıklama`);

// ─── 4. Dosyalara yaz ve çalıştır ────────────────────────────────────────
const CHUNK = 500;
const OUT = '/tmp/fix_chunks';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function writeAndRun(lines, label) {
  if (!lines.length) { console.log(`${label}: değişiklik yok`); return; }
  let chunkIdx = 0;
  for (let i = 0; i < lines.length; i += CHUNK) {
    const chunk = lines.slice(i, i + CHUNK);
    const sql = 'BEGIN;\n' + chunk.join('\n') + '\nCOMMIT;\n';
    const path = `${OUT}/${label}_${String(chunkIdx).padStart(3,'0')}.sql`;
    fs.writeFileSync(path, sql);
    process.stdout.write(`  [${label}] chunk ${chunkIdx}... `);
    try {
      psqlFile(path);
      console.log('OK');
    } catch (e) {
      console.log('HATA:', e.message.slice(0,80));
    }
    chunkIdx++;
  }
  console.log(`${label}: ${chunkIdx} chunk tamamlandı`);
}

writeAndRun(catLines,  'cat');
writeAndRun(imgLines,  'img');
writeAndRun(descLines, 'desc');

console.log('TAMAMLANDI!');
