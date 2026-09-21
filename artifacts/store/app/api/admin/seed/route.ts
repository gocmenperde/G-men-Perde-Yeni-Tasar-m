import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    // ── ANA KATEGORİLER ──────────────────────────────────────────────────────
    const mainCats = [
      { name: "Kalemler & Yazı Gereçleri", slug: "kalemler-yazi-gerecleri" },
      { name: "Defterler & Ajandalar",     slug: "defterler-ajandalar" },
      { name: "Sanat Malzemeleri",         slug: "sanat-malzemeleri" },
      { name: "Okul Gereçleri",            slug: "okul-gerecleri" },
      { name: "Ofis Malzemeleri",          slug: "ofis-malzemeleri" },
      { name: "Boyalar & Renkler",         slug: "boyalar-renkler" },
      { name: "Kağıt & Karton",           slug: "kagit-karton" },
      { name: "Dosyalama & Düzenleme",     slug: "dosyalama-duzenleme" },
      { name: "Kesici & Yapıştırıcı",      slug: "kesici-yapistirici" },
      { name: "Çizim & Teknik",           slug: "cizim-teknik" },
    ];

    const catMap: Record<string, string> = {};
    for (const c of mainCats) {
      const cat = await db.category.upsert({
        where:  { slug: c.slug },
        update: { name: c.name, parentId: null },
        create: { name: c.name, slug: c.slug },
      });
      catMap[c.name] = cat.id;
    }

    // ── ALT KATEGORİLER ──────────────────────────────────────────────────────
    const subCats = [
      { name: "Keçeli Kalem",     slug: "keceli-kalem",    parent: "Kalemler & Yazı Gereçleri" },
      { name: "Kuru Boya Kalemi", slug: "kuru-boya-kalemi",parent: "Kalemler & Yazı Gereçleri" },
      { name: "Versatil Kalem",   slug: "versatil-kalem",  parent: "Kalemler & Yazı Gereçleri" },
      { name: "Tükenmez Kalem",   slug: "tukenmez-kalem",  parent: "Kalemler & Yazı Gereçleri" },
      { name: "Dolma Kalem",      slug: "dolma-kalem",     parent: "Kalemler & Yazı Gereçleri" },
      { name: "Fineliner",        slug: "fineliner",       parent: "Kalemler & Yazı Gereçleri" },
      { name: "Spiralli Defter",  slug: "spiralli-defter", parent: "Defterler & Ajandalar" },
      { name: "Günlük Ajanda",    slug: "gunluk-ajanda",   parent: "Defterler & Ajandalar" },
      { name: "Dikiş Defteri",    slug: "dikis-defteri",   parent: "Defterler & Ajandalar" },
      { name: "Kuru Boya",        slug: "kuru-boya",       parent: "Boyalar & Renkler" },
      { name: "Sulu Boya",        slug: "sulu-boya",       parent: "Boyalar & Renkler" },
      { name: "Yağlı Boya",       slug: "yagli-boya",      parent: "Boyalar & Renkler" },
      { name: "Pastel Boya",      slug: "pastel-boya",     parent: "Boyalar & Renkler" },
      { name: "Akrilik Boya",     slug: "akrilik-boya",    parent: "Boyalar & Renkler" },
      { name: "Zımba",            slug: "zimba",           parent: "Ofis Malzemeleri" },
      { name: "Delgeç",           slug: "delgec",          parent: "Ofis Malzemeleri" },
      { name: "Yapışkanlı Not",   slug: "yapiskali-not",   parent: "Ofis Malzemeleri" },
      { name: "Fotokopi Kağıdı",  slug: "fotokopi-kagidi", parent: "Kağıt & Karton" },
      { name: "Renkli Karton",    slug: "renkli-karton",   parent: "Kağıt & Karton" },
      { name: "Silgi",            slug: "silgi",           parent: "Okul Gereçleri" },
      { name: "Cetvel & Gönye",   slug: "cetvel-gonye",    parent: "Okul Gereçleri" },
      { name: "Makas",            slug: "makas",           parent: "Okul Gereçleri" },
      { name: "Pergel",           slug: "pergel",          parent: "Okul Gereçleri" },
    ];

    for (const s of subCats) {
      const cat = await db.category.upsert({
        where:  { slug: s.slug },
        update: { name: s.name, parentId: catMap[s.parent] ?? null },
        create: { name: s.name, slug: s.slug, parentId: catMap[s.parent] ?? null },
      });
      catMap[s.name] = cat.id;
    }

    // ── MARKALAR ─────────────────────────────────────────────────────────────
    const brands = [
      { name: "Südor",         slug: "sudor",         logo: null },
      { name: "Mikro",         slug: "mikro",         logo: null },
      { name: "Pensan",        slug: "pensan",        logo: null },
      { name: "Fatih",         slug: "fatih",         logo: null },
      { name: "Masis",         slug: "masis",         logo: null },
      { name: "Delta",         slug: "delta",         logo: null },
      { name: "Keskin Color",  slug: "keskin-color",  logo: null },
      { name: "Globox",        slug: "globox",        logo: null },
      { name: "Faber-Castell", slug: "faber-castell", logo: null },
      { name: "Staedtler",     slug: "staedtler",     logo: null },
      { name: "Pelikan",       slug: "pelikan",       logo: null },
      { name: "Pentel",        slug: "pentel",        logo: null },
      { name: "Koh-i-Noor",   slug: "koh-i-noor",   logo: null },
      { name: "Stabilo",       slug: "stabilo",       logo: null },
      { name: "Moleskine",     slug: "moleskine",     logo: null },
    ];

    for (const b of brands) {
      await db.brand.upsert({
        where:  { slug: b.slug },
        update: { name: b.name },
        create: b,
      });
    }

    const catCount   = await db.category.count();
    const brandCount = await db.brand.count();

    return NextResponse.json({
      ok: true,
      message: `${catCount} kategori ve ${brandCount} marka yüklendi.`,
      categories: catCount,
      brands: brandCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Başlatma başarısız." }, { status: 500 });
  }
}
