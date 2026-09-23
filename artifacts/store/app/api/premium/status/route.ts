import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";
import { isPremiumActive } from "@/lib/coupon-rules";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const fallback = {
    enabled: true,
    price: 79,
    discountType: "PERCENTAGE",
    discountValue: 10,
    freeShipping: true,
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
          active: false,
          premiumUntil: null,
        },
      });
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
        active: isPremiumActive(account?.premiumUntil),
        premiumUntil: account?.premiumUntil?.toISOString() ?? null,
      },
    });
  } catch (error) {
    // The information page must remain usable while a deployment database is
    // being migrated. Payment creation still fails explicitly until the DB is
    // ready, rather than leaving the customer on an endless spinner.
    console.error("[PREMIUM_STATUS]", error);
    return NextResponse.json({ data: fallback });
  }
}