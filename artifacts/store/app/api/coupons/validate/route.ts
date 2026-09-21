import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const limit = checkRateLimit(`coupon:${ip}`, 20, 60 * 1000);
  if (!limit.success)
    return NextResponse.json({ error: "Çok fazla istek. Lütfen bekleyin." }, { status: 429 });

  try {
    const { code, amount } = await req.json();
    if (!code)
      return NextResponse.json(
        { error: "Kupon kodu gerekli." },
        { status: 400 },
      );
    const coupon = await db.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!coupon)
      return NextResponse.json(
        { error: "Kupon bulunamadı veya geçersiz." },
        { status: 404 },
      );
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      return NextResponse.json(
        { error: "Kupon kullanım limitine ulaştı." },
        { status: 400 },
      );
    if (
      amount &&
      Number(coupon.minOrderAmount) > 0 &&
      amount < Number(coupon.minOrderAmount)
    )
      return NextResponse.json(
        {
          error: `Minimum sipariş tutarı ₺${Number(coupon.minOrderAmount).toLocaleString("tr-TR")}`,
        },
        { status: 400 },
      );
    const discount =
      coupon.type === "PERCENTAGE"
        ? (amount * Number(coupon.value)) / 100
        : Number(coupon.value);
    return NextResponse.json({
      data: coupon,
      discount: Math.min(discount, amount),
    });
  } catch {
    return NextResponse.json(
      { error: "Kupon doğrulanamadı." },
      { status: 500 },
    );
  }
}
