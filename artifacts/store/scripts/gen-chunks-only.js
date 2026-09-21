#!/usr/bin/env node
// Sadece chunk dosyaları yazar — DB'ye dokunmaz
process.emitWarning = () => {};
const { execFileSync } = require('child_process');
const fs = require('fs');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';
const TASK = process.argv[2]; // 'img' veya 'desc'

function psql(sql) {
  return execFileSync('psql', [DB, '-t', '-A', '-F|', '-c', sql], {
    env: { ...process.env, PGPASSWORD: PASS },
    stdio: 'pipe', maxBuffer: 50 * 1024 * 1024,
  }).toString().trim();
}
function pgStr(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function pgArr(a) { return 'ARRAY[' + a.map(pgStr).join(',') + ']'; }
function norm(s) {
  return String(s||'').replace(/İ/g,'I').replace(/Ğ/g,'G').replace(/Ü/g,'U')
    .replace(/Ş/g,'S').replace(/Ö/g,'O').replace(/Ç/g,'C').toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

const IMG_RULES = [
  { m:['versatil','uclu kalem','tri matic','poly matic','grip matic','grip 0','auto 0','0.5 mm','0.7 mm'], c:'uclu_kalem' },
  { m:['fineliner','ecobullet','ecopen'], c:'fineliner' },
  { m:['jel kalem','gel kalem'], c:'jel_kalem' },
  { m:['fosforlu','highlighter','swing cool','boss'], c:'fosforlu' },
  { m:['keceli boya','keçeli boya','carioca','keceli'], c:'keceli' },
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
  { m:['boya fircasi','firca seti','fırça seti','fırça'], c:'firca' },
  { m:['palet'], c:'palet' },
  { m:['boyama seti','boya seti'], c:'boya_seti' },
  { m:['resim defteri','resim blok','eskiz','sketch'], c:'resim_defteri' },
  { m:['silgi'], c:'silgi' },
  { m:['kalemtras','kalemtraş'], c:'kalemtras' },
  { m:['makas'], c:'makas' },
  { m:['glue stick','stick yapistirici','pritt','uhu stick'], c:'stick' },
  { m:['japon yapistirici','yapistirici','tutkal'], c:'tutkal' },
  { m:['koli bant','seffaf bant','maskeleme bant',' bant'], c:'bant' },
  { m:['zimba'], c:'zimba' },
  { m:['atas','kiskac'], c:'atas' },
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
function findImgCat(name) {
  const n = norm(name);
  for (const r of IMG_RULES) for (const m of r.m) if (n.includes(norm(m))) return r.c;
  for (const b of IMG_BRAND) for (const bk of b.b) if (n.includes(norm(bk))) return b.c;
  return null;
}

const OUT = '/tmp/fix_chunks';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

if (TASK === 'img') {
  console.log('Resim havuzu yükleniyor...');
  const imgRows = psql(`SELECT name, images[1] FROM "Product" WHERE images[1] LIKE 'https://res.cloudinary.com/%' LIMIT 7000`).split('\n').filter(Boolean);
  const imgPool = new Map();
  for (const row of imgRows) {
    const pi = row.indexOf('|'); if (pi < 0) continue;
    const rName = row.slice(0,pi), img = row.slice(pi+1);
    if (!img.startsWith('http')) continue;
    const cat = findImgCat(rName); if (!cat) continue;
    if (!imgPool.has(cat)) imgPool.set(cat, []);
    if (imgPool.get(cat).length < 100) imgPool.get(cat).push(img);
  }
  console.log(`Havuz: ${imgPool.size} kategori`);

  console.log('Tüm ürünler çekiliyor...');
  const prodRows = psql(`SELECT id, name, images[1] FROM "Product" ORDER BY "createdAt" ASC`).split('\n').filter(Boolean);
  const FALLBACKS = ['kursun','tukenmez','fosforlu','uclu_kalem','keceli','akrilik','sulu_boya','silgi','defter','bant'];
  const catRR = new Map();
  const lines = [];
  for (const row of prodRows) {
    const p = row.split('|');
    const id = p[0], name = p[1]||'', curImg = p[2]||'';
    if (!id || !name) continue;
    let cat = findImgCat(name);
    if (!cat || !imgPool.has(cat)) { for (const fb of FALLBACKS) if (imgPool.has(fb)) { cat=fb; break; } }
    const pool = imgPool.get(cat); if (!pool?.length) continue;
    const idx = (catRR.get(cat)||0) % pool.length;
    catRR.set(cat, idx+1);
    const newImg = pool[idx];
    if (newImg !== curImg)
      lines.push(`UPDATE "Product" SET images=${pgArr([newImg])},"updatedAt"=NOW() WHERE id=${pgStr(id)};`);
  }
  console.log(`${lines.length} resim güncellenecek`);
  let ci=0;
  for (let i=0;i<lines.length;i+=500) {
    fs.writeFileSync(`${OUT}/img_${String(ci).padStart(3,'0')}.sql`, 'BEGIN;\n'+lines.slice(i,i+500).join('\n')+'\nCOMMIT;\n');
    ci++;
  }
  console.log(`${ci} img chunk yazıldı`);

} else if (TASK === 'desc') {
  console.log('Ürünler çekiliyor...');
  const rows = psql(`SELECT id, sku, description FROM "Product" WHERE sku ~ '^[0-9]{8,14}$' ORDER BY "createdAt" ASC`).split('\n').filter(Boolean);
  const lines = [];
  for (const row of rows) {
    const p = row.split('|');
    const id=p[0], sku=p[1]||'', desc=p[2]||'';
    if (!id||!sku) continue;
    if (desc.includes('Barkod:') || desc.includes(sku)) continue;
    const newDesc = desc ? desc.trim()+'\nBarkod: '+sku : 'Barkod: '+sku;
    lines.push(`UPDATE "Product" SET description=${pgStr(newDesc)},"updatedAt"=NOW() WHERE id=${pgStr(id)};`);
  }
  console.log(`${lines.length} açıklama güncellenecek`);
  let ci=0;
  for (let i=0;i<lines.length;i+=500) {
    fs.writeFileSync(`${OUT}/desc_${String(ci).padStart(3,'0')}.sql`, 'BEGIN;\n'+lines.slice(i,i+500).join('\n')+'\nCOMMIT;\n');
    ci++;
  }
  console.log(`${ci} desc chunk yazıldı`);
}
