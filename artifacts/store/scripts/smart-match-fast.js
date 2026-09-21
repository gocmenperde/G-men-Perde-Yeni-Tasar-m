#!/usr/bin/env node
/**
 * Akıllı Resim Eşleştirme - Hızlı Versiyon
 * Tüm SQL'i belleğe alır, tek psql bağlantısıyla çalıştırır.
 */
process.emitWarning = () => {};
const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';
const PLACEHOLDER = 'https://placehold.co/400x400/f1f5f9/94a3b8';
const SQL_OUT = path.join(__dirname, '_all_updates.sql');

const args   = process.argv.slice(2);
const DRY    = args.includes('--dry-run');

function log(m) { const l=`[${new Date().toISOString()}] ${m}`; console.log(l); }

function psql(sql) {
  return execFileSync('psql',[DB,'-t','-A','-F|','-c',sql],{
    env:{...process.env,PGPASSWORD:PASS},stdio:'pipe'
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

function pgStr(s){ return "'"+String(s).replace(/'/g,"''")+"'"; }
function pgArr(a){ return 'ARRAY['+a.map(pgStr).join(',')+']'; }

// ─── Kurallar ─────────────────────────────────────────────────────────────────
const RULES = [
  { m:['konulu defter','konullu'], c:'konulu defter', p:100 },
  { m:['spiralli','colormaxi'], c:'spiralli defter', p:100 },
  { m:['kareli defter'], c:'kareli defter', p:100 },
  { m:['cizgili defter','cizgili'], c:'cizgili defter', p:95 },
  { m:['cizgisiz defter'], c:'cizgisiz defter', p:95 },
  { m:['sert kapak defter','iplik dikis'], c:'sert kapak defter', p:95 },
  { m:['not defteri','bloknot','blok not'], c:'not defteri', p:90 },
  { m:['planlama defteri','planlayici'], c:'planlama defteri', p:90 },
  { m:['ajanda'], c:'ajanda', p:90 },
  { m:['resim defteri'], c:'resim defteri', p:90 },
  { m:['defter','notebook'], c:'defter', p:70 },
  { m:['versatil','uclu kalem','uçlu','matic','auto 0','grip 0','grip05'], c:'uclu kalem', p:100 },
  { m:['fosforlu kalem','fosforlu'], c:'fosforlu kalem', p:100 },
  { m:['keceli kalem','keçeli','tahta kalemi','marker'], c:'keceli kalem', p:100 },
  { m:['tukenmez kalem','tukenmez','triball'], c:'tukenmez kalem', p:100 },
  { m:['kursun kalem','kursun','hb kalem','miss bic','kopya kalem'], c:'kursun kalem', p:100 },
  { m:['jel kalem','gel kalem','jell'], c:'jel kalem', p:100 },
  { m:['kalem ucu','kalem uc','uc tup','24lu uc','24 lu uc','min uc'], c:'kalem ucu', p:95 },
  { m:['kalemlik','kalem cantasi','kalem çantası'], c:'kalemlik', p:90 },
  { m:['acak','açacak'], c:'kalem trasas', p:80 },
  { m:['kalem'], c:'kalem', p:60 },
  { m:['akrilik boya'], c:'akrilik boya', p:100 },
  { m:['pastel boya'], c:'pastel boya', p:100 },
  { m:['suluboya','sulu boya','sulu'], c:'suluboya', p:100 },
  { m:['guaj boya'], c:'guaj boya', p:100 },
  { m:['firca seti','boya firca','fırça'], c:'firca', p:90 },
  { m:['boya'], c:'boya', p:60 },
  { m:['tel zimba','zimba teli','zimba makinesi'], c:'zimba', p:100 },
  { m:['zimba'], c:'zimba', p:80 },
  { m:['plastik atac','metal atac','ataç','atac'], c:'atac', p:90 },
  { m:['raptiye'], c:'raptiye', p:90 },
  { m:['pritt','glue stick','glue','yapistirici stik'], c:'stick yapistirici', p:100 },
  { m:['sivi yapistirici','japon yapistirici'], c:'yapistirici', p:90 },
  { m:['yapistirici','yapıştırıcı'], c:'yapistirici', p:70 },
  { m:['sinav silgisi','toz tutmaz','dust free'], c:'silgi', p:100 },
  { m:['silgi'], c:'silgi', p:80 },
  { m:['ogrencu makasi','plastik makas','maket bicagi'], c:'makas', p:100 },
  { m:['makas'], c:'makas', p:80 },
  { m:['pergel'], c:'pergel', p:100 },
  { m:['iletki'], c:'iletki', p:100 },
  { m:['daire sablonu'], c:'iletki', p:90 },
  { m:['cetvel'], c:'cetvel', p:80 },
  { m:['koli bant','maskeleme bant','selophan bant','kirtasiye bant'], c:'bant', p:100 },
  { m:['bant'], c:'bant', p:60 },
  { m:['klasor','klasör','telli dosya'], c:'klasor', p:100 },
  { m:['dosya','cilt'], c:'dosya', p:70 },
  { m:['fotokopi kagidi','fotokopi kagit','a4 kagit','a4 kagid'], c:'fotokopi kagidi', p:100 },
  { m:['elisi kagid','elisi kagit'], c:'karton', p:100 },
  { m:['renkli kagit','renkli karton'], c:'karton', p:95 },
  { m:['karton','eva'], c:'karton', p:80 },
  { m:['jelatin','seffaf ambalaj','ambalaj'], c:'karton', p:80 },
  { m:['kraft','kagid','kagit'], c:'fotokopi kagidi', p:50 },
  { m:['oyun hamuru'], c:'oyun hamuru', p:100 },
  { m:['puzzle','yapboz','puzlle'], c:'puzzle', p:100 },
  { m:['boyama kitabi','boyama kitap'], c:'boya', p:90 },
  { m:['sayi cubugu','sayi fasulye','mishab','mishap','kumbara'], c:'oyun hamuru', p:80 },
  { m:['etiket'], c:'etiket', p:90 },
  { m:['matara','suluk'], c:'matara', p:90 },
  { m:['canta','çanta'], c:'canta', p:90 },
  { m:['hesap makinesi'], c:'hesap makinesi', p:100 },
  { m:['tebesir','tebeşir'], c:'tebesir', p:100 },
  { m:['tahta silgisi'], c:'silgi', p:90 },
  { m:['lastik','misine','rulo'], c:'atac', p:60 },
  { m:['risale','bediuzzaman','gulen','nursi','lahika','imanin','lem alar','mektubat'], c:'kitap dini', p:90 },
  { m:['kuran','namaz','dua','oruc','cevsen','tesbih','peygamber','salavatlar'], c:'kitap dini', p:90 },
  { m:['roman','hikaye','ani','biyografi','macera'], c:'kitap roman', p:80 },
  { m:['sozluk','sözlük','imla klavuzu','yazim klavuzu','lugat'], c:'kitap sozluk', p:80 },
  { m:['atlas','harita'], c:'kitap atlas', p:80 },
  { m:['kitap','yayinlari','yayincilik','nesriyat'], c:'kitap', p:50 },
];

const BRANDS = [
  { b:['faber castell','faber-castell','faber castel'], c:['kalem','silgi','boya'] },
  { b:['pensan'], c:['tukenmez kalem','kursun kalem'] },
  { b:['bic','miss bic'], c:['kursun kalem','tukenmez kalem'] },
  { b:['stabilo'], c:['fosforlu kalem','keceli kalem'] },
  { b:['pilot'], c:['tukenmez kalem'] },
  { b:['rotring'], c:['uclu kalem'] },
  { b:['scrikss','steelpen','steel pen','zebra','zebr'], c:['tukenmez kalem'] },
  { b:['moso','micra','perfect','mok','mod'], c:['uclu kalem'] },
  { b:['aihao'], c:['fosforlu kalem'] },
  { b:['edding'], c:['keceli kalem'] },
  { b:['cinar','çinar'], c:['spiralli defter','kareli defter'] },
  { b:['mopak'], c:['defter','fotokopi kagidi'] },
  { b:['keskin color'], c:['defter','etiket'] },
  { b:['gipta','gıpta'], c:['defter'] },
  { b:['klas','gazelle','le color'], c:['defter'] },
  { b:['nova color'], c:['akrilik boya'] },
  { b:['adel'], c:['pastel boya'] },
  { b:['fatih'], c:['pastel boya'] },
  { b:['brons'], c:['firca','atac','zimba'] },
  { b:['mikro','maxx','tenora','uhu'], c:['stick yapistirici'] },
  { b:['sid','mas rapid','mimaks','monopol'], c:['zimba'] },
  { b:['lets',"let's"], c:['oyun hamuru'] },
  { b:['ticon','tıcon'], c:['karton'] },
  { b:['bevitton'], c:['canta'] },
  { b:['alper'], c:['etiket'] },
  { b:['yuciz','yuçiz'], c:['pergel'] },
  { b:['maped'], c:['makas','silgi'] },
  { b:['hatas'], c:['iletki'] },
  { b:['gencel'], c:['tebesir'] },
  { b:['ark'], c:['kalem'] },
];

const SORTED_RULES = [...RULES].sort((a,b) => b.p - a.p);

function findCat(name) {
  const n = norm(name);
  for (const rule of SORTED_RULES) {
    for (const t of rule.m) {
      if (n.includes(norm(t))) return rule.c;
    }
  }
  for (const bm of BRANDS) {
    for (const brand of bm.b) {
      if (n.includes(norm(brand))) return bm.c[0];
    }
  }
  return null;
}

async function main() {
  log('='.repeat(60));
  log('Akıllı Resim Eşleştirme (Hızlı)' + (DRY?' [DRY-RUN]':''));

  // DB'den gerçek resimli ürünleri çek
  log('Gerçek resim havuzu oluşturuluyor...');
  const realRows = psql(
    `SELECT name, images[1] FROM "Product" WHERE images[1] LIKE 'https://res.cloudinary.com/%' LIMIT 6000`
  ).split('\n').filter(Boolean);

  const catPool = new Map();
  for (const row of realRows) {
    const [rName, img] = row.split('|');
    if (!rName || !img) continue;
    const cat = findCat(rName);
    if (!cat) continue;
    if (!catPool.has(cat)) catPool.set(cat, []);
    if (catPool.get(cat).length < 50) catPool.get(cat).push(img);
  }
  log(`Havuz: ${catPool.size} kategori`);

  // Placeholder ürünler
  log('Placeholder ürünler sorgulanıyor...');
  const pRows = psql(
    `SELECT id, name FROM "Product" WHERE images[1]=${pgStr(PLACEHOLDER)} ORDER BY "createdAt" ASC`
  ).split('\n').filter(Boolean);

  const products = pRows.map(r => {
    const i = r.indexOf('|');
    return { id: r.slice(0,i), name: r.slice(i+1) };
  }).filter(p => p.id && p.name);

  log(`Placeholder sayısı: ${products.length}`);

  const catRR = new Map();
  const sqlLines = ['BEGIN;'];
  let matched = 0, noMatch = 0;
  const noMatchSample = [];

  for (const prod of products) {
    let cat = findCat(prod.name);

    // Fallback: genel kırtasiye
    if (!cat || !catPool.has(cat)) {
      const fallbacks = ['kalem','defter','boya','silgi','zimba','dosya','bant','karton','oyun hamuru','stick yapistirici'];
      for (const fb of fallbacks) {
        if (catPool.has(fb)) { cat = fb; break; }
      }
    }

    const pool = catPool.get(cat);
    if (!pool || !pool.length) {
      noMatch++;
      if (noMatchSample.length < 10) noMatchSample.push(prod.name);
      continue;
    }

    const idx = (catRR.get(cat)||0) % pool.length;
    catRR.set(cat, idx+1);
    sqlLines.push(`UPDATE "Product" SET images=${pgArr([pool[idx]])}, "updatedAt"=NOW() WHERE id=${pgStr(prod.id)};`);
    matched++;
  }

  sqlLines.push('COMMIT;');

  log(`Eşleşen: ${matched} | Eşleşmeyen: ${noMatch}`);
  if (noMatchSample.length) log('Eşleşmeyen örnekler: '+noMatchSample.join(', '));

  if (!DRY) {
    log(`SQL dosyası yazılıyor... (${sqlLines.length} satır)`);
    fs.writeFileSync(SQL_OUT, sqlLines.join('\n')+'\n');
    log('DB güncelleniyor (tek bağlantı)...');
    try {
      execFileSync('psql',[DB,'-f',SQL_OUT],{
        env:{...process.env,PGPASSWORD:PASS},
        stdio:'pipe',
        timeout: 120000
      });
      log('✓ Tüm güncellemeler tamamlandı!');
    } catch(e) {
      log('HATA: '+(e.stderr?.toString()||e.message).slice(0,300));
    }
  } else {
    log(`[DRY-RUN] ${matched} güncelleme yazılacaktı`);
  }

  log('='.repeat(60));
  log(`SONUÇ: ${matched}/${products.length} ürüne resim eklendi (%${((matched/products.length)*100).toFixed(1)})`);
}

main().catch(e => { log('FATAL: '+e.message); process.exit(1); });
