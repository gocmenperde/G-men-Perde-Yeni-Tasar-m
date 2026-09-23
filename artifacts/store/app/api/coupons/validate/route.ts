import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { evaluateCoupon, isPremiumActive, type CouponCartItem } from "@/lib/coupon-rules";
import { getUserFromToken } from "@/lib/get-user-token";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const limit = checkRateLimit(`coupon:${ip}`, 20, 60 * 1000);
  if (!limit.success)
    return NextResponse.json({ error: "Çok fazla istek. Lütfen bekleyin." }, { status: 429 });

  try {
    const { code, items = [] } = await req.json();
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
    const user = await getUserFromToken(req);
    const currentUser = user
      ? await db.user.findUnique({ where: { id: user.id }, select: { premiumUntil: true } })
      : null;
    const cartItems: CouponCartItem[] = Array.isArray(items)
      ? items
          .map((item: any) => ({
            productId: String(item.productId ?? ""),
            quantity: Math.max(0, Number(item.quantity ?? 0)),
            price: Math.max(0, Number(item.price ?? 0)),
          }))
          .filter((item) => item.productId && item.quantity > 0)
      : [];
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Sepet ürünleri bulunamadı." }, { status: 400 });
    }
    const products = await db.product.findMany({
      where: { id: { in: cartItems.map((item) => item.productId) }, isActive: true },
      select: { id: true, price: true, categoryId: true, brandId: true },
    });
    const evaluation = evaluateCoupon(
      coupon,
      products.map((product) => ({ ...product, price: Number(product.price) })),
      cartItems,
      isPremiumActive(currentUser?.premiumUntil),
    );
    return NextResponse.json({
      data: coupon,
      discount: evaluation.discount,
      freeShipping: evaluation.freeShipping,
      eligibleSubtotal: evaluation.eligibleSubtotal,
      message: evaluation.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Kupon doğrulanamadı." },
      { status: error?.message ? 400 : 500 },
    );
  }
}
