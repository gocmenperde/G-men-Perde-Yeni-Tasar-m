import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { notifyIndexNow, notifyHomepageRefresh } from "@/lib/indexnow";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/indexnow
 * Tüm aktif ürün URL'lerini IndexNow üzerinden Google/Bing'e bildirir.
 * Admin panelinden manuel tetiklenebilir.
 */
export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const BASE_URL = (
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
    ).replace(/\/$/, "");

    const body = await req.json().catch(() => ({}));
    const mode: "all" | "products" | "homepage" = body.mode ?? "all";

    if (mode === "homepage") {
      await notifyHomepageRefresh();
      return NextResponse.json({ message: "Ana sayfa bildirildi.", count: 2 });
    }

    const products = await db.product.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 10000,
    });

    const productUrls = products.map((p) => `${BASE_URL}/products/${p.slug}`);

    if (mode === "products") {
      await notifyIndexNow(productUrls);
      return NextResponse.json({
        message: `${productUrls.length} ürün bildirildi.`,
        count: productUrls.length,
      });
    }

    // mode === "all"
    const staticUrls = [
      BASE_URL,
      `${BASE_URL}/products`,
      `${BASE_URL}/about`,
      `${BASE_URL}/contact`,
    ];

    const allUrls = [...staticUrls, ...productUrls];

    // IndexNow sınırı: 10.000 URL — gerekirse parçalara böl
    const CHUNK = 500;
    for (let i = 0; i < allUrls.length; i += CHUNK) {
      await notifyIndexNow(allUrls.slice(i, i + CHUNK));
    }

    return NextResponse.json({
      message: `${allUrls.length} URL başarıyla bildirildi (${staticUrls.length} statik + ${productUrls.length} ürün).`,
      count: allUrls.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "IndexNow bildirimi gönderilemedi." },
      { status: 500 }
    );
  }
}
