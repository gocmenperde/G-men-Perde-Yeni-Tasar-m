import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertDatabaseUrl } from "@/lib/env";

type CouponPayload = { code?: string; orderTotal?: number };

export async function POST(req: NextRequest) {
  try {
    assertDatabaseUrl();

    const { code, orderTotal } = (await req.json()) as CouponPayload;

    if (!code) {
      return NextResponse.json({ error: "Kupon kodu gerekli." }, { status: 400 });
    }

    const coupon = await db.coupon.findFirst({
      where: {
        code,
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Geçersiz kupon kodu." }, { status: 404 });
    }

    if (coupon.minOrder && (orderTotal ?? 0) < Number(coupon.minOrder)) {
      return NextResponse.json({ error: `Bu kupon için minimum sepet tutarı ₺${coupon.minOrder}.` }, { status: 400 });
    }

    return NextResponse.json({
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kupon doğrulanamadı.";

    if (message.includes("DATABASE_URL")) {
      return NextResponse.json({ error: "Sunucu yapılandırması eksik: DATABASE_URL tanımlı değil." }, { status: 503 });
    }

    return NextResponse.json({ error: "Kupon doğrulanamadı." }, { status: 500 });
  }
}
