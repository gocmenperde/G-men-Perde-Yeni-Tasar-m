import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import https from "https";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";
export const maxDuration = 55;

const BKM_BASE = "https://www.bkmkitap.com";
const CLOUDINARY = "https://res.cloudinary.com/dbzdls18g/image/fetch/q_auto,f_auto/";
const CONCURRENT = 8;
const BATCH_SIZE = 80;

const SLUGS_PATH = path.join(process.cwd(), "scripts", "bkm_slugs.json");

function fetchPage(url: string): Promise<string> {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
    }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
    });
    req.on("error", () => resolve(""));
    req.setTimeout(12000, () => { req.destroy(); resolve(""); });
  });
}

function parseProduct(html: string) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const j = JSON.parse(m[1]);
      if (j["@type"] === "Product" && j.offers?.price) return j;
    } catch {}
  }
  return null;
}

function slugify(t: string): string {
  return t.toLowerCase()
    .replace(/[ğĞ]/g, "g").replace(/[üÜ]/g, "u").replace(/[şŞ]/g, "s")
    .replace(/[ıİ]/g, "i").replace(/[öÖ]/g, "o").replace(/[çÇ]/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function decodeHtml(s: string): string {
  return (s || "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "").replace(/&[a-zA-Z]+;/g, "").trim();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  return NextResponse.json(
    { error: "Harici scraper ile ürün geri yükleme devre dışıdır. Veriler CSV/XLSX ile yönetilir." },
    { status: 410 },
  );

  const total = await db.product.count();
  const bkmCount = await db.product.count({ where: { id: { startsWith: "bkm_" } } });
  let totalSlugs = 0;
  try {
    const slugs: string[] = JSON.parse(fs.readFileSync(SLUGS_PATH, "utf8"));
    totalSlugs = slugs.length;
  } catch {}
  return NextResponse.json({ total, bkmCount, totalSlugs });
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Harici scraper ile ürün geri yükleme devre dışıdır. Veriler CSV/XLSX ile yönetilir." },
    { status: 410 },
  );

  const secret = req.headers.get("x-restore-secret");
  if (secret !== "gocmen-restore-2026") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  let allSlugs: string[] = [];
  try {
    allSlugs = JSON.parse(fs.readFileSync(SLUGS_PATH, "utf8"));
  } catch {
    return NextResponse.json({ error: "bkm_slugs.json okunamadı" }, { status: 500 });
  }

  const existingSet = new Set(
    (await db.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );

  const toProcess = allSlugs.filter((s) => !existingSet.has(s)).slice(0, BATCH_SIZE);

  if (toProcess.length === 0) {
    return NextResponse.json({
      done: true,
      inserted: 0,
      remaining: 0,
      total: await db.product.count(),
    });
  }

  const stats = { inserted: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < toProcess.length; i += CONCURRENT) {
    const chunk = toProcess.slice(i, i + CONCURRENT);
    await Promise.allSettled(
      chunk.map(async (slug) => {
        try {
          const html = await fetchPage(`${BKM_BASE}/${slug}`);
          if (!html) { stats.errors++; return; }
          const prod = parseProduct(html);
          if (!prod?.name || !prod.offers?.price) { stats.skipped++; return; }

          const price = parseFloat(String(prod.offers.price).replace(",", "."));
          if (!price || price <= 0) { stats.skipped++; return; }

          const name = decodeHtml(prod.name);
          const images = [prod.image].flat().filter(Boolean).slice(0, 3)
            .map((u: string) => CLOUDINARY + u);

          let brandId: string | null = null;
          if (prod.brand?.name) {
            const bs = slugify(decodeHtml(prod.brand.name));
            const bn = decodeHtml(prod.brand.name);
            await db.brand.upsert({
              where: { slug: bs },
              create: { id: "br_" + bs.slice(0, 25), name: bn, slug: bs },
              update: {},
            });
            brandId = (await db.brand.findUnique({ where: { slug: bs }, select: { id: true } }))?.id ?? null;
          }

          let categoryId: string | null = null;
          if (prod.category) {
            const cats = prod.category.split(">").map((s: string) => s.trim()).filter(Boolean);
            const cName = cats[cats.length - 1];
            const cs = slugify(cName);
            await db.category.upsert({
              where: { slug: cs },
              create: { id: "cat_" + cs.slice(0, 25), name: cName, slug: cs },
              update: {},
            });
            categoryId = (await db.category.findUnique({ where: { slug: cs }, select: { id: true } }))?.id ?? null;
          }

          await db.product.upsert({
            where: { slug },
            create: {
              id: "bkm_" + slug.replace(/-/g, "_").slice(0, 20),
              name, slug,
              description: decodeHtml(prod.description || name),
              price, stock: prod.offers?.availability?.includes("InStock") ? 100 : 0,
              images, isActive: true, isFeatured: false, tags: [],
              categoryId, brandId,
            },
            update: { price },
          });
          stats.inserted++;
        } catch {
          stats.errors++;
        }
      })
    );
    await sleep(120);
  }

  const remaining = allSlugs.filter((s) => !existingSet.has(s)).length - toProcess.length;
  const total = await db.product.count();

  return NextResponse.json({
    done: remaining <= 0,
    inserted: stats.inserted,
    skipped: stats.skipped,
    errors: stats.errors,
    remaining: Math.max(0, remaining),
    total,
  });
}
