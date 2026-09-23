import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";
import { isPremiumActive } from "@/lib/coupon-rules";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Premium üyelik için giriş yapınız." }, { status: 401 });

    const settings = await db.siteSettings.findUnique({ where: { id: "global" } });
    if (settings?.premiumEnabled === false) {
      return NextResponse.json({ error: "Premium üyelik şu anda satışa kapalı." }, { status: 400 });
    }

    const account = await db.user.findUnique({
      where: { id: user.id },
      select: { premiumUntil: true },
    });
    const now = new Date();
    const startsAt = isPremiumActive(account?.premiumUntil, now)
      ? new Date(account!.premiumUntil!)
      : now;
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const membership = await db.premiumMembership.create({
      data: {
        userId: user.id,
        status: "AWAITING_PAYMENT",
        amount: Number(settings?.premiumPrice ?? 79),
        startsAt,
        expiresAt,
      },
    });
    return NextResponse.json({
      data: { membershipId: membership.id, amount: Number(membership.amount), expiresAt },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[PREMIUM_CREATE_PAYMENT]", error);
    return NextResponse.json({ error: error?.message ?? "Premium ödemesi başlatılamadı." }, { status: 500 });
  }
}