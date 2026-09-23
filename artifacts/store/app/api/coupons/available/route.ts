import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";
import { getCouponPayQuantity, isPremiumActive } from "@/lib/coupon-rules";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    const account = user
      ? await db.user.findUnique({ where: { id: user.id }, select: { premiumUntil: true } })
      : null;
    const premiumActive = isPremiumActive(account?.premiumUntil);
    const coupons = await db.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        minOrderAmount: true,
        maxOrderAmount: true,
        buyRule: true,
        buyQuantity: true,
        payQuantity: true,
        getQuantity: true,
        buyAmount: true,
        payAmount: true,
        freeProductQuantity: true,
        audience: true,
        premiumOnly: true,
        imageUrl: true,
        expiresAt: true,
      },
    });
    const visible = coupons
      .filter((coupon) => {
        const audience = coupon.audience ?? (coupon.premiumOnly ? "PREMIUM_ONLY" : "ALL");
        // Premium campaigns remain discoverable to everyone so guests can
        // understand the benefit and upgrade from the cart. Normal-only
        // campaigns are still hidden from active Premium members.
        return audience !== "NORMAL_ONLY" || !premiumActive;
      })
      .map((coupon) => ({
        ...coupon,
        locked:
          (coupon.audience === "PREMIUM_ONLY" || coupon.premiumOnly) &&
          !premiumActive,
        value: Number(coupon.value),
        minOrderAmount: Number(coupon.minOrderAmount),
        maxOrderAmount: coupon.maxOrderAmount == null ? null : Number(coupon.maxOrderAmount),
        payQuantity: getCouponPayQuantity(coupon),
        buyAmount: coupon.buyAmount == null ? null : Number(coupon.buyAmount),
        payAmount: coupon.payAmount == null ? null : Number(coupon.payAmount),
        expiresAt: coupon.expiresAt?.toISOString() ?? null,
      }));
    return NextResponse.json({ data: visible }, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ error: "Kampanyalar alınamadı." }, { status: 500 });
  }
}