#!/usr/bin/env node
// SQL üretir, DB'ye yazmaz. stdout'a yazar.
process.emitWarning = () => {};
const fs   = require('fs');
const { execFileSync } = require('child_process');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';
const PLACEHOLDER = 'https://placehold.co/400x400/f1f5f9/94a3b8';
const CHUNK_SIZE = 400;
const OUT_DIR = '/tmp/sql_chunks';

function psql(sql) {
  return execFileSync('psql',[DB,'-t','-A','-F|','-c',sql],{
    env:{...process.env,PGPASSWORD:PASS},stdio:'pipe', maxBuffer: 20*1024*1024
  }).toString().trim();
}

function norm(s) {
  return String(s||'')
    .replace(/İ/g,'I').replace(/Ğ/g,'G').replace(/Ü/g,'U')
    .replace(/Ş/g,'S').replace(/Ö/g,'O').replace(/Ç/g,'C')
    .toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}

function pgStr(s) { return "'"+String(s).replace(/'/g,"''")+"'"; }
function pgArr(a) { return 'ARRAY['+a.map(pgStr).join(',')+']'; }

const RULES = [
  { m:['konulu defter','konullu'], c:'konulu defter' },
  { m:['spiralli','colormaxi'], c:'spiralli defter' },
  { m:['kareli defter'], c:'kareli defter' },
  { m:['cizgili defter','cizgili'], c:'cizgili defter' },
  { m:['cizgisiz defter'], c:'cizgisiz defter' },
  { m:['sert kapak defter','iplik dikis'], c:'sert kapak defter' },
  { m:['not defteri','bloknot','blok not'], c:'not defteri' },
  { m:['planlama defteri','planlayici'], c:'planlama defteri' },
  { m:['ajanda'], c:'ajanda' },
  { m:['resim defteri'], c:'resim defteri' },
  { m:['defter','notebook'], c:'defter' },
  { m:['versatil','uclu kalem','matic','auto 0','grip 0'], c:'uclu kalem' },
  { m:['fosforlu kalem','fosforlu'], c:'fosforlu kalem' },
  { m:['keceli kalem','tahta kalemi','marker'], c:'keceli kalem' },
  { m:['tukenmez kalem','tukenmez','triball'], c:'tukenmez kalem' },
  { m:['kursun kalem','kursun','miss bic','kopya kalem'], c:'kursun kalem' },
  { m:['jel kalem','gel kalem','jell'], c:'jel kalem' },
  { m:['24lu uc','24 lu uc','min uc','kalem uc'], c:'kalem ucu' },
  { m:['kalemlik','kalem cantasi'], c:'kalemlik' },
  { m:['acak'], c:'silgi' },
  { m:['kalem'], c:'kalem' },
  { m:['akrilik boya'], c:'akrilik boya' },
  { m:['pastel boya'], c:'pastel boya' },
  { m:['suluboya','sulu boya'], c:'suluboya' },
  { m:['firca seti','boya firca'], c:'firca' },
  { m:['boya'], c:'boya' },
  { m:['tel zimba','zimba teli','zimba makinesi'], c:'zimba' },
  { m:['zimba'], c:'zimba' },
  { m:['atac'], c:'atac' },
  { m:['raptiye'], c:'raptiye' },
  { m:['pritt','glue stick','glue'], c:'stick yapistirici' },
  { m:['yapistirici'], c:'yapistirici' },
  { m:['sinav silgisi','toz tutmaz','dust free'], c:'silgi' },
  { m:['silgi'], c:'silgi' },
  { m:['maket bicagi','ogrencu makasi','plastik makas'], c:'makas' },
  { m:['makas'], c:'makas' },
  { m:['pergel'], c:'pergel' },
  { m:['iletki','daire sablonu'], c:'iletki' },
  { m:['cetvel'], c:'cetvel' },
  { m:['koli bant','maskeleme bant','kirtasiye bant'], c:'bant' },
  { m:['bant'], c:'bant' },
  { m:['klasor'], c:'klasor' },
  { m:['dosya','cilt'], c:'dosya' },
  { m:['fotokopi kagidi','fotokopi kagit','a4 kagit','a4 kagid'], c:'fotokopi kagidi' },
  { m:['elisi kagid','elisi kagit'], c:'karton' },
  { m:['karton','eva'], c:'karton' },
  { m:['jelatin','seffaf ambalaj'], c:'karton' },
  { m:['kagid','kagit','kraft'], c:'fotokopi kagidi' },
  { m:['oyun hamuru'], c:'oyun hamuru' },
  { m:['puzzle','yapboz','puzlle'], c:'puzzle' },
  { m:['sayi cubugu','mishab','mishap','kumbara'], c:'oyun hamuru' },
  { m:['etiket'], c:'etiket' },
  { m:['matara','suluk'], c:'matara' },
  { m:['canta'], c:'canta' },
  { m:['hesap makinesi'], c:'hesap makinesi' },
  { m:['tebesir'], c:'tebesir' },
  { m:['tahta silgisi'], c:'silgi' },
  { m:['risale','bediuzzaman','nursi','lahika'], c:'kitap dini' },
  { m:['kuran','namaz','dua','cevsen','tesbih'], c:'kitap dini' },
  { m:['roman','hikaye'], c:'kitap roman' },
  { m:['sozluk','imla klavuzu','yazim klavuzu'], c:'kitap sozluk' },
  { m:['kitap','yayinlari','yayincilik'], c:'kitap' },
];

const BRANDS = [
  { b:['faber castell','faber castel'], c:'kalem' },
  { b:['pensan'], c:'tukenmez kalem' },
  { b:['bic'], c:'kursun kalem' },
  { b:['stabilo'], c:'fosforlu kalem' },
  { b:['rotring'], c:'uclu kalem' },
  { b:['scrikss','steelpen','steel pen'], c:'tukenmez kalem' },
  { b:['moso','micra','perfect','mok'], c:'uclu kalem' },
  { b:['aihao'], c:'fosforlu kalem' },
  { b:['edding'], c:'keceli kalem' },
  { b:['cinar'], c:'spiralli defter' },
  { b:['mopak'], c:'defter' },
  { b:['keskin color'], c:'defter' },
  { b:['gipta'], c:'defter' },
  { b:['klas','gazelle','le color'], c:'defter' },
  { b:['nova color'], c:'akrilik boya' },
  { b:['adel'], c:'pastel boya' },
  { b:['fatih'], c:'pastel boya' },
  { b:['brons'], c:'zimba' },
  { b:['mikro','maxx','tenora','uhu'], c:'stick yapistirici' },
  { b:['sid','mimaks','monopol'], c:'zimba' },
  { b:['lets'], c:'oyun hamuru' },
  { b:['ticon'], c:'karton' },
  { b:['bevitton'], c:'canta' },
  { b:['alper'], c:'etiket' },
  { b:['yuciz'], c:'pergel' },
  { b:['maped'], c:'makas' },
  { b:['gencel'], c:'tebesir' },
];

function findCat(name) {
  const n = norm(name);
  for (const r of RULES) {
    for (const t of r.m) {
      if (n.includes(norm(t))) return r.c;
    }
  }
  for (const bm of BRANDS) {
    for (const b of bm.b) {
      if (n.includes(norm(b))) return bm.c;
    }
  }
  return null;
}

console.error('Gerçek resimler sorgulanıyor...');
const realRows = psql(
  `SELECT name, images[1] FROM "Product" WHERE images[1] LIKE 'https://res.cloudinary.com/%' LIMIT 6000`
).split('\n').filter(Boolean);

const catPool = new Map();
for (const row of realRows) {
  const pipeIdx = row.indexOf('|');
  const rName = row.slice(0, pipeIdx);
  const img = row.slice(pipeIdx + 1);
  if (!rName || !img || !img.startsWith('http')) continue;
  const cat = findCat(rName);
  if (!cat) continue;
  if (!catPool.has(cat)) catPool.set(cat, []);
  if (catPool.get(cat).length < 50) catPool.get(cat).push(img);
}
console.error(`Havuz: ${catPool.size} kategori`);

console.error('Placeholder ürünler sorgulanıyor...');
const pRows = psql(
  `SELECT id, name FROM "Product" WHERE images[1]=${pgStr(PLACEHOLDER)} ORDER BY "createdAt" ASC`
).split('\n').filter(Boolean);

const products = pRows.map(r => {
  const i = r.indexOf('|');
  return { id: r.slice(0, i), name: r.slice(i+1) };
}).filter(p => p.id && p.name);

console.error(`Toplam: ${products.length} ürün`);

const FALLBACKS = ['kalem','defter','boya','silgi','zimba','dosya','bant','karton','oyun hamuru','stick yapistirici'];
const catRR = new Map();
const lines = [];

for (const prod of products) {
  let cat = findCat(prod.name);
  if (!cat || !catPool.has(cat)) {
    for (const fb of FALLBACKS) {
      if (catPool.has(fb)) { cat = fb; break; }
    }
  }
  const pool = catPool.get(cat);
  if (!pool || !pool.length) continue;
  const idx = (catRR.get(cat)||0) % pool.length;
  catRR.set(cat, idx+1);
  lines.push(`UPDATE "Product" SET images=${pgArr([pool[idx]])}, "updatedAt"=NOW() WHERE id=${pgStr(prod.id)};`);
}

console.error(`SQL satırı: ${lines.length}`);

// Chunk'lara böl ve dosyalara yaz
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
let chunkIdx = 0;
for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
  const chunk = lines.slice(i, i + CHUNK_SIZE);
  const sql = 'BEGIN;\n' + chunk.join('\n') + '\nCOMMIT;\n';
  fs.writeFileSync(`${OUT_DIR}/chunk_${String(chunkIdx).padStart(3,'0')}.sql`, sql);
  chunkIdx++;
}
console.error(`${chunkIdx} chunk dosyası oluşturuldu: ${OUT_DIR}/`);
