import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const SUPPLIER_ID      = (process.env.TRENDYOL_SUPPLIER_ID ?? "").trim();
const API_KEY          = (process.env.TRENDYOL_API_KEY ?? "").trim();
const API_SECRET       = (process.env.TRENDYOL_API_SECRET ?? "").trim();
const INTEGRATION_CODE = (process.env.TRENDYOL_INTEGRATION_CODE ?? "SelfIntegration").trim();
const BASE_URL         = "https://api.trendyol.com/sapigw";

function authHeader() {
  const token = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
    "User-Agent": `${SUPPLIER_ID} - ${INTEGRATION_CODE}`,
  };
}

export async function GET(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  if (!SUPPLIER_ID || !API_KEY || !API_SECRET) {
    return NextResponse.json({ apiError: "Trendyol API bilgileri eksik (SUPPLIER_ID, API_KEY, API_SECRET)" });
  }

  try {
    const url = `${BASE_URL}/brands?name=${encodeURIComponent(q)}&page=0&size=20`;
    const res = await fetch(url, {
      headers: authHeader(),
      signal: AbortSignal.timeout(10000),
    });

    const text = await res.text();

    if (!res.ok) {
      const hint = res.status === 401
        ? "API kimlik bilgileri hatalı — Trendyol Entegrasyon Panelinden API_KEY/SECRET kontrol edin"
        : res.status === 403
        ? "Erişim reddedildi — Supplier ID doğru mu?"
        : `HTTP ${res.status}`;
      return NextResponse.json({ apiError: `Trendyol marka API hatası: ${hint}` });
    }

    let json: any;
    try { json = JSON.parse(text); } catch {
      return NextResponse.json({ apiError: "Trendyol API geçersiz yanıt döndürdü" });
    }

    const raw: any[] = Array.isArray(json) ? json : (json?.brands ?? json?.items ?? []);

    const results = raw
      .map((b: any) => ({
        id: Number(b.id ?? b.brandId),
        name: String(b.name ?? b.brandName ?? b.id),
      }))
      .filter((b) => b.id && b.name)
      .slice(0, 20);

    return NextResponse.json(results);

  } catch (err: any) {
    const msg = err?.name === "TimeoutError" ? "Trendyol API zaman aşımı (10s)" : "Trendyol API bağlantı hatası";
    return NextResponse.json({ apiError: msg });
  }
}
