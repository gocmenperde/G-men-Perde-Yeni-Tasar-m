import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import https from "https";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BKM_BASE = "https://www.bkmkitap.com";
const CLOUDINARY_CLOUD = "dbzdls18g";
const CONCURRENT = 6;

const NON_PRODUCT_SLUGS = new Set([
  "uye-ol","giris-yap","sepetim","odeme","hesabim","siparislerim",
  "favorilerim","kampanyalar","markalar","kategoriler","iletisim",
  "hakkimizda","garanti-ve-iade-kosullari","gizlilik-politikasi",
  "cok-satan-kitaplar","en-cok-satanlar","indirimli-urunler",
  "yeni-gelenler","onerilenler","uye-sifre-hatirlat",
]);

const NON_PRODUCT_PREFIXES = [
  "kampanya","koleksiyon","liste","top-","cok-satan","en-cok","en-sevilen",
  "cocuk-0","cocuk-1","cocuk-2","cocuk-3","cocuk-4","cocuk-5","cocuk-6",
  "cocuk-ilk","genclik-","turk-edebiyati","dunya-klasikleri","cizgi-roman-",
  "korku-ve","hobi-ve","ajanda","kitap-seti","kitabi-seti","6698-sayili",
  "best-seller","kategori-","yazar-","yayinevi-",
];

function fetchPage(url: string): Promise<{ html: string; status: number }> {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "tr-TR,tr;q=0.9",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ html: data, status: res.statusCode ?? 0 }));
      }
    );
    req.on("error", () => resolve({ html: "", status: 0 }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ html: "", status: 0 }); });
  });
}

function parseJsonLd(html: string) {
  try {
    const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      try {
        const j = JSON.parse(m[1]);
        if (j["@type"] === "Product" && j.offers?.price) return j;
      } catch {}
    }
  } catch {}
  return null;
}

function extractSlugsFromPage(html: string): string[] {
  const re = /href="\/([a-z][a-z0-9\-]{8,80})"/g;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const slug = m[1];
    if (NON_PRODUCT_SLUGS.has(slug)) continue;
    if (NON_PRODUCT_PREFIXES.some((p) => slug.startsWith(p))) continue;
    if (slug.split("-").length < 3) continue;
    found.add(slug);
  }
  return [...found];
}

function slugify(t: string): string {
  return t.toString().toLowerCase()
    .replace(/[ğĞ]/g, "g").replace(/[üÜ]/g, "u").replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i").replace(/[öÖ]/g, "o").replace(/[çÇ]/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function decodeHtml(s: string): string {
  return (s || "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
    .replace(/&uuml;/g, "ü").replace(/&ccedil;/g, "ç").replace(/&ouml;/g, "ö")
    .replace(/&iuml;/g, "ı").replace(/&scaron;/g, "ş").replace(/&gbreve;/g, "ğ")
    .replace(/&Uuml;/g, "Ü").replace(/&Ccedil;/g, "Ç").replace(/&Ouml;/g, "Ö")
    .replace(/&Scaron;/g, "Ş").replace(/&Gbreve;/g, "Ğ")
    .replace(/&#\d+;/g, "").replace(/&[a-zA-Z]+;/g, "").trim();
}

function toCloudinary(imgUrl: string): string {
  if (!imgUrl) return imgUrl;
  if (imgUrl.includes("cdn.bkmkitap.com")) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${imgUrl}`;
  }
  return imgUrl;
}

function isInStock(availability?: string): boolean {
  if (!availability) return true;
  return availability.toLowerCase().includes("instock");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Harici scraper ile ürün içe aktarma devre dışıdır. Veriler CSV/XLSX ile yönetilir." },
    { status: 410 },
  );

  const [total, bkmCount] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { id: { startsWith: "bkm_" } } }),
  ]);

  return NextResponse.json({ total, bkmCount });
}

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Harici scraper ile ürün içe aktarma devre dışıdır. Veriler CSV/XLSX ile yönetilir." },
    { status: 410 },
  );

  const body = await req.json();
  const category: string = body.category || "kirtasiye";
  const page: number = Math.max(1, parseInt(body.page) || 1);

  const stats = { added: 0, skipped: 0, notProduct: 0, slugsFound: 0, errors: 0 };

  const categoryRes = await fetchPage(`${BKM_BASE}/${category}?pg=${page}`);
  if (!categoryRes.html) {
    return NextResponse.json({ error: "BKM sayfasına ulaşılamadı", stats }, { status: 502 });
  }

  const candidateSlugs = extractSlugsFromPage(categoryRes.html);
  stats.slugsFound = candidateSlugs.length;

  if (candidateSlugs.length === 0) {
    return NextResponse.json({ ok: true, hasMore: false, stats });
  }

  const existing = await db.product.findMany({
    where: { slug: { in: candidateSlugs } },
    select: { slug: true },
  });
  const existingSlugs = new Set(existing.map((p) => p.slug));

  const newSlugs = candidateSlugs.filter((s) => !existingSlugs.has(s));
  stats.skipped = candidateSlugs.length - newSlugs.length;

  const dbSlugs = new Set<string>(
    (await db.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );

  for (let i = 0; i < newSlugs.length; i += CONCURRENT) {
    const chunk = newSlugs.slice(i, i + CONCURRENT);
    const pages = await Promise.all(chunk.map((s) => fetchPage(`${BKM_BASE}/${s}`)));

    for (let j = 0; j < chunk.length; j++) {
      const bkmSlug = chunk[j];
      const { html, status } = pages[j];

      if (status === 404 || !html) { stats.errors++; continue; }

      const product = parseJsonLd(html);
      if (!product) { stats.notProduct++; continue; }

      const newPrice = parseFloat(product.offers?.price || "0");
      const name = decodeHtml(product.name || "");
      if (!name || newPrice <= 0) { stats.notProduct++; continue; }

      const inStock = isInStock(product.offers?.availability);
      const newStock = inStock ? 100 : 0;

      let finalSlug = bkmSlug;
      let c = 2;
      while (dbSlugs.has(finalSlug)) finalSlug = bkmSlug + "-" + c++;
      dbSlugs.add(finalSlug);

      const bName = product.brand?.name ? decodeHtml(product.brand.name) : "";
      const bSlug = bName ? slugify(bName) : "";
      const cats = product.category
        ? product.category.split(">").map((s: string) => s.trim()).filter(Boolean)
        : [];
      const cSlug = cats.length ? slugify(cats[cats.length - 1]) : "";
      const imgs = (Array.isArray(product.image)
        ? product.image
        : product.image ? [product.image] : []
      ).map(toCloudinary);
      const id = "bkm_" + (product.productId || finalSlug.replace(/-/g, "_").slice(0, 20));

      try {
        let bId: string | null = null;
        const brandName = bName;
        const brandSlug = bSlug;
        if (brandSlug && brandName) {
          await db.brand.upsert({
            where: { slug: brandSlug },
            update: {},
            create: { id: "br_" + brandSlug.slice(0, 25), name: brandName, slug: brandSlug },
          });
          const br = await db.brand.findUnique({ where: { slug: brandSlug }, select: { id: true } });
          bId = br?.id ?? null;
        }

        let cId: string | null = null;
        const categorySlug = cSlug;
        if (categorySlug && cats.length) {
          const cName = cats[cats.length - 1];
          await db.category.upsert({
            where: { slug: categorySlug },
            update: {},
            create: { id: "cat_" + categorySlug.slice(0, 25), name: cName, slug: categorySlug },
          });
          const cr = await db.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
          cId = cr?.id ?? null;
        }

        await db.product.upsert({
          where: { slug: finalSlug },
          update: {},
          create: {
            id,
            name,
            slug: finalSlug,
            sku: product.sku || null,
            description: decodeHtml(product.description || name),
            price: newPrice,
            stock: newStock,
            images: imgs,
            isFeatured: false,
            isActive: true,
            tags: [],
            categoryId: cId,
            brandId: bId,
          },
        });

        stats.added++;
      } catch {
        stats.errors++;
      }
    }

    await sleep(80);
  }

  const hasMore = stats.slugsFound > 0;
  return NextResponse.json({ ok: true, hasMore, nextPage: page + 1, stats });
}
