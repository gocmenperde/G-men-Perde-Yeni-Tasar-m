import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function calcComparePrice(realPrice: number): number {
  const rates = [0.10, 0.12, 0.15, 0.18, 0.20, 0.25, 0.30];
  const rate = rates[Math.floor(Math.random() * rates.length)];
  return Math.ceil(realPrice * (1 + rate) / 5) * 5;
}

async function searchViaProxy(name: string, barcode?: string | null, brand?: string | null): Promise<{ price: number | null }> {
  const proxyUrl = process.env.SEARCH_PROXY_URL;
  if (!proxyUrl) return { price: null };
  const params = new URLSearchParams({ q: name });
  if (barcode) params.set("barcode", barcode);
  if (brand) params.set("brand", brand);
  const secret = process.env.SEARCH_PROXY_SECRET;
  try {
    const res = await fetch(`${proxyUrl}?${params}`, {
      headers: {
        Accept: "application/json",
        ...(secret ? { "x-search-proxy-secret": secret } : {}),
      },
      signal: AbortSignal.timeout(35000),
    });
    if (!res.ok) return { price: null };
    const data = await res.json();
    return { price: data.price ?? null };
  } catch { return { price: null }; }
}

async function searchTrendyolPrice(query: string): Promise<number | null> {
  try {
    const r = await fetch(
      `https://public.trendyol.com/discovery-web-searchgw-service/api/filter/search/v2` +
      `?q=${encodeURIComponent(query)}&pi=1&culture=tr-TR&userGenderId=1&priceBucketId=1&scoringAlgorithmId=2`,
      {
        headers: { "User-Agent": UA, Accept: "application/json", Origin: "https://www.trendyol.com" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!r.ok) return null;
    const data = await r.json() as { result?: { products?: { price?: { sellingPrice?: { value?: number }; discountedPrice?: { value?: number } }; priceInfo?: { price?: number } }[] } };
    const first = data?.result?.products?.[0];
    if (!first) return null;
    return first?.price?.sellingPrice?.value ?? first?.price?.discountedPrice?.value ?? first?.priceInfo?.price ?? null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Otomatik fiyat arama devre dışıdır. Fiyatlar CSV/XLSX ile yönetilir." },
    { status: 410 },
  );
}

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Otomatik fiyat arama devre dışıdır. Fiyatlar CSV/XLSX ile yönetilir." },
    { status: 410 },
  );
}
