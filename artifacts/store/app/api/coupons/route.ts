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
      buyQuantity,
      getQuantity,
      freeProductId,
      freeProductQuantity = 1,
      premiumOnly = false,
    } = body;
    const allowedTypes = ["PERCENTAGE", "FIXED", "FREE_SHIPPING", "FREE_PRODUCT", "BUY_X_GET_Y"];
    const allowedScopes = ["ALL", "PRODUCT", "CATEGORY", "BRAND"];
    if (!code || !allowedTypes.includes(type) || !allowedScopes.includes(scope))
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
    if (type === "BUY_X_GET_Y" && (!Number(buyQuantity) || !Number(getQuantity))) {
      return NextResponse.json({ error: "Al ve bedava adetlerini girin." }, { status: 400 });
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
        buyQuantity: buyQuantity ? Number(buyQuantity) : null,
        getQuantity: getQuantity ? Number(getQuantity) : null,
        freeProductId: freeProductId || null,
        freeProductQuantity: Math.max(1, Number(freeProductQuantity) || 1),
        premiumOnly: Boolean(premiumOnly),
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
