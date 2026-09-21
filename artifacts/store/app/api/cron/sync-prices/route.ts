import { NextRequest, NextResponse } from "next/server";
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
    req.setTimeout(12000, () => {
      req.destroy();
      resolve({ html: "", status: 0 });
    });
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

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: "Otomatik fiyat/stok scraper cron'u devre dışıdır." },
    { status: 410 },
  );

  // Güvenlik: sadece Vercel Cron veya gizli token ile erişim
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // En uzun süredir güncellenmemiş BKM ürünlerini al
    const products = await db.product.findMany({
      where: { id: { startsWith: "bkm_" } },
      select: { id: true, slug: true, price: true, stock: true },
      orderBy: { updatedAt: "asc" },
      take: BATCH_SIZE,
    });

    if (products.length === 0) {
      return NextResponse.json({ message: "Güncellenecek ürün yok", updated: 0 });
    }

    const stats = {
      total: products.length,
      priceUpdated: 0,
      stockUpdated: 0,
      notFound: 0,
      errors: 0,
    };

    const CONCURRENT = 8;
    for (let i = 0; i < products.length; i += CONCURRENT) {
      const chunk = products.slice(i, i + CONCURRENT);
      const pages = await Promise.all(
        chunk.map((p) => fetchPage(`${BKM_BASE}/${p.slug}`))
      );

      for (let j = 0; j < chunk.length; j++) {
        const product = chunk[j];
        const { html, status } = pages[j];

        if (status === 404) {
          // Ürün BKM'den kalkmış — pasife al
          if (!process.env.CRON_DRY_RUN) {
            await db.product.update({
              where: { id: product.id },
              data: { isActive: false, stock: 0 },
            });
          }
          stats.notFound++;
          continue;
        }

        if (!html) { stats.errors++; continue; }

        const bkmProduct = parseJsonLd(html);
        if (!bkmProduct) { stats.errors++; continue; }

        const newPrice = parseFloat(bkmProduct.offers?.price ?? "0");
        const inStock = isInStock(bkmProduct.offers?.availability);
        const newStock = inStock ? 100 : 0;

        const oldPrice = parseFloat(product.price.toString());
        const oldStock = product.stock;
        const priceChanged = Math.abs(oldPrice - newPrice) > 0.01 && newPrice > 0;
        const stockChanged = oldStock !== newStock;

        if (priceChanged || stockChanged) {
          const updateData: Record<string, unknown> = {};
          if (priceChanged) { updateData.price = newPrice; stats.priceUpdated++; }
          if (stockChanged) { updateData.stock = newStock; stats.stockUpdated++; }

          if (!process.env.CRON_DRY_RUN) {
            await db.product.update({
              where: { id: product.id },
              data: updateData,
            });
          }
        } else {
          // Değişmese bile updatedAt'i güncelle (rotasyon için)
          if (!process.env.CRON_DRY_RUN) {
            await db.product.update({
              where: { id: product.id },
              data: { updatedAt: new Date() },
            });
          }
        }
      }

      await new Promise((r) => setTimeout(r, 80));
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      ok: true,
      duration: `${elapsed}s`,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const caught = error as { message?: unknown } | null;
    const caughtMessage = caught?.message;
    const msg = caughtMessage ? String(caughtMessage) : "Bilinmeyen hata";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
