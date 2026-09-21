import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import https from "https";

export const dynamic = "force-dynamic";

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json, */*",
          "Accept-Language": "tr-TR,tr;q=0.9",
          "Referer": "https://www.hepsiburada.com/",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", () => resolve(""));
    req.setTimeout(15000, () => { req.destroy(); resolve(""); });
  });
}

async function fetchCategoriesFromSearch(q: string): Promise<{ id: string; name: string }[]> {
  const url = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(q)}&sayfa=1`;
  const body = await httpsGet(url);
  if (!body) return [];

  try {
    const match = body.match(/__NEXT_DATA__[^>]*?>\s*(\{[\s\S]*?\})\s*<\/script>/);
    if (!match) return [];
    const json = JSON.parse(match[1]);
    const products: any[] =
      json?.props?.pageProps?.products ?? json?.props?.pageProps?.initialState?.products ?? [];

    const seen = new Map<string, string>();
    for (const p of products) {
      const catId: string | undefined = String(p.categoryId ?? p.category?.id ?? "");
      const catName: string | undefined = p.categoryName ?? p.category?.name;
      if (catId && catId !== "undefined" && catName && !seen.has(catId)) {
        seen.set(catId, catName);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).slice(0, 20);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const results = await fetchCategoriesFromSearch(q);
  return NextResponse.json(results);
}
