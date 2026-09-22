import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // ─── KATEGORİLER ─────────────────────────────────────────────────────────
  const categoryDefs = [
    { name: "Kalemler & Yazı Gereçleri", slug: "kalemler-yazi-gerecleri" },
    { name: "Defterler & Ajandalar",       slug: "defterler-ajandalar" },
    { name: "Sanat Malzemeleri",           slug: "sanat-malzemeleri" },
    { name: "Okul Gereçleri",              slug: "okul-gerecleri" },
    { name: "Ofis Malzemeleri",            slug: "ofis-malzemeleri" },
    { name: "Boyalar & Renkler",           slug: "boyalar-renkler" },
    { name: "Kağıt & Karton",             slug: "kagit-karton" },
    { name: "Dosyalama & Düzenleme",       slug: "dosyalama-duzenleme" },
    { name: "Kesici & Yapıştırıcı",        slug: "kesici-yapistirici" },
    { name: "Çizim & Teknik",             slug: "cizim-teknik" },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoryDefs) {
    const cat = await db.category.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, parentId: null },
      create: { name: c.name, slug: c.slug },
    });
    catMap[c.name] = cat.id;
  }

  // Alt kategoriler
  const subCategories = [
    // Kalemler altı
    { name: "Keçeli Kalem",     slug: "keceli-kalem",    parent: "Kalemler & Yazı Gereçleri" },
    { name: "Kuru Boya Kalemi",  slug: "kuru-boya-kalemi", parent: "Kalemler & Yazı Gereçleri" },
    { name: "Versatil Kalem",   slug: "versatil-kalem",  parent: "Kalemler & Yazı Gereçleri" },
    { name: "Tükenmez Kalem",   slug: "tukenmez-kalem",  parent: "Kalemler & Yazı Gereçleri" },
    { name: "Dolma Kalem",      slug: "dolma-kalem",     parent: "Kalemler & Yazı Gereçleri" },
    { name: "Fineliner",        slug: "fineliner",       parent: "Kalemler & Yazı Gereçleri" },
    // Defterler altı
    { name: "Spiralli Defter",  slug: "spiralli-defter", parent: "Defterler & Ajandalar" },
    { name: "Günlük Ajanda",    slug: "gunluk-ajanda",   parent: "Defterler & Ajandalar" },
    { name: "Dikiş Defterleri", slug: "dikis-defteri",   parent: "Defterler & Ajandalar" },
    // Boyalar altı
    { name: "Kuru Boya",        slug: "kuru-boya",       parent: "Boyalar & Renkler" },
    { name: "Sulu Boya",        slug: "sulu-boya",       parent: "Boyalar & Renkler" },
    { name: "Yağlı Boya",       slug: "yagli-boya",      parent: "Boyalar & Renkler" },
    { name: "Pastel Boya",      slug: "pastel-boya",     parent: "Boyalar & Renkler" },
    { name: "Akrilik Boya",     slug: "akrilik-boya",    parent: "Boyalar & Renkler" },
    // Ofis altı
    { name: "Zımba & Delgeç",   slug: "zimba-delgec",    parent: "Ofis Malzemeleri" },
    { name: "Zımba",            slug: "zimba",           parent: "Ofis Malzemeleri" },
    { name: "Delgeç",           slug: "delgec",          parent: "Ofis Malzemeleri" },
    { name: "Yapışkanlı Not",   slug: "yapiskali-not",   parent: "Ofis Malzemeleri" },
    // Kağıt altı
    { name: "Fotokopi Kağıdı",  slug: "fotokopi-kagidi", parent: "Kağıt & Karton" },
    { name: "Renkli Karton",    slug: "renkli-karton",   parent: "Kağıt & Karton" },
    // Okul altı
    { name: "Silgi",            slug: "silgi",           parent: "Okul Gereçleri" },
    { name: "Cetvel & Gönye",   slug: "cetvel-gonye",    parent: "Okul Gereçleri" },
    { name: "Makas",            slug: "makas",           parent: "Okul Gereçleri" },
    { name: "Pergel",           slug: "pergel",          parent: "Okul Gereçleri" },
  ];

  for (const s of subCategories) {
    const cat = await db.category.upsert({
      where:  { slug: s.slug },
      update: { name: s.name, parentId: catMap[s.parent] ?? null },
      create: { name: s.name, slug: s.slug, parentId: catMap[s.parent] ?? null },
    });
    catMap[s.name] = cat.id;
  }

  // ─── MARKALAR ─────────────────────────────────────────────────────────────
  const brands = [
    // Fotoğraftaki Türk markalar
    { name: "Südor",        slug: "sudor",        logo: "https://upload.wikimedia.org/wikipedia/tr/f/f8/S%C3%BCdor_logo.png" },
    { name: "Mikro",        slug: "mikro",        logo: "https://www.mikrokirtasiye.com/Content/img/logo.png" },
    { name: "Pensan",       slug: "pensan",       logo: "https://www.pensan.com.tr/Content/images/pensan-logo.png" },
    { name: "Fatih",        slug: "fatih",        logo: "https://www.fatihkirtasiye.com/images/logo.png" },
    { name: "Masis",        slug: "masis",        logo: "https://www.masis.com.tr/img/logo.png" },
    { name: "Delta",        slug: "delta",        logo: "https://www.deltaofis.com.tr/images/logo.png" },
    { name: "Keskin Color", slug: "keskin-color", logo: "https://www.keskincolor.com.tr/content/images/logo.png" },
    { name: "Globox",       slug: "globox",       logo: null },
    // Uluslararası markalar
    { name: "Faber-Castell", slug: "faber-castell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Faber-Castell_Logo.svg/320px-Faber-Castell_Logo.svg.png" },
    { name: "Staedtler",    slug: "staedtler",    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Staedtler_logo.svg/320px-Staedtler_logo.svg.png" },
    { name: "Pelikan",      slug: "pelikan",      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Pelikan_logo.svg/320px-Pelikan_logo.svg.png" },
    { name: "Pentel",       slug: "pentel",       logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pentel_logo.svg/320px-Pentel_logo.svg.png" },
    { name: "Koh-i-Noor",  slug: "koh-i-noor",  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Koh-i-Noor_Hardtmuth_logo.svg/320px-Koh-i-Noor_Hardtmuth_logo.svg.png" },
    { name: "Stabilo",      slug: "stabilo",      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Stabilo_Logo.svg/320px-Stabilo_Logo.svg.png" },
    { name: "Moleskine",    slug: "moleskine",    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Moleskine_logo.svg/320px-Moleskine_logo.svg.png" },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brands) {
    const r = await db.brand.upsert({
      where:  { slug: b.slug },
      update: { name: b.name, logo: b.logo },
      create: { name: b.name, slug: b.slug, logo: b.logo },
    });
    brandMap[b.name] = r.id;
  }

  // ─── KULLANICILAR ─────────────────────────────────────────────────────────
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredAdminPassword = process.env.ADMIN_PASSWORD;
  const users = [
    ...(configuredAdminEmail && configuredAdminPassword
      ? [{ email: configuredAdminEmail, name: "Admin", role: "ADMIN", pass: configuredAdminPassword }]
      : []),
    { email: "ahmet@test.com",         name: "Ahmet Yılmaz", role: "USER",  pass: "test123"  },
    { email: "ayse@test.com",          name: "Ayşe Kaya",   role: "USER",  pass: "test123"  },
  ];
  for (const u of users) {
    await db.user.upsert({
      where:  { email: u.email },
      update: { name: u.name, role: u.role, password: await bcrypt.hash(u.pass, 10) },
      create: { email: u.email, name: u.name, role: u.role, password: await bcrypt.hash(u.pass, 10) },
    });
  }

  // ─── ÜRÜNLER ─────────────────────────────────────────────────────────────
  type ProductDef = {
    name: string; slug: string; price: number; compare: number | null;
    stock: number; cat: string; brand: string | null; featured: boolean;
    sku: string; img: string;
  };

  const products: ProductDef[] = [
    { name: "Faber-Castell 12'li Kuru Boya Seti", slug: "faber-castell-12li-kuru-boya", price: 89.9, compare: 119.9, stock: 150, cat: "Kuru Boya", brand: "Faber-Castell", featured: true, sku: "FC-001", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600" },
    { name: "Staedtler Triplus Fineliner 10'lu Set", slug: "staedtler-triplus-10lu", price: 145, compare: 189, stock: 80, cat: "Fineliner", brand: "Staedtler", featured: true, sku: "ST-002", img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600" },
    { name: "Pelikan Günlük Ajanda 2025", slug: "pelikan-gunluk-ajanda-2025", price: 129.9, compare: null, stock: 200, cat: "Günlük Ajanda", brand: "Pelikan", featured: true, sku: "PL-003", img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600" },
    { name: "Pentel EnerGel Jel Kalem 5'li", slug: "pentel-energel-jel-5li", price: 67.5, compare: 85, stock: 300, cat: "Tükenmez Kalem", brand: "Pentel", featured: true, sku: "PN-004", img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600" },
    { name: "Koh-i-Noor Sulu Boya 24'lü", slug: "koh-i-noor-sulu-boya-24lu", price: 210, compare: 259, stock: 60, cat: "Sulu Boya", brand: "Koh-i-Noor", featured: true, sku: "KN-005", img: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600" },
    { name: "Staedtler Spiralli A4 Defter 100 Yaprak", slug: "staedtler-spiralli-a4-100", price: 45, compare: null, stock: 500, cat: "Spiralli Defter", brand: "Staedtler", featured: true, sku: "ST-006", img: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600" },
    { name: "Südor Keçeli Kalem 24'lü Set", slug: "sudor-keceli-kalem-24lu", price: 65, compare: 85, stock: 200, cat: "Keçeli Kalem", brand: "Südor", featured: true, sku: "SD-007", img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600" },
    { name: "Pensan Tükenmez Kalem 50'li Kutu", slug: "pensan-tukenmez-50li", price: 89, compare: 110, stock: 400, cat: "Tükenmez Kalem", brand: "Pensan", featured: true, sku: "PS-008", img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600" },
    { name: "Fatih Silgi Seti 10'lu", slug: "fatih-silgi-10lu", price: 25, compare: 35, stock: 600, cat: "Silgi", brand: "Fatih", featured: false, sku: "FT-009", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600" },
    { name: "Masis Zımba Makinesi", slug: "masis-zimba-makinesi", price: 120, compare: 150, stock: 80, cat: "Zımba", brand: "Masis", featured: false, sku: "MS-010", img: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600" },
    { name: "Delta Delgeç Klasik", slug: "delta-delgec-klasik", price: 95, compare: null, stock: 100, cat: "Delgeç", brand: "Delta", featured: false, sku: "DT-011", img: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600" },
    { name: "A4 Fotokopi Kağıdı 500 Yaprak", slug: "a4-fotokopi-kagidi-500", price: 89, compare: null, stock: 1000, cat: "Fotokopi Kağıdı", brand: null, featured: false, sku: "PR-012", img: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600" },
    { name: "Renkli Karton 50'li Paket", slug: "renkli-karton-50li", price: 65, compare: null, stock: 300, cat: "Renkli Karton", brand: null, featured: false, sku: "PR-013", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600" },
    { name: "Keskin Color Kuru Boya 24'lü", slug: "keskin-color-kuru-boya-24lu", price: 55, compare: 70, stock: 250, cat: "Kuru Boya", brand: "Keskin Color", featured: true, sku: "KC-014", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600" },
    { name: "Faber-Castell Ahşap Kurşun Kalem 12'li", slug: "faber-castell-ahsap-kursun-12li", price: 52, compare: null, stock: 400, cat: "Keçeli Kalem", brand: "Faber-Castell", featured: false, sku: "FC-015", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600" },
    { name: "Stabilo Boss Fosforlu Kalem 4'lü", slug: "stabilo-boss-fosforlu-4lu", price: 48, compare: 62, stock: 350, cat: "Keçeli Kalem", brand: "Stabilo", featured: false, sku: "SB-016", img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600" },
    { name: "Pelikan Dolma Kalem Başlangıç Seti", slug: "pelikan-dolma-kalem-baslangic", price: 389, compare: 450, stock: 35, cat: "Dolma Kalem", brand: "Pelikan", featured: false, sku: "PL-017", img: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600" },
    { name: "Yapışkanlı Not Kağıdı 5'li Paket", slug: "yapiskali-not-kagidi-5li", price: 28, compare: 35, stock: 800, cat: "Yapışkanlı Not", brand: null, featured: false, sku: "PR-018", img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600" },
    { name: "Pastel Boya Seti 36 Renk", slug: "pastel-boya-36-renk", price: 175, compare: null, stock: 90, cat: "Pastel Boya", brand: "Faber-Castell", featured: false, sku: "FC-019", img: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600" },
    { name: "Moleskine Klasik Defter A5", slug: "moleskine-klasik-a5", price: 320, compare: 380, stock: 45, cat: "Günlük Ajanda", brand: "Moleskine", featured: false, sku: "ML-020", img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600" },
  ];

  const ahmet = await db.user.findUnique({ where: { email: "ahmet@test.com" } });
  const ayse  = await db.user.findUnique({ where: { email: "ayse@test.com"  } });

  for (const p of products) {
    const categoryId = catMap[p.cat] ?? null;
    const brandId    = p.brand ? (brandMap[p.brand] ?? null) : null;
    const desc = `${p.name} günlük kullanım ve profesyonel ihtiyaçlar için özenle seçildi. Dayanıklı yapısı ve kaliteli malzemesiyle uzun süreli performans sunar. Okul, ofis ve hobi çalışmalarında güvenle kullanabilirsiniz.`;
    await db.product.upsert({
      where:  { slug: p.slug },
      update: { name: p.name, sku: p.sku, price: p.price, comparePrice: p.compare, stock: p.stock, description: desc, images: [p.img], isFeatured: p.featured, isActive: true, categoryId, brandId, tags: ["kırtasiye"] },
      create: { name: p.name, slug: p.slug, sku: p.sku, price: p.price, comparePrice: p.compare, stock: p.stock, description: desc, images: [p.img], isFeatured: p.featured, isActive: true, categoryId, brandId, tags: ["kırtasiye"] },
    });
    if (p.featured && ahmet && ayse) {
      const product = await db.product.findUnique({ where: { slug: p.slug } });
      if (!product) continue;
      const existing = await db.review.findFirst({ where: { productId: product.id, userId: ahmet.id } });
      if (!existing) {
        await db.review.createMany({
          data: [
            { userId: ahmet.id, productId: product.id, rating: 5, comment: "Renkleri çok canlı, kalitesi harika. Kesinlikle tavsiye ederim!" },
            { userId: ayse.id,  productId: product.id, rating: 4, comment: "Fiyat performans açısından mükemmel. Hızlı kargo geldi." },
          ],
        });
      }
    }
  }

  console.log("✅ Seed tamamlandı!");
}

main().finally(() => db.$disconnect());
