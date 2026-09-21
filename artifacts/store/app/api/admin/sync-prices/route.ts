import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import https from "https";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CLOUDINARY_CLOUD = "dbzdls18g";
const BKM_BASE = "https://www.bkmkitap.com";
const BATCH_SIZE = 40;

function fetchPage(url: string): Promise<{ html: string; status: number }> {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept-Language": "tr-TR,tr;q=0.9",
          Accept: "text/html,application/xhtml+xml",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ html: data, status: res.statusCode ?? 0 }));
      }
    );
    req.on("error", () => resolve({ html: "", status: 0 }));
    req.setTimeout(12000, () => { req.destroy(); resolve({ html: "", status: 0 }); });
  });
}

function parseJsonLd(html: string) {
  try {
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let match: RegExpExecArray | null;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const j = JSON.parse(match[1]);
        if (j["@type"] === "Product" && j.offers?.price) return j;
      } catch {}
    }
  } catch {}
  return null;
}

function isInStock(availability?: string): boolean {
  if (!availability) return true;
  return availability.toLowerCase().includes("instock");
}

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Otomatik fiyat/stok scraper senkronizasyonu devre dışıdır. Veriler CSV/XLSX ile yönetilir." },
    { status: 410 },
  );

  const startTime = Date.now();

  const products = await db.product.findMany({
    where: { id: { startsWith: "bkm_" } },
    select: { id: true, slug: true, price: true, stock: true },
    orderBy: { updatedAt: "asc" },
    take: BATCH_SIZE,
  });

  if (products.length === 0) {
    return NextResponse.json({ ok: true, message: "Güncellenecek ürün yok", stats: { total: 0, priceUpdated: 0, stockUpdated: 0, notFound: 0, errors: 0 } });
  }

  const stats = { total: products.length, priceUpdated: 0, stockUpdated: 0, notFound: 0, errors: 0 };

  const CONCURRENT = 8;
  for (let i = 0; i < products.length; i += CONCURRENT) {
    const chunk = products.slice(i, i + CONCURRENT);
    const pages = await Promise.all(chunk.map((p) => fetchPage(`${BKM_BASE}/${p.slug}`)));

    for (let j = 0; j < chunk.length; j++) {
      const product = chunk[j];
      const { html, status } = pages[j];

      if (status === 404) {
        await db.product.update({ where: { id: product.id }, data: { isActive: false, stock: 0 } });
        stats.notFound++;
        continue;
      }
      if (!html) { stats.errors++; continue; }

      const bkmProduct = parseJsonLd(html);
      if (!bkmProduct) { stats.errors++; continue; }

      const newPrice = parseFloat(bkmProduct.offers?.price ?? "0");
      const newStock = isInStock(bkmProduct.offers?.availability) ? 100 : 0;
      const oldPrice = parseFloat(product.price.toString());
      const priceChanged = Math.abs(oldPrice - newPrice) > 0.01 && newPrice > 0;
      const stockChanged = product.stock !== newStock;

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (priceChanged) { updateData.price = newPrice; stats.priceUpdated++; }
      if (stockChanged) { updateData.stock = newStock; stats.stockUpdated++; }

      await db.product.update({ where: { id: product.id }, data: updateData });
    }

    await new Promise((r) => setTimeout(r, 80));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  return NextResponse.json({ ok: true, duration: `${elapsed}s`, stats });
}

export async function GET(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Otomatik fiyat/stok scraper senkronizasyonu devre dışıdır. Veriler CSV/XLSX ile yönetilir." },
    { status: 410 },
  );

  const [bkmTotal, outOfStock, lastSynced, recentlyUpdated] = await Promise.all([
    db.product.count({ where: { id: { startsWith: "bkm_" } } }),
    db.product.count({ where: { id: { startsWith: "bkm_" }, stock: 0 } }),
    db.product.findFirst({
      where: { id: { startsWith: "bkm_" } },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    db.product.count({
      where: {
        id: { startsWith: "bkm_" },
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return NextResponse.json({
    bkmTotal,
    outOfStock,
    lastSyncedAt: lastSynced?.updatedAt ?? null,
    recentlyUpdated,
  });
}
