#!/usr/bin/env node
// Sadece kategori güncellemesi - tek büyük SQL CASE
process.emitWarning = () => {};
const { execFileSync } = require('child_process');
const fs = require('fs');

const DB   = 'postgresql://neondb_owner@ep-wispy-wildflower-alt9psfm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const PASS = 'npg_QDG0cV8pRgFS';

function psqlFile(path) {
  return execFileSync('psql', [DB, '-f', path], {
    env: { ...process.env, PGPASSWORD: PASS },
    stdio: 'pipe', maxBuffer: 10 * 1024 * 1024,
  }).toString().trim();
}

// Tek SQL sorgusu - tüm kategoriler için
const sql = `
BEGIN;
UPDATE "Product" SET "categoryId" = CASE
  WHEN name ILIKE '%versatil%' OR name ILIKE '%uçlu kalem%' OR name ILIKE '%ucluk%'
    OR name ILIKE '% 0.3 mm%' OR name ILIKE '% 0.5 mm%' OR name ILIKE '% 0.7 mm%' OR name ILIKE '% 0.9 mm%'
    OR name ILIKE '%grip matic%' OR name ILIKE '%tri matic%' OR name ILIKE '%poly matic%'
    OR name ILIKE '%rx5%' OR name ILIKE '%rx7%'
    THEN 'cat_versatil_uclu_kalemler'
  WHEN name ILIKE '%fineliner%' OR name ILIKE '%fine liner%' OR name ILIKE '%ecobullet%'
    THEN 'cat_fineliner_kalemler'
  WHEN name ILIKE '%jel kalem%' OR name ILIKE '%gel kalem%'
    THEN 'cat_jel_kalemler'
  WHEN name ILIKE '%fosforlu%' OR name ILIKE '%highlighter%'
    THEN 'cat_fosforlu_kalemler'
  WHEN name ILIKE '%keçeli boya%' OR name ILIKE '%keceli boya%' OR name ILIKE '%jumbo keçeli%'
    THEN 'cat_keceli_boya_kalemler'
  WHEN name ILIKE '%tahta kalemi%' OR name ILIKE '%white board%' OR name ILIKE '%whiteboard%'
    OR name ILIKE '%kuru tahta%' OR name ILIKE '%cd marker%' OR name ILIKE '%permanent marker%'
    THEN 'cat_markor_kalemler'
  WHEN name ILIKE '%tükenmez kalem%' OR name ILIKE '%tukenmez kalem%'
    OR name ILIKE '%triball%' OR name ILIKE '%cristal bic%'
    THEN 'cat_tukenmez_kalemler'
  WHEN name ILIKE '%kurşun kalem%' OR name ILIKE '%kursun kalem%'
    OR (name ILIKE '%goldfaber%')
    OR (name ILIKE '%9000%' AND name ILIKE '%kalem%')
    OR name ILIKE '%greengraph%' OR name ILIKE '%blackpeps%'
    OR name ILIKE '%graphite%'
    THEN 'cat_kursun-kalemler'
  WHEN name ILIKE '%dereceli çizim%' OR name ILIKE '%teknik çizim%'
    OR name ILIKE '%rapidograph%' OR name ILIKE '%isograph%'
    OR name ILIKE '%mars lumograph%'
    THEN 'cat_dereceli_cizim_kalemleri'
  WHEN name ILIKE '%kalemtraş%' OR name ILIKE '%kalemtras%' OR name ILIKE '%sharpener%'
    THEN 'cat_kalemtraslar'
  WHEN name ILIKE '%kalem kutusu%' OR name ILIKE '%kalem cantası%' OR name ILIKE '%kalemlik%'
    OR name ILIKE '%kalem kutu%'
    THEN 'cat_kalem-kutulari'
  WHEN name ILIKE '%mum boya%' OR name ILIKE '%wax crayon%' OR name ILIKE '%crayola%'
    THEN 'cat_mum_boyalar'
  WHEN name ILIKE '%kuru pastel%' OR name ILIKE '%oil pastel%' OR name ILIKE '%pastel kalem%'
    THEN 'cat_kuru_boyalar'
  WHEN name ILIKE '%pastel boya%' OR name ILIKE '%pastel%'
    THEN 'cat_pastel_boyalar'
  WHEN name ILIKE '%guaj%' OR name ILIKE '%gouache%'
    THEN 'cat_guaj_boyalar'
  WHEN name ILIKE '%parmak boya%' OR name ILIKE '%finger paint%'
    THEN 'cat_parmak_boyasi'
  WHEN name ILIKE '%yağlı boya%' OR name ILIKE '%yagli boya%' OR name ILIKE '%oil paint%'
    THEN 'cmpbs60y7000x68chdj6xezd5'
  WHEN name ILIKE '%suluboya%' OR name ILIKE '%sulu boya%' OR name ILIKE '%watercolor%' OR name ILIKE '%aquarel%'
    THEN 'cat_sulu_boyalar'
  WHEN name ILIKE '%akrilik boya%' OR name ILIKE '%akrilik%' OR name ILIKE '%acrylic%'
    THEN 'cmpbs613d001168ch6zgl20a8'
  WHEN name ILIKE '%boya fırçası%' OR name ILIKE '%boya fircasi%' OR name ILIKE '%fırça seti%' OR name ILIKE '%firca seti%'
    THEN 'cat_firca'
  WHEN name ILIKE '%palet%'
    THEN 'cat_palet'
  WHEN name ILIKE '%boyama seti%' OR name ILIKE '%boya seti%' OR name ILIKE '%art set%'
    THEN 'cat_boyama_setleri'
  WHEN name ILIKE '%resim defteri%' OR name ILIKE '%resim blok%' OR name ILIKE '%eskiz defter%'
    OR name ILIKE '%sketch defter%' OR name ILIKE '%gramajlı%'
    THEN 'cat_resim-defteri-ve-bloklari'
  WHEN name ILIKE '%silgi%'
    THEN 'cat_silgiler'
  WHEN name ILIKE '%makas%'
    THEN 'cmpbs61o3001h68chgrwrv0eq'
  WHEN name ILIKE '%glue stick%' OR name ILIKE '%stick yapıştırıcı%' OR name ILIKE '%stick yapistirici%'
    OR (name ILIKE '%pritt%' AND name ILIKE '%stick%') OR name ILIKE '%uhu stick%'
    THEN 'cat_stick_yapistirici'
  WHEN name ILIKE '%japon yapıştırıcı%' OR name ILIKE '%japon yapistirici%' OR name ILIKE '%tutkal%'
    OR name ILIKE '%sıvı yapıştırıcı%'
    THEN 'cat_tutkallar'
  WHEN name ILIKE '%koli bant%' OR name ILIKE '%şeffaf bant%' OR name ILIKE '%maskeleme bant%'
    OR (name ILIKE '%bant%' AND name NOT ILIKE '%laptop%' AND name NOT ILIKE '%bantlama makin%')
    THEN 'cat_bantlar'
  WHEN name ILIKE '%zımba teli%' OR name ILIKE '%zimba teli%' OR name ILIKE '%zımba makinesi%'
    OR name ILIKE '%zimba makinesi%' OR name ILIKE '%tel sökücü%' OR name ILIKE '%zımba%' OR name ILIKE '%zimba%'
    THEN 'cat_zimbalar'
  WHEN name ILIKE '%kıskaç%' OR name ILIKE '%kiskac%' OR name ILIKE '%ataş%' OR name ILIKE '%atas%'
    THEN 'cat_kiskac_ve_atas'
  WHEN name ILIKE '%cetvel%'
    THEN 'cat_cetvel'
  WHEN name ILIKE '%post-it%' OR name ILIKE '%post it%' OR name ILIKE '%yapışkan not%' OR name ILIKE '%yapiskan not%'
    THEN 'cat_not_kagitlari_post_it'
  WHEN name ILIKE '%planlayıcı%' OR name ILIKE '%planlayici%' OR name ILIKE '%bullet journal%'
    THEN 'cat_planlayicilar'
  WHEN name ILIKE '%ajanda%'
    THEN 'cat_diger-ajandalar'
  WHEN name ILIKE '%spiralli defter%' OR name ILIKE '%colormaxi%' OR name ILIKE '%colormax%'
    OR name ILIKE '%butik defter%'
    THEN 'cat_butik_defterler'
  WHEN name ILIKE '%çizgili defter%' OR name ILIKE '%cizgili defter%'
    THEN 'cat_cizgili_defter'
  WHEN name ILIKE '%kareli defter%'
    THEN 'cat_kareli_defter'
  WHEN name ILIKE '%çizgisiz defter%' OR name ILIKE '%cizgisiz defter%' OR name ILIKE '%noktalı defter%'
    THEN 'cat_cizgisiz_defter'
  WHEN name ILIKE '%not defteri%' OR name ILIKE '%bloknot%' OR name ILIKE '%blok not%'
    THEN 'cat_not_defterleri_ve_bloknot'
  WHEN (name ILIKE '%defter%' OR name ILIKE '%notebook%')
    AND name NOT ILIKE '%resim defter%'
    THEN 'cat_defterler'
  WHEN name ILIKE '%oyun hamuru%' OR name ILIKE '%play doh%' OR name ILIKE '%playdoh%'
    THEN 'cat_oyun_hamuru'
  WHEN name ILIKE '%kil%' OR name ILIKE '%proje hamuru%'
    THEN 'cat_kil_ve_proje_hamurla'
  WHEN name ILIKE '%anaokulu%' OR name ILIKE '%kesme yapıştırma%'
    THEN 'cat_anaokulu_etkinlik_malzeme'
  WHEN name ILIKE '%sticker%' OR name ILIKE '%etiket%'
    THEN 'cat_sticker-ve-etiket'
  WHEN name ILIKE '%sırt çantası%' OR name ILIKE '%sirt cantasi%' OR name ILIKE '%okul çantası%'
    THEN 'cat_sirt-cantasi'
  WHEN name ILIKE '%kırtasiye seti%' OR name ILIKE '%okul seti%'
    THEN 'cat_kirtasiye_setleri'
  WHEN name ILIKE '%fon kartonu%' OR name ILIKE '%renkli karton%' OR name ILIKE '%eva%'
    THEN 'cat_kagit_ve_kartonlar'
  ELSE "categoryId"  -- değiştirme
END,
"updatedAt" = CASE
  WHEN name ILIKE '%versatil%' OR name ILIKE '%uçlu kalem%' OR name ILIKE '%fineliner%'
    OR name ILIKE '%jel kalem%' OR name ILIKE '%fosforlu%' OR name ILIKE '%keçeli boya%'
    OR name ILIKE '%tahta kalemi%' OR name ILIKE '%tükenmez kalem%' OR name ILIKE '%tukenmez kalem%'
    OR name ILIKE '%kurşun kalem%' OR name ILIKE '%kursun kalem%' OR name ILIKE '%goldfaber%'
    OR name ILIKE '%pastel%' OR name ILIKE '%guaj%' OR name ILIKE '%akrilik%' OR name ILIKE '%sulu boya%'
    OR name ILIKE '%suluboya%' OR name ILIKE '%yağlı boya%' OR name ILIKE '%mum boya%'
    OR name ILIKE '%kalemtraş%' OR name ILIKE '%silgi%' OR name ILIKE '%makas%'
    OR name ILIKE '%stick yapıştırıcı%' OR name ILIKE '%tutkal%' OR name ILIKE '%bant%'
    OR name ILIKE '%zımba%' OR name ILIKE '%zimba%' OR name ILIKE '%defter%' OR name ILIKE '%notebook%'
    OR name ILIKE '%oyun hamuru%' OR name ILIKE '%sticker%' OR name ILIKE '%etiket%'
    OR name ILIKE '%planlayıcı%' OR name ILIKE '%ajanda%' OR name ILIKE '%boyama seti%'
    OR name ILIKE '%fırça%' OR name ILIKE '%palet%' OR name ILIKE '%kırtasiye seti%'
    THEN NOW()
  ELSE "updatedAt"
END
WHERE "categoryId" = 'cmpbs5zid000268chaax9lq9n';
COMMIT;
`;

const path = '/tmp/fix_cats_direct.sql';
fs.writeFileSync(path, sql);
console.log('SQL dosyası yazıldı, çalıştırılıyor...');
const result = psqlFile(path);
console.log(result);
console.log('Bitti!');
