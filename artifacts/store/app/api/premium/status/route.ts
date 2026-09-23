import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";
import { isPremiumActive } from "@/lib/coupon-rules";

export const dynamic = "force-dynamic";
const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "private, no-store",
  "Vercel-CDN-Cache-Control": "private, no-store",
};

export async function GET(req: NextRequest) {
  const fallback = {
    enabled: true,
    price: 79,
    discountType: "PERCENTAGE",
    discountValue: 10,
    freeShipping: true,
    logoText: "Göçmen Premium Üyesi",
    active: false,
    premiumUntil: null,
  };

  try {
    const user = await getUserFromToken(req);
    const settings = await db.siteSettings.findUnique({ where: { id: "global" } });
    if (!user) {
      return NextResponse.json({
        data: {
          enabled: settings?.premiumEnabled !== false,
          price: Number(settings?.premiumPrice ?? fallback.price),
          discountType: settings?.premiumDiscountType ?? fallback.discountType,
          discountValue: Number(settings?.premiumDiscountValue ?? fallback.discountValue),
          freeShipping: settings?.premiumFreeShipping !== false,
          logoText: settings?.premiumLogoText ?? fallback.logoText,
          active: false,
          premiumUntil: null,
        },
      }, { headers: NO_STORE_HEADERS });
    }

    const account = await db.user.findUnique({
      where: { id: user.id },
      select: { premiumUntil: true },
    });
    return NextResponse.json({
      data: {
        enabled: settings?.premiumEnabled !== false,
        price: Number(settings?.premiumPrice ?? fallback.price),
        discountType: settings?.premiumDiscountType ?? fallback.discountType,
        discountValue: Number(settings?.premiumDiscountValue ?? fallback.discountValue),
        freeShipping: settings?.premiumFreeShipping !== false,
        logoText: settings?.premiumLogoText ?? fallback.logoText,
        active: isPremiumActive(account?.premiumUntil),
        premiumUntil: account?.premiumUntil?.toISOString() ?? null,
      },
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    // The information page must remain usable while a deployment database is
    // being migrated. Payment creation still fails explicitly until the DB is
    // ready, rather than leaving the customer on an endless spinner.
    console.error("[PREMIUM_STATUS]", error);
    return NextResponse.json({ data: fallback }, { headers: NO_STORE_HEADERS });
  }
}