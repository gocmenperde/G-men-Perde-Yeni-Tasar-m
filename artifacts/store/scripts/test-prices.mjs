import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: [],
  datasources: { db: { url: process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL } },
});
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const UA_MOBILE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü").replace(/&ccedil;/g, "ç")
    .replace(/&icirc;/g, "î").replace(/&Ouml;/g, "Ö").replace(/&Uuml;/g, "Ü")
    .replace(/&Ccedil;/g, "Ç").replace(/&scaron;/g, "ş").replace(/&Scaron;/g, "Ş")
    .replace(/&iuml;/g, "ï").replace(/&eacute;/g, "é").replace(/&#\d+;/g, "");
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

async function trendyolSearch(query) {
  const r = await safeFetch(
    `https://public.trendyol.com/discovery-web-searchgw-service/api/filter/search/v2?q=${encodeURIComponent(query)}&pi=1&culture=tr-TR&userGenderId=1&priceBucketId=1&scoringAlgorithmId=2&categoryRelevancyEnabled=false&isLegalRequirementConfirmed=false&searchStrategyType=DEFAULT&productStampType=TypeA`,
    { headers: { "User-Agent": UA, Accept: "application/json", "Accept-Language": "tr-TR,tr;q=0.9", Origin: "https://www.trendyol.com", Referer: "https://www.trendyol.com/" } },
    10000
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
  const res = await safeFetch(productUrl, { headers: { "User-Agent": UA_MOBILE, Accept: "text/html", "Accept-Language": "tr-TR,tr;q=0.9", Referer: "https://m.trendyol.com/" } }, 8000);
  if (!res) return null;
  try {
    const html = await res.text();
    const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nd) {
      try {
        const j = JSON.parse(nd[1]);
        const pp = j?.props?.pageProps;
        const desc = pp?.product?.description ?? pp?.productDetail?.description ?? pp?.initialState?.productDetail?.product?.description;
        if (desc && String(desc).length > 20) return cleanText(String(desc)).slice(0, 300);
      } catch {}
    }
    for (const m of Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))) {
      try {
        const d = JSON.parse(m[1]).description;
        if (d && d.length > 20) return cleanText(d).slice(0, 300);
      } catch {}
    }
    const meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{40,})["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']{40,})["'][^>]+name=["']description["']/i);
    return meta?.[1]?.trim().slice(0, 300) ?? null;
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
    30000,
  );
  if (!res) return { price: null, description: null };
  try {
    const data = await res.json();
    return { price: data.price ?? null, description: data.description ?? null };
  } catch { return { price: null, description: null }; }
}

async function main() {
  const LIMIT = parseInt(process.env.TEST_LIMIT || "20");
  const OFFSET = parseInt(process.env.TEST_OFFSET || "0");
  const APPLY = process.env.APPLY === "1";

  const products = await db.product.findMany({
    select: { id: true, name: true, sku: true, barcode: true, price: true, description: true, brand: { select: { name: true } } },
    orderBy: { updatedAt: "asc" },
    skip: OFFSET,
    take: LIMIT,
  });

  console.log(`\n📦 ${products.length} ürün işlenecek (offset: ${OFFSET}, apply: ${APPLY})\n`);
  console.log("=".repeat(90));

  const results = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const br = p.brand?.name?.trim() ?? "";
    const nameHasBrand = br.length > 2 && p.name.toLowerCase().includes(br.toLowerCase());
    const fullQ = !nameHasBrand && br ? `${br} ${p.name}` : p.name;
    const barcode = p.barcode ?? p.sku ?? null;

    process.stdout.write(`[${i + 1}/${products.length}] ${p.name.slice(0, 50)}... `);

    let price = null, description = null, source = "";

    // 1. Proxy
    const proxy = await fetchProxy(fullQ, barcode, br || null);
    if (proxy.price) { price = proxy.price; source = "Proxy"; }
    if (proxy.description) description = proxy.description;

    // 2. Trendyol fallback
    if (!price || !description) {
      const queries = barcode ? [barcode, fullQ] : [fullQ];
      for (const q of queries) {
        if (price && description) break;
        const ty = await trendyolSearch(q);
        if (!price && ty.price) { price = ty.price; source = "Trendyol"; }
        if (!description && ty.productUrl) {
          await sleep(200);
          description = await trendyolDesc(ty.productUrl);
        }
        if (!price && !description) await sleep(500);
      }
    }

    const currentPrice = parseFloat(p.price.toString());
    const priceOk = price && price > 0;
    const descOk = description && description.length > 20;

    console.log(`${priceOk ? "✅" : "❌"} fiyat:${price ? price + "₺" : "YOK"} | ${descOk ? "✅" : "❌"} açıklama:${descOk ? description.slice(0, 40) + "..." : "YOK"} [${source}]`);

    results.push({
      id: p.id,
      name: p.name,
      currentPrice,
      newPrice: priceOk ? price : null,
      description: descOk ? description : null,
      source,
    });

    if (APPLY && (priceOk || descOk)) {
      const data = {};
      if (priceOk) {
        data.price = price;
        const rates = [0.10, 0.12, 0.15, 0.18, 0.20, 0.25, 0.30, 0.35, 0.40];
        const rate = rates[Math.floor(Math.random() * rates.length)];
        data.comparePrice = Math.ceil(price * (1 + rate) / 5) * 5;
      }
      if (descOk) data.description = description.trim();
      await db.product.update({ where: { id: p.id }, data });
    }

    await sleep(400);
  }

  console.log("\n" + "=".repeat(90));
  const withPrice = results.filter(r => r.newPrice).length;
  const withDesc = results.filter(r => r.description).length;
  console.log(`\n📊 Sonuç: ${withPrice}/${products.length} fiyat bulundu | ${withDesc}/${products.length} açıklama bulundu`);

  if (!APPLY) {
    console.log("\n⚠️  TEST MODU — veritabanına hiçbir şey yazılmadı.");
    console.log("Onaylamak için: APPLY=1 node scripts/test-prices.mjs\n");
  } else {
    console.log("\n✅ Tüm güncellemeler veritabanına yazıldı.\n");
  }

  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
