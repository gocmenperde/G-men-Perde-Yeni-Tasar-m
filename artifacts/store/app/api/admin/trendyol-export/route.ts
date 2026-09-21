import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUPPLIER_ID = (process.env.TRENDYOL_SUPPLIER_ID ?? "").trim();
const API_KEY = (process.env.TRENDYOL_API_KEY ?? "").trim();
const API_SECRET = (process.env.TRENDYOL_API_SECRET ?? "").trim();
const INTEGRATION_CODE = (process.env.TRENDYOL_INTEGRATION_CODE ?? "SelfIntegration").trim();
const BASE_URL = "https://api.trendyol.com/sapigw";

function authHeader() {
  const token = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
    "User-Agent": `${SUPPLIER_ID} - ${INTEGRATION_CODE}`,
  };
}

async function trendyolRequest(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeader(), ...(options.headers ?? {}) },
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, data: json };
}

// GET: Trendyol'daki mevcut ürünleri getir
export async function GET(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  if (!SUPPLIER_ID || !API_KEY || !API_SECRET) {
    return NextResponse.json({ error: "Trendyol API bilgileri eksik (TRENDYOL_SUPPLIER_ID, TRENDYOL_API_KEY, TRENDYOL_API_SECRET)" }, { status: 500 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") ?? "0");
  const size = 50;

  const result = await trendyolRequest(
    `/suppliers/${SUPPLIER_ID}/products?approved=true&page=${page}&size=${size}`
  );

  if (!result.ok) {
    return NextResponse.json({ error: `Trendyol API hatası: ${result.status}`, detail: result.data }, { status: result.status });
  }

  return NextResponse.json({
    products: result.data?.content ?? [],
    totalPages: result.data?.totalPages ?? 0,
    totalElements: result.data?.totalElements ?? 0,
    page,
  });
}

// POST: Seçilen ürünleri Trendyol'a gönder
export async function POST(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  if (!SUPPLIER_ID || !API_KEY || !API_SECRET) {
    return NextResponse.json({ error: "Trendyol API bilgileri eksik" }, { status: 500 });
  }

  const { productIds, categoryId, brandId }: {
    productIds: string[];
    categoryId: number;
    brandId: number;
  } = await req.json();

  if (!Array.isArray(productIds) || !productIds.length) {
    return NextResponse.json({ error: "Ürün seçilmedi" }, { status: 400 });
  }
  if (!categoryId || !brandId) {
    return NextResponse.json({ error: "Trendyol kategori ID ve marka ID zorunludur" }, { status: 400 });
  }

  const bkmProductIds = productIds.filter((id) => typeof id === "string" && id.startsWith("bkm_"));
  if (bkmProductIds.length > 0) {
    return NextResponse.json(
      { error: "BKM'den eklenen ürünler Trendyol'a gönderilemez." },
      { status: 400 },
    );
  }

  // DB'den ürünleri çek
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { brand: true, category: true },
  });

  if (!products.length) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }

  // 100 TL ve altı → 2.5 kat, üstü → 2 kat
  function getMarkup(price: number) { return price <= 100 ? 2.5 : 2.0; }

  // Trendyol ürün formatına çevir
  const items = products.map((p) => {
    const markup    = getMarkup(Number(p.price));
    const salePrice = Math.ceil(Number(p.price) * markup * 100) / 100;
    const listPrice = p.comparePrice
      ? Math.ceil(Number(p.comparePrice) * markup * 100) / 100
      : salePrice;

    return {
      barcode: p.sku ?? p.id,
      title: p.name,
      productMainId: p.sku ?? p.id,
      brandId,
      categoryId,
      quantity: p.stock,
      stockCode: p.sku ?? p.id,
      dimensionalWeight: Number(p.weight ?? 1),
      description: p.description ?? p.name,
      currencyType: "TRY",
      listPrice,
      salePrice,
      vatRate: 20,
      cargoCompanyId: 10,
      images: (p.images ?? []).slice(0, 8).map((url: string) => ({ url })),
      attributes: [],
    };
  });

  const result = await trendyolRequest(
    `/suppliers/${SUPPLIER_ID}/v2/products`,
    {
      method: "POST",
      body: JSON.stringify({ items }),
    }
  );

  if (!result.ok) {
    return NextResponse.json({
      error: `Trendyol API hatası (${result.status})`,
      detail: result.data,
    }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    batchRequestId: result.data?.batchRequestId,
    message: `${items.length} ürün Trendyol'a gönderildi. Onay için Trendyol Satıcı Paneli'ni kontrol edin.`,
  });
}
