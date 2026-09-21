-- =====================================================
-- BKM Kitap Kırtasiye Ürün Seed Scripti
-- 26 ürün, 12 marka, 28 kategori
-- =====================================================

-- MARKALAR
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_pritt', 'Pritt', 'pritt', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_nova_color', 'Nova Color', 'nova-color', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_adel', 'Adel', 'adel', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_alex_schoeller', 'Alex Schoeller', 'alex-schoeller', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_carioca', 'Carioca', 'carioca', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_lets', 'Lets', 'lets', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_faber_castell', 'Faber-Castell', 'faber-castell', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_noki', 'Noki', 'noki', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_keskin_color', 'Keskin Color', 'keskin-color', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_play_doh', 'Play-Doh', 'play-doh', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_hatas', 'Hatas', 'hatas', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt")
VALUES ('brand_kenko', 'Kenko', 'kenko', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- KATEGORİLER
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_kirtasiye', 'Kırtasiye', 'kirtasiye', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_boyalar_ve_boya_urun', 'Boyalar ve Boya Ürünleri', 'boyalar-ve-boya-urunleri', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_sulu_boyalar', 'Sulu Boyalar', 'sulu-boyalar', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_sanatsal_malzemeler', 'Sanatsal Malzemeler', 'sanatsal-malzemeler', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_kil_ve_proje_hamurla', 'Kil ve Proje Hamurları', 'kil-ve-proje-hamurlari', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_pastel_boyalar', 'Pastel Boyalar', 'pastel-boyalar', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_kagit_urunleri', 'Kağıt  Ürünleri', 'kagit-urunleri', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_kagit_ve_kartonlar', 'Kağıt ve Kartonlar', 'kagit-ve-kartonlar', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_renkli_a4_kagitlari', 'Renkli A4 Kağıtları', 'renkli-a4-kagitlari', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_keceli_boya_kalemler', 'Keçeli Boya Kalemleri', 'keceli-boya-kalemleri', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_yapistirici_ve_bantl', 'Yapıştırıcı ve Bantlar', 'yapistirici-ve-bantlar', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_stick_yapistirici', 'Stick Yapıştırıcı', 'stick-yapistirici', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_parmak_boyasi', 'Parmak Boyası', 'parmak-boyasi', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_dosya_ve_klasorler', 'Dosya ve Klasörler', 'dosya-ve-klasorler', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_cit_citli_dosyalar', 'Çıt Çıtlı Dosyalar', 'cit-citli-dosyalar', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_defterler', 'Defterler', 'defterler', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_kareli_defter', 'Kareli Defter', 'kareli-defter', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_kalemler_ve_yazi_ger', 'Kalemler ve Yazı Gereçleri', 'kalemler-ve-yazi-gerecleri', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_tukenmez_kalemler', 'Tükenmez Kalemler', 'tukenmez-kalemler', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_tukenmez_kalem', 'Tükenmez Kalem', 'tukenmez-kalem', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_silgiler', 'Silgiler', 'silgiler', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_cizgili_defter', 'Çizgili Defter', 'cizgili-defter', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_tahta_kalemleri_ve_g', 'Tahta Kalemleri ve Gereçleri', 'tahta-kalemleri-ve-gerecleri', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_poset_dosya', 'Poşet Dosya', 'poset-dosya', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_oyun_hamuru', 'Oyun Hamuru', 'oyun-hamuru', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_okul_kirtasiyesi', 'Okul Kırtasiyesi', 'okul-kirtasiyesi', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_cubuk_fasulye_ve_say', 'Çubuk Fasülye ve Sayı Boncuğu', 'cubuk-fasulye-ve-sayi-boncugu', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES ('cat_kirtasiye_hobi_urunl', 'Kırtasiye Hobi Ürünleri', 'kirtasiye-hobi-urunleri', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ÜRÜNLER
INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1451000606',
  'Pritt-Suluboya 12 Renk Küçük Tablet',
  'pritt-suluboya-12-renk-kucuk-tablet',
  '8691451000606',
  'Pritt-Suluboya 12 Renk Küçük Tablet',
  79.00,
  100,
  '{"https://cdn.bkmkitap.com/pritt-suluboya-12-renk-kucuk-tablet-13722408-44-O.jpg","https://cdn.bkmkitap.com/pritt-suluboya-12-renk-kucuk-tablet-13722409-44-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_sulu_boyalar',
  (SELECT id FROM "Brand" WHERE slug = 'pritt' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_0628003366',
  'Nova Color Kil Kahve 250 Gr',
  'nova-color-kil-kahve-250-gr',
  '8680628003366',
  'Nova Color Kil Kahve 250 Gr',
  44.25,
  100,
  '{"https://cdn.bkmkitap.com/nova-color-kil-kahve-250-gr-13988564-49-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_kil_ve_proje_hamurla',
  (SELECT id FROM "Brand" WHERE slug = 'nova-color' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1241136530',
  'Adel Pastel Boya Karton Kutu Köşeli 12`li',
  'adel-pastel-boya-karton-kutu-koseli-12-li',
  '8681241136530',
  'Adel Pastel Boya Karton Kutu Köşeli 12`li',
  89.25,
  100,
  '{"https://cdn.bkmkitap.com/adel-pastel-boya-karton-kutu-koseli-12li-14018173-47-O.jpg","https://cdn.bkmkitap.com/adel-pastel-boya-karton-kutu-koseli-12li-14018174-47-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_pastel_boyalar',
  (SELECT id FROM "Brand" WHERE slug = 'adel' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1734018779',
  'Alex Schoeller Renkli Fotokopi Kağıdı A4 100`lü Pk Alx-779',
  'alex-schoeller-renkli-fotokopi-kagidi-a4-100-lu-pk-alx-779',
  '8691734018779',
  'Alex Schoeller Renkli Fotokopi Kağıdı A4 100`lü Pk Alx-779',
  191.20,
  100,
  '{"https://cdn.bkmkitap.com/alex-schoeller-renkli-fotokopi-kagidi-a4-100lu-pk-alx-779-14005393-51-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_renkli_a4_kagitlari',
  (SELECT id FROM "Brand" WHERE slug = 'alex-schoeller' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3511428150',
  'Carioca Teddy Jumbo Bebek Süper Yıkanabilir Keçeli Boya Kalemi 6 Renk',
  'carioca-teddy-jumbo-bebek-super-yikanabilir-keceli-boya-kalemi-6-renk',
  '8003511428150',
  'Carioca Teddy Jumbo Bebek Süper Yıkanabilir Keçeli Boya Kalemi 6 Renk',
  376.35,
  100,
  '{"https://cdn.bkmkitap.com/carioca-keceli-boya-kalemi-jumbo-yikan-13986960-37-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_keceli_boya_kalemler',
  (SELECT id FROM "Brand" WHERE slug = 'carioca' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_5000090933',
  'Pritt-Stick Yapıştırıcı 22Gr',
  'pritt-stick-yapistirici-22gr',
  '4015000090933',
  'Pritt-Stick Yapıştırıcı 22Gr',
  60.00,
  100,
  '{"https://cdn.bkmkitap.com/pritt-stick-yapistirici-22g-13674435-36-O.jpg","https://cdn.bkmkitap.com/pritt-stick-yapistirici-22g-13674436-36-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_stick_yapistirici',
  (SELECT id FROM "Brand" WHERE slug = 'pritt' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_0040151816',
  'Pritt-Stick Yapıştırıcı 11Gr',
  'pritt-stick-yapistirici-11gr',
  '0000040151816',
  'Pritt-Stick Yapıştırıcı 11Gr',
  41.65,
  100,
  '{"https://cdn.bkmkitap.com/pritt-stick-yapistirici-11gr-13674459-78-O.jpg","https://cdn.bkmkitap.com/pritt-stick-yapistirici-11gr-13674460-78-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_stick_yapistirici',
  (SELECT id FROM "Brand" WHERE slug = 'pritt' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_0679801010',
  'Let`s Parmak Boyası 6 Ana Renk 25 ml',
  'let-s-parmak-boyasi-6-ana-renk-25-ml',
  '8680679801010',
  'Lets 6 Renk &nbsp;Parmak Boya',
  119.00,
  100,
  '{"https://cdn.bkmkitap.com/lets-parmak-boyasi-6-renk-25ml-13389200-45-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_parmak_boyasi',
  (SELECT id FROM "Brand" WHERE slug = 'lets' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_0826160426',
  'Faber-Castell Parmak Boyası 6 Renk',
  'faber-castell-parmak-boyasi-6-renk',
  '8690826160426',
  'Faber-Castell Parmak Boyası 6 Renk',
  279.30,
  100,
  '{"https://cdn.bkmkitap.com/faber-castell-parmak-boyasi-6-renk-5170160402-13675650-37-O.jpg","https://cdn.bkmkitap.com/faber-castell-parmak-boyasi-6-renk-5170160402-13675651-37-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_parmak_boyasi',
  (SELECT id FROM "Brand" WHERE slug = 'faber-castell' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3245036006',
  'Noki Dosya Çıtçıtlı Evrak Zarfı Şeffaf 3101',
  'noki-dosya-citcitli-evrak-zarfi-seffaf-3101',
  '8693245036006',
  'Noki Dosya &Ccedil;ıtçıtlı Evrak Zarfı Şeffaf 3101',
  19.00,
  100,
  '{"https://cdn.bkmkitap.com/noki-dosya-citcitli-evrak-zarfi-seffaf-3101-13937378-81-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_cit_citli_dosyalar',
  (SELECT id FROM "Brand" WHERE slug = 'noki' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3043059818',
  'Cool Kareli A4 40 Yaprak Plastik Kapak Dikişli Defter Keskin Color',
  'cool-kareli-a4-40-yaprak-plastik-kapak-dikisli-defter-keskin-color',
  '8693043059818',
  'Tarafınıza gönderilecek olan ürünün renk ya da modeli stok durumuna göre belirlenip 1 adet olarak sevk edilecektir.',
  33.75,
  100,
  '{"https://cdn.bkmkitap.com/kcolor-a4-40-ypkareli-pp-kpdikisli-cool-defter-13988595-35-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_kareli_defter',
  (SELECT id FROM "Brand" WHERE slug = 'keskin-color' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1241142043',
  'Adel Vega Tükenmez Mavi',
  'adel-vega-tukenmez-mavi',
  '8681241142043',
  'Adel Vega Tükenmez Mavi',
  11.25,
  100,
  '{"https://cdn.bkmkitap.com/adel-vega-tukenmez-mavi-13954344-47-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_tukenmez_kalem',
  (SELECT id FROM "Brand" WHERE slug = 'adel' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1241092805',
  'Adel Keçeli Kalem 12 Renk',
  'adel-keceli-kalem-12-renk',
  '8681241092805',
  'Adel Keçeli Kalem 12 Renk',
  143.20,
  100,
  '{"https://cdn.bkmkitap.com/adel-keceli-kalem-12-renk-13988565-47-O.jpg","https://cdn.bkmkitap.com/adel-keceli-kalem-12-renk-13988566-47-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_keceli_boya_kalemler',
  (SELECT id FROM "Brand" WHERE slug = 'adel' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1241142104',
  'Adel Vega Tükenmez Kırmızı',
  'adel-vega-tukenmez-kirmizi',
  '8681241142104',
  'Adel Vega Tükenmez Kırmızı',
  11.25,
  100,
  '{"https://cdn.bkmkitap.com/adel-vega-tukenmez-kirmizi-13954368-47-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_tukenmez_kalem',
  (SELECT id FROM "Brand" WHERE slug = 'adel' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_6089009225',
  'Faber-Castell Hamur Silgi 127220',
  'faber-castell-hamur-silgi-127220',
  '9556089009225',
  'Faber-Castell Hamur Silgi 127220',
  48.30,
  100,
  '{"https://cdn.bkmkitap.com/faber-castell-hamur-silgi-127220-13675089-56-O.jpg","https://cdn.bkmkitap.com/faber-castell-hamur-silgi-127220-13675090-56-O.jpg","https://cdn.bkmkitap.com/faber-castell-hamur-silgi-127220-13675091-56-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_silgiler',
  (SELECT id FROM "Brand" WHERE slug = 'faber-castell' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_6089009232',
  'Faber-Castell Silgi Plastik Kutulu Renkli Hamur',
  'faber-castell-silgi-plastik-kutulu-renkli-hamur',
  '9556089009232',
  'Tarafınıza gönderilecek olan ürünün renk ya da modeli stok durumuna göre belirlenip 1 adet olarak sevk edilecektir.',
  48.30,
  100,
  '{"https://cdn.bkmkitap.com/faber-castell-silgi-plastik-kutulu-renkli-hamur-13675079-43-O.jpg","https://cdn.bkmkitap.com/faber-castell-silgi-plastik-kutulu-renkli-hamur-13675080-43-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_silgiler',
  (SELECT id FROM "Brand" WHERE slug = 'faber-castell' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3043089266',
  'Keskin Color Cool Defter Çizgili 100 Yaprak Plastik Kapak A4',
  'keskin-color-cool-defter-cizgili-100-yaprak-plastik-kapak-a4',
  '8693043089266',
  'Tarafınıza gönderilecek olan ürünün renk ya da modeli stok durumuna göre belirlenip 1 adet olarak sevk edilecektir.',
  74.25,
  100,
  '{"https://cdn.bkmkitap.com/kcolor-a4-100ypcizgili-pp-kpdikisli-cool-defter-13987475-35-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_cizgili_defter',
  (SELECT id FROM "Brand" WHERE slug = 'keskin-color' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3043059801',
  'Cool Çizgili A4 40 Yaprak Plastik Kapak Dikişli Defter Keskin Color',
  'cool-cizgili-a4-40-yaprak-plastik-kapak-dikisli-defter-keskin-color',
  '8693043059801',
  'Tarafınıza gönderilecek olan ürünün renk ya da modeli stok durumuna göre belirlenip 1 adet olarak sevk edilecektir.',
  33.75,
  100,
  '{"https://cdn.bkmkitap.com/kcolor-a4-40-ypcizgili-pp-kpdikisli-cool-defter-13987457-35-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_cizgili_defter',
  (SELECT id FROM "Brand" WHERE slug = 'keskin-color' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3043101517',
  'Spiralli Cool A4 40 Yaprak Çizgili PP Kapak Defter Keskin Color',
  'spiralli-cool-a4-40-yaprak-cizgili-pp-kapak-defter-keskin-color',
  '8693043101517',
  'Tarafınıza gönderilecek olan ürünün renk ya da modeli stok durumuna göre belirlenip 1 adet olarak sevk edilecektir.',
  44.25,
  100,
  '{"https://cdn.bkmkitap.com/kcolor-a4-40-ypcizgili-pp-kpspiralli-cool-defte-13987461-35-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_cizgili_defter',
  (SELECT id FROM "Brand" WHERE slug = 'keskin-color' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3043089082',
  'Keskin Color A4 60 Yp.Çizgili Pp Kp.Dikişli Cool Defter',
  'keskin-color-a4-60-yp-cizgili-pp-kp-dikisli-cool-defter',
  '8693043089082',
  'Tarafınıza gönderilecek olan ürünün renk ya da modeli stok durumuna göre belirlenip 1 adet olarak sevk edilecektir.',
  44.25,
  100,
  '{"https://cdn.bkmkitap.com/kcolor-a4-60-ypcizgili-pp-kpdikisli-cool-defter-13987494-35-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_cizgili_defter',
  (SELECT id FROM "Brand" WHERE slug = 'keskin-color' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3245792193',
  'Noki Beyaz Tahta Kalemi Mavi',
  'noki-beyaz-tahta-kalemi-mavi',
  '8693245792193',
  'Noki Beyaz Tahta Kalemi Mavi',
  29.75,
  100,
  '{"https://cdn.bkmkitap.com/noki-beyaz-tahta-kalemi-mavi-14030926-48-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_tahta_kalemleri_ve_g',
  (SELECT id FROM "Brand" WHERE slug = 'noki' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_3245123201',
  'Noki Poşet Dosya Eco A4 100` lü',
  'noki-poset-dosya-eco-a4-100-lu',
  '8693245123201',
  'Noki Poşet Dosya Eco A4 100` lü',
  159.20,
  100,
  '{"https://cdn.bkmkitap.com/noki-poset-dosya-eco-a4-100lu-13988610-48-O.jpg","https://cdn.bkmkitap.com/noki-poset-dosya-eco-a4-100lu-13988611-48-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_poset_dosya',
  (SELECT id FROM "Brand" WHERE slug = 'noki' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_0993314690',
  'Play-Doh Oyun Hamuru 4 Renk 448 Gr',
  'play-doh-oyun-hamuru-4-renk-448-gr',
  '5010993314690',
  'Play-Doh Oyun Hamuru 4 Renk 448 Gr',
  139.30,
  100,
  '{"https://cdn.bkmkitap.com/play-doh-oyun-hamuru-4-renk-448-gr-13988519-64-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_oyun_hamuru',
  (SELECT id FROM "Brand" WHERE slug = 'play-doh' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1451008961',
  'Pritt-Keçeli Kalem 12 Renk',
  'pritt-keceli-kalem-12-renk',
  '8691451008961',
  'Canlı renkleri çocukların eğlenceli bir dünya yaratmasını sağlar.Su bazlı formülü ile yıkanabilir, çocuk sağlığına zararsızdır.Kurumayı önleyen özel kapaklı tasarımı ile uzun süre dayanıklıdır.',
  151.20,
  100,
  '{"https://cdn.bkmkitap.com/pritt-1687976-keceli-kalem-12-li-367347-13988591-36-O.jpg","https://cdn.bkmkitap.com/pritt-1687976-keceli-kalem-12-li-367347-13988592-36-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_keceli_boya_kalemler',
  (SELECT id FROM "Brand" WHERE slug = 'pritt' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_2556008740',
  'Hatas Sayı Fasulyesi - Plastik Kutulu',
  'hatas-sayi-fasulyesi-plastik-kutulu',
  '8692556008740',
  'Hatas Sayı Fasulyesi - Plastik Kutulu',
  75.65,
  100,
  '{"https://cdn.bkmkitap.com/sayi-fasulyesi-ps-kutulu-13675082-42-O.jpg","https://cdn.bkmkitap.com/sayi-fasulyesi-ps-kutulu-13675083-42-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_cubuk_fasulye_ve_say',
  (SELECT id FROM "Brand" WHERE slug = 'hatas' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Product" (id, name, slug, sku, description, price, stock, images, "isFeatured", "isActive", tags, "categoryId", "brandId", "createdAt", "updatedAt")
VALUES (
  'prod_1521927',
  'Kenko KK-613D Dijital Küçük Masa-Araba Saati-Alarm-Kronometre',
  'kenko-kk-613d-dijital-kucuk-masa-araba-saati-alarm-kronometre',
  '1521927',
  'Kenko KK-613D Dijital Küçük Masa-Araba Saati-Alarm-Kronometre',
  135.20,
  100,
  '{"https://cdn.bkmkitap.com/kenko-kk-613d-dijital-kucuk-masa-araba-saati-alarm-kronometre-13629534-86-O.jpg","https://cdn.bkmkitap.com/kenko-kk-613d-dijital-kucuk-masa-araba-saati-alarm-kronometre-13629535-86-O.jpg","https://cdn.bkmkitap.com/kenko-kk-613d-dijital-kucuk-masa-araba-saati-alarm-kronometre-13629536-86-O.jpg"}'::text[],
  false,
  true,
  '{}',
  'cat_kirtasiye_hobi_urunl',
  (SELECT id FROM "Brand" WHERE slug = 'kenko' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

