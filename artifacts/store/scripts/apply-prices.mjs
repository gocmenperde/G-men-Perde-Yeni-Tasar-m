import { PrismaClient } from "@prisma/client";

const NEON_URL = process.env.NEON_DATABASE_URL;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "12");
const DELAY_MS = parseInt(process.env.DELAY_MS || "250");
const OFFSET = parseInt(process.env.CHUNK_OFFSET || "0");
const LIMIT = parseInt(process.env.CHUNK_LIMIT || "300");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const UA_MOBILE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

const db = new PrismaClient({ log: [], datasources: { db: { url: NEON_URL } } });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü").replace(/&ccedil;/g, "ç")
    .replace(/&icirc;/g, "î").replace(/&Ouml;/g, "Ö").replace(/&Uuml;/g, "Ü")
    .replace(/&Ccedil;/g, "Ç").replace(/&scaron;/g, "ş").replace(/&Scaron;/g, "Ş")
    .replace(/&#\d+;/g, "");
}
function cleanText(s) {
  return decodeHtml(s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

async function safeFetch(url, init, ms = 12000) {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
    if (!res.ok) return null;
    return res;
  } catch { return null; }
}

async function fetchProxy(q, barcode, brand) {
  const proxyUrl = process.env.SEARCH_PROXY_URL;
  if (!proxyUrl) return { price: null, description: null };
  const params = new URLSearchParams({ q });
  if (barcode) params.set("barcode", barcode);
  if (brand) params.set("brand", brand);
  const secret = process.env.SEARCH_PROXY_SECRET;
  const res = await safeFetch(
    `${proxyUrl}?${params}`,
    {
      headers: {
        Accept: "application/json",
        ...(secret ? { "x-search-proxy-secret": secret } : {}),
      },
    },
    22000,
  );
  if (!res) return { price: null, description: null };
  try {
    const data = await res.json();
    return { price: data.price ?? null, description: data.description ?? null };
  } catch { return { price: null, description: null }; }
}

async function trendyolSearch(query) {
  const r = await safeFetch(
    `https://public.trendyol.com/discovery-web-searchgw-service/api/filter/search/v2?q=${encodeURIComponent(query)}&pi=1&culture=tr-TR&userGenderId=1&priceBucketId=1&scoringAlgorithmId=2&categoryRelevancyEnabled=false&isLegalRequirementConfirmed=false&searchStrategyType=DEFAULT&productStampType=TypeA`,
    { headers: { "User-Agent": UA, Accept: "application/json", "Accept-Language": "tr-TR,tr;q=0.9", Origin: "https://www.trendyol.com", Referer: "https://www.trendyol.com/" } },
    9000
  );
  if (!r) return { price: null, productUrl: null };
  try {
    const data = await r.json();
    const first = data?.result?.products?.[0];
    if (!first) return { price: null, productUrl: null };
    const price = first?.price?.sellingPrice?.value ?? first?.price?.discountedPrice?.value ?? first?.priceInfo?.price ?? null;
    const productUrl = first?.url ? (first.url.startsWith("http") ? first.url : `https://www.trendyol.com${first.url}`) : null;
    return { price: price ?? null, productUrl };
  } catch { return { price: null, productUrl: null }; }
}

async function trendyolDesc(productUrl) {
  const res = await safeFetch(productUrl, {
    headers: { "User-Agent": UA_MOBILE, Accept: "text/html", "Accept-Language": "tr-TR,tr;q=0.9", Referer: "https://m.trendyol.com/" }
  }, 7000);
  if (!res) return null;
  try {
    const html = await res.text();
    const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nd) {
      try {
        const j = JSON.parse(nd[1]);
        const pp = j?.props?.pageProps;
        const desc = pp?.product?.description ?? pp?.productDetail?.description ?? pp?.initialState?.productDetail?.product?.description;
        if (desc && String(desc).length > 20) return cleanText(String(desc)).slice(0, 800);
      } catch {}
    }
    for (const m of Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))) {
      try {
        const d = JSON.parse(m[1]).description;
        if (d && d.length > 20) return cleanText(d).slice(0, 800);
      } catch {}
    }
    const meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{40,})["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']{40,})["'][^>]+name=["']description["']/i);
    return meta?.[1] ? cleanText(meta[1]).slice(0, 800) : null;
  } catch { return null; }
}

function calcComparePrice(price) {
  const rates = [0.10, 0.12, 0.15, 0.18, 0.20, 0.25, 0.30, 0.35, 0.40];
  const rate = rates[Math.floor(Math.random() * rates.length)];
  return Math.ceil(price * (1 + rate) / 5) * 5;
}

function isPriceReasonable(currentPrice, newPrice) {
  if (!newPrice || newPrice <= 0) return false;
  const cur = parseFloat(currentPrice.toString());
  if (cur <= 0) return true;
  return newPrice >= cur * 0.08 && newPrice <= cur * 10;
}

async function processProduct(p) {
  const br = p.brand?.name?.trim() ?? "";
  const nameHasBrand = br.length > 2 && p.name.toLowerCase().includes(br.toLowerCase());
  const fullQ = !nameHasBrand && br ? `${br} ${p.name}` : p.name;
  const barcode = p.barcode ?? p.sku ?? null;

  let price = null, description = null;

  const proxy = await fetchProxy(fullQ, barcode, br || null);
  if (proxy.price) price = proxy.price;
  if (proxy.description) description = proxy.description;

  if (!price || !description) {
    const queries = barcode ? [barcode, fullQ] : [fullQ];
    for (const q of queries) {
      if (price && description) break;
      const ty = await trendyolSearch(q);
      if (!price && ty.price) price = ty.price;
      if (!description && ty.productUrl) {
        await sleep(120);
        description = await trendyolDesc(ty.productUrl);
      }
    }
  }

  const priceOk = isPriceReasonable(p.price, price);
  const descOk = !!(description && description.length > 20);

  return {
    id: p.id,
    priceOk,
    descOk,
    newPrice: priceOk ? price : null,
    description: descOk ? description.trim() : null,
  };
}

async function main() {
  const log = (m) => process.stdout.write(m + "\n");
  log(`📦 Chunk: offset=${OFFSET} limit=${LIMIT} batch=${BATCH_SIZE}`);

  const products = await db.product.findMany({
    select: { id: true, name: true, sku: true, barcode: true, price: true, brand: { select: { name: true } } },
    orderBy: { id: "asc" },
    skip: OFFSET,
    take: LIMIT,
  });

  log(`✅ ${products.length} ürün alındı\n`);

  let priceOk = 0, descOk = 0, written = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(p => processProduct(p)));

    const toWrite = results.filter(r => r.priceOk || r.descOk);
    if (toWrite.length > 0) {
      await db.$transaction(
        toWrite.map(r => {
          const data = {};
          if (r.priceOk) { data.price = r.newPrice; data.comparePrice = calcComparePrice(r.newPrice); }
          if (r.descOk) data.description = r.description;
          return db.product.update({ where: { id: r.id }, data });
        })
      );
      written += toWrite.length;
    }

    for (const r of results) {
      if (r.priceOk) priceOk++;
      if (r.descOk) descOk++;
    }

    const done = Math.min(i + BATCH_SIZE, products.length);
    log(`[${done}/${products.length}] fiyat:${priceOk} açıklama:${descOk} yazılan:${written}`);

    if (i + BATCH_SIZE < products.length) await sleep(DELAY_MS);
  }

  await db.$disconnect();
  log(`\n✅ TAMAMLANDI | fiyat:${priceOk} açıklama:${descOk} toplam yazılan:${written}`);
}

main().catch(async e => { console.error("HATA:", e.message); await db.$disconnect(); process.exit(1); });
