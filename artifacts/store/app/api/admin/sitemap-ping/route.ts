import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { getIndexNowKey } from "@/lib/indexnow";

export const dynamic = "force-dynamic";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "").replace(/^http:/, "https:");

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const host = BASE_URL.replace(/https?:\/\//, "");
  const indexNowKey = await getIndexNowKey();

  const results: Record<string, string> = {};

  // Google ve Bing artık eski ping URL'lerini desteklemiyor (Google 404, Bing 410).
  // Her ikisi de IndexNow protokolünü kullanıyor; tek çağrıyla her ikisine de iletilir.
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation: `${BASE_URL}/${indexNowKey}.txt`,
        urlList: [sitemapUrl, BASE_URL, `${BASE_URL}/products`],
      }),
      signal: AbortSignal.timeout(15000),
    });

    // IndexNow: 200 veya 202 başarı sayılır
    const ok = res.status === 200 || res.status === 202;
    const label = ok ? "✅ Başarılı" : `⚠️ HTTP ${res.status}`;
    results.google = label;
    results.bing = label;
  } catch (e) {
    const msg = `❌ Hata: ${String(e).slice(0, 60)}`;
    results.google = msg;
    results.bing = msg;
  }

  return NextResponse.json({
    sitemapUrl,
    results,
    note: "Google ve Bing sitemap'inizi aldı. İndeksleme birkaç gün içinde başlar.",
  });
}
