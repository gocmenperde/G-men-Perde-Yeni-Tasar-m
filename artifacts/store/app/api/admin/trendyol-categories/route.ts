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

function flattenCategories(cats: any[], result: { id: number; name: string }[] = []) {
  for (const c of cats) {
    if (c.id && c.name) result.push({ id: Number(c.id), name: String(c.name) });
    if (Array.isArray(c.subCategories)) flattenCategories(c.subCategories, result);
  }
  return result;
}

export async function GET(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q || q.length < 2) return NextResponse.json([]);

  if (!SUPPLIER_ID || !API_KEY || !API_SECRET) {
    return NextResponse.json({ apiError: "Trendyol API bilgileri eksik (SUPPLIER_ID, API_KEY, API_SECRET)" });
  }

  try {
    const res = await fetch(`${BASE_URL}/product-categories`, {
      headers: authHeader(),
      signal: AbortSignal.timeout(15000),
    });

    const text = await res.text();

    if (!res.ok) {
      const hint = res.status === 401
        ? "API kimlik bilgileri hatalı — Trendyol Entegrasyon Panelinden API_KEY/SECRET kontrol edin"
        : res.status === 403
        ? "Erişim reddedildi — Supplier ID doğru mu?"
        : `HTTP ${res.status}`;
      return NextResponse.json({ apiError: `Trendyol kategori API hatası: ${hint}` });
    }

    let json: any;
    try { json = JSON.parse(text); } catch {
      return NextResponse.json({ apiError: "Trendyol API geçersiz yanıt döndürdü" });
    }

    const tree: any[] = Array.isArray(json)
      ? json
      : (json?.categories ?? json?.items ?? []);

    if (!tree.length) {
      return NextResponse.json({ apiError: "Trendyol kategori listesi boş döndü" });
    }

    const all = flattenCategories(tree);
    const results = all.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30);
    return NextResponse.json(results);

  } catch (err: any) {
    const msg = err?.name === "TimeoutError" ? "Trendyol API zaman aşımı (15s)" : "Trendyol API bağlantı hatası";
    return NextResponse.json({ apiError: msg });
  }
}
