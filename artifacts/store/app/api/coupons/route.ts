import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: coupons });
  } catch {
    return NextResponse.json({ error: "Kuponlar alınamadı." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isAdminAuthorized(req)) return unauthorizedResponse();
    const body = await req.json();
    const {
      code,
      type = "PERCENTAGE",
      value = 0,
      minOrderAmount,
      maxOrderAmount,
      maxUses,
      expiresAt,
      scope = "ALL",
      targetId,
      ruleType = "DISCOUNT",
      buyRule = "QUANTITY",
      buyQuantity,
      payQuantity,
      getQuantity,
      buyAmount,
      payAmount,
      freeProductId,
      freeProductQuantity = 1,
      premiumOnly = false,
      audience = premiumOnly ? "PREMIUM_ONLY" : "ALL",
      imageUrl,
    } = body;
    const allowedTypes = ["PERCENTAGE", "FIXED", "FREE_SHIPPING", "FREE_PRODUCT", "BUY_X_GET_Y"];
    const allowedScopes = ["ALL", "PRODUCT", "CATEGORY", "BRAND"];
    const allowedBuyRules = ["QUANTITY", "AMOUNT"];
    const allowedAudiences = ["ALL", "PREMIUM_ONLY", "NORMAL_ONLY"];
    if (!code || !allowedTypes.includes(type) || !allowedScopes.includes(scope) || !allowedBuyRules.includes(buyRule) || !allowedAudiences.includes(audience))
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    if (type !== "FREE_SHIPPING" && Number(value) <= 0 && type !== "FREE_PRODUCT" && type !== "BUY_X_GET_Y") {
      return NextResponse.json({ error: "İndirim değeri sıfırdan büyük olmalıdır." }, { status: 400 });
    }
    if (scope !== "ALL" && !targetId) {
      return NextResponse.json({ error: "Hedef ürün, kategori veya marka seçin." }, { status: 400 });
    }
    if (type === "FREE_PRODUCT" && !freeProductId) {
      return NextResponse.json({ error: "Ücretsiz ürün seçin." }, { status: 400 });
    }
    if (type === "BUY_X_GET_Y" && buyRule === "QUANTITY" && (
      !Number.isInteger(Number(buyQuantity)) ||
      !Number.isInteger(Number(payQuantity)) ||
      Number(buyQuantity) < 2 ||
      Number(payQuantity) < 1 ||
      Number(payQuantity) >= Number(buyQuantity)
    )) {
      return NextResponse.json({ error: "Kampanya toplam adedini ve ödenecek adedi doğru girin." }, { status: 400 });
    }
    if (type === "BUY_X_GET_Y" && buyRule === "AMOUNT" && (
      Number(buyAmount) <= 0 ||
      Number(payAmount) < 0 ||
      Number(payAmount) >= Number(buyAmount)
    )) {
      return NextResponse.json({ error: "Alış tutarı, ödeme tutarından büyük olmalıdır." }, { status: 400 });
    }
    const existing = await db.coupon.findFirst({
      where: { code: code.toUpperCase() },
    });
    if (existing)
      return NextResponse.json(
        { error: "Bu kupon kodu zaten kullanımda." },
        { status: 409 },
      );
    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: Number(value) || 0,
        minOrderAmount: Number(minOrderAmount) || 0,
        maxOrderAmount: maxOrderAmount ? Number(maxOrderAmount) : null,
        scope,
        targetId: targetId || null,
        ruleType,
         buyRule,
         buyQuantity: type === "BUY_X_GET_Y" && buyRule === "QUANTITY" ? Number(buyQuantity) : null,
         payQuantity: type === "BUY_X_GET_Y" && buyRule === "QUANTITY" ? Number(payQuantity) : null,
         getQuantity: type === "BUY_X_GET_Y" && buyRule === "QUANTITY"
           ? Math.max(1, Number(buyQuantity) - Number(payQuantity))
           : null,
         buyAmount: type === "BUY_X_GET_Y" && buyRule === "AMOUNT" ? Number(buyAmount) : null,
         payAmount: type === "BUY_X_GET_Y" && buyRule === "AMOUNT" ? Number(payAmount) : null,
        freeProductId: freeProductId || null,
        freeProductQuantity: Math.max(1, Number(freeProductQuantity) || 1),
         premiumOnly: audience === "PREMIUM_ONLY",
         audience,
         imageUrl: typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kupon oluşturulamadı." },
      { status: 500 },
    );
  }
}
