#!/usr/bin/env node
// VALUES listesiyle toplu UPDATE — binlerce ayrı UPDATE yerine tek sorgu
process.emitWarning = () => {};
const { execFileSync } = require('child_process');
const fs = require('fs');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';
const TASK = process.argv[2]; // 'img' veya 'desc'
const BATCH = 1000;

function psql(sql) {
  return execFileSync('psql', [DB, '-t', '-A', '-F|', '-c', sql], {
    env: { ...process.env, PGPASSWORD: PASS },
    stdio: 'pipe', maxBuffer: 60 * 1024 * 1024,
  }).toString().trim();
}
function psqlQ(sql) {
  const tmpFile = `/tmp/_bulk_${Date.now()}.sql`;
  fs.writeFileSync(tmpFile, sql);
  try {
    return execFileSync('psql', [DB, '-q', '-f', tmpFile], {
      env: { ...process.env, PGPASSWORD: PASS },
      stdio: 'pipe', maxBuffer: 10 * 1024 * 1024,
    }).toString().trim();
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}
function pgStr(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function norm(s) {
  return String(s||'').replace(/İ/g,'I').replace(/Ğ/g,'G').replace(/Ü/g,'U')
    .replace(/Ş/g,'S').replace(/Ö/g,'O').replace(/Ç/g,'C').toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

function bulkUpdate(pairs, field, transform) {
  // pairs = [{id, val}]
  let total = 0;
  for (let i = 0; i < pairs.length; i += BATCH) {
    const batch = pairs.slice(i, i + BATCH);
    const values = batch.map(p => `(${pgStr(p.id)}, ${transform(p.val)})`).join(',\n  ');
    const sql = `
UPDATE "Product" p
SET ${field} = v.val, "updatedAt" = NOW()
FROM (VALUES
  ${values}
) AS v(id, val)
WHERE p.id = v.id::text;`;
    const n = Math.floor(i / BATCH);
    process.stdout.write(`  batch ${n} (${batch.length} satır)... `);
    try {
      psqlQ(sql);
      console.log('OK');
      total += batch.length;
    } catch(e) {
      console.log('HATA:', e.message.slice(0,120));
    }
  }
  return total;
}

// ─── IMG ─────────────────────────────────────────────────────────────────
const IMG_RULES = [
  { m:['versatil','uclu kalem','tri matic','poly matic','grip matic','grip 0','0.5 mm','0.7 mm'], c:'uclu_kalem' },
  { m:['fineliner','ecobullet','ecopen'], c:'fineliner' },
  { m:['jel kalem','gel kalem'], c:'jel_kalem' },
  { m:['fosforlu','highlighter','swing cool','boss'], c:'fosforlu' },
  { m:['keceli boya','keçeli boya','carioca'], c:'keceli' },
  { m:['tahta kalemi','whiteboard','kuru tahta','marker','permanent'], c:'marker' },
  { m:['tukenmez','tükenmez','triball','cristal'], c:'tukenmez' },
  { m:['kursun kalem','kurşun kalem','goldfaber','9000 ','greengraph'], c:'kursun' },
  { m:['kuru pastel','oil pastel'], c:'kuru_pastel' },
  { m:['pastel boya','pastel'], c:'pastel' },
  { m:['guaj','gouache'], c:'guaj' },
  { m:['parmak boya','finger'], c:'parmak_boya' },
  { m:['yagli boya','yağlı boya','oil paint'], c:'yagli_boya' },
  { m:['sulu boya','suluboya','aquarel'], c:'sulu_boya' },
  { m:['akrilik boya','akrilik'], c:'akrilik' },
  { m:['mum boya','wax','crayola'], c:'mum_boya' },
  { m:['boya firca','firca seti','fırça seti','fırça'], c:'firca' },
  { m:['palet'], c:'palet' },
  { m:['boyama seti','boya seti'], c:'boya_seti' },
  { m:['resim defteri','resim blok','eskiz','sketch'], c:'resim_defteri' },
  { m:['silgi'], c:'silgi' },
  { m:['kalemtras','kalemtraş'], c:'kalemtras' },
  { m:['makas'], c:'makas' },
  { m:['glue stick','stick yapistirici','stick yapıştırıcı','pritt','uhu stick'], c:'stick' },
  { m:['japon yapistirici','yapistirici','tutkal'], c:'tutkal' },
  { m:['koli bant','seffaf bant','maskeleme bant',' bant '], c:'bant' },
  { m:['zimba','zımba'], c:'zimba' },
  { m:['atas','kiskac','ataş'], c:'atas' },
  { m:['spiralli defter','colormaxi','colormax'], c:'spiralli_defter' },
  { m:['not defteri','bloknot'], c:'not_defteri' },
  { m:['cizgili defter','çizgili defter'], c:'cizgili_defter' },
  { m:['kareli defter'], c:'kareli_defter' },
  { m:['butik defter'], c:'butik_defter' },
  { m:['defter','notebook'], c:'defter' },
  { m:['oyun hamuru'], c:'oyun_hamuru' },
  { m:['sticker','etiket'], c:'etiket' },
  { m:['sirt cantasi','okul cantasi','sırt çantası'], c:'canta' },
  { m:['cetvel'], c:'cetvel' },
  { m:['kalem kutusu','kalemlik'], c:'kalemlik' },
  { m:['post-it','post it','yapiskan not'], c:'post_it' },
];
const IMG_BRAND = [
  { b:['faber castell','faber-castell'], c:'kursun' },
  { b:['stabilo'], c:'fosforlu' },
  { b:['rotring'], c:'uclu_kalem' },
  { b:['edding'], c:'marker' },
  { b:['carioca'], c:'keceli' },
  { b:['nova color'], c:'akrilik' },
  { b:['lets'], c:'oyun_hamuru' },
  { b:['gıpta','gipta','keskin color'], c:'defter' },
];
const FALLBACKS = ['kursun','tukenmez','uclu_kalem','keceli','akrilik','sulu_boya','defter','silgi','bant'];

function findImgCat(name) {
  const n = norm(name);
  for (const r of IMG_RULES) for (const m of r.m) if (n.includes(norm(m))) return r.c;
  for (const b of IMG_BRAND) for (const bk of b.b) if (n.includes(norm(bk))) return b.c;
  return null;
}

if (TASK === 'img') {
  console.log('Cloudinary havuzu çekiliyor...');
  const imgRows = psql(`SELECT name, images[1] FROM "Product" WHERE images[1] LIKE 'https://res.cloudinary.com/%' LIMIT 7000`).split('\n').filter(Boolean);
  const imgPool = new Map();
  for (const row of imgRows) {
    const pi = row.indexOf('|'); if (pi<0) continue;
    const rName = row.slice(0,pi), img = row.slice(pi+1);
    if (!img.startsWith('http')) continue;
    const cat = findImgCat(rName); if (!cat) continue;
    if (!imgPool.has(cat)) imgPool.set(cat,[]);
    if (imgPool.get(cat).length < 100) imgPool.get(cat).push(img);
  }
  console.log(`Havuz: ${imgPool.size} kategori`);

  console.log('Tüm ürünler çekiliyor...');
  const prodRows = psql(`SELECT id, name, images[1] FROM "Product" ORDER BY "createdAt" ASC`).split('\n').filter(Boolean);

  const catRR = new Map();
  const pairs = [];
  for (const row of prodRows) {
    const p = row.split('|');
    const id = p[0], name = p[1]||'', curImg = p[2]||'';
    if (!id||!name) continue;
    let cat = findImgCat(name);
    if (!cat||!imgPool.has(cat)) { for (const fb of FALLBACKS) if (imgPool.has(fb)){cat=fb;break;} }
    const pool = imgPool.get(cat); if (!pool?.length) continue;
    const idx = (catRR.get(cat)||0) % pool.length;
    catRR.set(cat, idx+1);
    const newImg = pool[idx];
    if (newImg !== curImg) pairs.push({ id, val: newImg });
  }
  console.log(`${pairs.length} resim güncellenecek`);
  const done = bulkUpdate(pairs, 'images', v => `ARRAY[${pgStr(v)}]`);
  console.log(`Toplam ${done} resim güncellendi`);

} else if (TASK === 'desc') {
  console.log('Barkod içeren ürünler çekiliyor...');
  const rows = psql(`SELECT id, sku, description FROM "Product" WHERE sku ~ '^[0-9]{8,14}$'`).split('\n').filter(Boolean);
  const pairs = [];
  for (const row of rows) {
    const p = row.split('|');
    const id=p[0], sku=p[1]||'', desc=p[2]||'';
    if (!id||!sku) continue;
    if (desc.includes('Barkod:')||desc.includes(sku)) continue;
    const newDesc = desc ? desc.trim()+'\nBarkod: '+sku : 'Barkod: '+sku;
    pairs.push({ id, val: newDesc });
  }
  console.log(`${pairs.length} açıklama güncellenecek`);
  const done = bulkUpdate(pairs, 'description', v => pgStr(v));
  console.log(`Toplam ${done} açıklama güncellendi`);
}
