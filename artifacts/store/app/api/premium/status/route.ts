import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";
import { isPremiumActive } from "@/lib/coupon-rules";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  const settings = await db.siteSettings.findUnique({ where: { id: "global" } });
  if (!user) {
    return NextResponse.json({
      data: {
        enabled: settings?.premiumEnabled !== false,
        price: Number(settings?.premiumPrice ?? 79),
        discountType: settings?.premiumDiscountType ?? "PERCENTAGE",
        discountValue: Number(settings?.premiumDiscountValue ?? 10),
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
      price: Number(settings?.premiumPrice ?? 79),
      discountType: settings?.premiumDiscountType ?? "PERCENTAGE",
      discountValue: Number(settings?.premiumDiscountValue ?? 10),
      freeShipping: settings?.premiumFreeShipping !== false,
      active: isPremiumActive(account?.premiumUntil),
      premiumUntil: account?.premiumUntil?.toISOString() ?? null,
    },
  });
}