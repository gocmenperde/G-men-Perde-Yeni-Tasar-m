import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import https from "https";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SELLER_ID = "1249327";

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json, text/html,*/*",
          "Accept-Language": "tr-TR,tr;q=0.9",
          "Referer": "https://www.trendyol.com/",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", () => resolve(""));
    req.setTimeout(20000, () => { req.destroy(); resolve(""); });
  });
}

function parseHtmlProducts(html: string): any[] {
  try {
    const match = html.match(/window\.__SEARCH_APP_INITIAL_STATE__\s*=\s*([\s\S]*?);?\s*<\/script>/)
      ?? html.match(/__NEXT_DATA__.*?=\s*([\s\S]*?)\s*<\/script>/);
    if (!match) return [];
    const json = JSON.parse(match[1]);
    const products =
      json?.initialState?.productList?.products
      ?? json?.props?.pageProps?.products
      ?? json?.result?.products
      ?? [];
    return products;
  } catch {
    return [];
  }
}

async function fetchFromApi(page: number): Promise<{ products: any[]; total: number }> {
  const apiUrl = `https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?pId=${SELLER_ID}&st=3&sst=0&os=1&pi=${page}&sk=1`;
  const body = await httpsGet(apiUrl);
  if (!body) return { products: [], total: 0 };
  try {
    const json = JSON.parse(body);
    const products = json?.result?.products ?? json?.data?.products ?? [];
    const total = json?.result?.totalCount ?? json?.data?.totalCount ?? 0;
    return { products, total };
  } catch {
    return { products: [], total: 0 };
  }
}

async function fetchFromHtml(page: number): Promise<{ products: any[]; total: number }> {
  const url = `https://www.trendyol.com/magaza/gocmen-perde-kirtasiye-m-${SELLER_ID}?sst=0&sk=1&pi=${page}`;
  const html = await httpsGet(url);
  const products = parseHtmlProducts(html);
  return { products, total: products.length > 0 ? 999 : 0 };
}

function mapProduct(p: any) {
  const name: string = p.name ?? p.productName ?? "";
  const brand: string = p.brand?.name ?? p.brandName ?? "";
  const categoryName: string = p.category?.name ?? p.categoryName ?? "Genel";
  const price: number = p.price?.discountedPrice?.value ?? p.price?.originalPrice?.value ?? p.discountedPrice ?? p.price ?? 0;
  const comparePrice: number | null = p.price?.originalPrice?.value !== p.price?.discountedPrice?.value
    ? (p.price?.originalPrice?.value ?? null)
    : null;
  const image: string = p.image
    ? (p.image.startsWith("http") ? p.image : `https://cdn.dsmcdn.com${p.image}`)
    : (p.images?.[0] ?? "");
  const url: string = p.url ?? "";
  const trendyolId: string = String(p.id ?? p.productCode ?? "");
  const slug = name
    .toLowerCase()
    .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .substring(0, 80) + (trendyolId ? `-${trendyolId}` : "");

  return { name, brand, categoryName, price, comparePrice, image, url, trendyolId, slug };
}

export async function GET(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");

    let result = await fetchFromApi(page);
    if (result.products.length === 0) {
      result = await fetchFromHtml(page);
    }

    const mapped = result.products.map(mapProduct).filter((p) => p.name && p.price > 0);
    return NextResponse.json({ products: mapped, total: result.total, page });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const { products: toImport }: { products: ReturnType<typeof mapProduct>[] } = await req.json();
    if (!Array.isArray(toImport) || toImport.length === 0)
      return NextResponse.json({ error: "Ürün listesi boş" }, { status: 400 });

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const p of toImport) {
      try {
        const exists = await db.product.findFirst({
          where: { OR: [{ slug: p.slug }, { name: p.name }] },
          select: { id: true },
        });
        if (exists) { skipped++; continue; }

        let categoryId: string | null = null;
        if (p.categoryName) {
          const catSlug = p.categoryName
            .toLowerCase()
            .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
            .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const cat = await db.category.upsert({
            where: { slug: catSlug },
            create: { name: p.categoryName, slug: catSlug },
            update: {},
            select: { id: true },
          });
          categoryId = cat.id;
        }

        let brandId: string | null = null;
        if (p.brand) {
          const brandSlug = p.brand
            .toLowerCase()
            .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
            .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const br = await db.brand.upsert({
            where: { slug: brandSlug },
            create: { name: p.brand, slug: brandSlug },
            update: {},
            select: { id: true },
          });
          brandId = br.id;
        }

        await db.product.create({
          data: {
            name: p.name,
            slug: p.slug,
            price: p.price,
            comparePrice: p.comparePrice ?? undefined,
            images: p.image ? [p.image] : [],
            isActive: true,
            isFeatured: false,
            stock: 10,
            categoryId,
            brandId,
            description: `Trendyol'dan içe aktarıldı. Kaynak: https://www.trendyol.com${p.url}`,
          },
        });
        added++;
      } catch (e: any) {
        errors.push(`${p.name}: ${e.message}`);
      }
    }

    return NextResponse.json({ added, skipped, errors: errors.slice(0, 10) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
