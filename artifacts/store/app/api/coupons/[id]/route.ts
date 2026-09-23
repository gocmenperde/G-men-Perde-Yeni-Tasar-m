import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  const { id } = await params;
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi." });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await isAdminAuthorized(req)) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();

  // The status toggle keeps its small payload for existing callers.
  if (Object.keys(body).every((key) => key === "isActive")) {
    const coupon = await db.coupon.update({
      where: { id },
      data: { isActive: Boolean(body.isActive) },
    });
    return NextResponse.json({ data: coupon });
  }

  const current = await db.coupon.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });

  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);
  const numberField = (key: string, fallback: number | null) => {
    if (!has(key)) return fallback;
    if (body[key] === null || body[key] === "") return null;
    const parsed = Number(body[key]);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const code = String(body.code ?? current.code).trim().toUpperCase();
  const type = String(body.type ?? current.type);
  const scope = String(body.scope ?? current.scope);
  const buyRule = String(body.buyRule ?? current.buyRule);
  const audience = String(body.audience ?? (body.premiumOnly ? "PREMIUM_ONLY" : current.audience));
  const targetId = scope === "ALL" ? null : String(body.targetId ?? current.targetId ?? "").trim() || null;
  const buyQuantity = numberField("buyQuantity", current.buyQuantity);
  const payQuantity = numberField("payQuantity", current.payQuantity);
  const buyAmount = numberField("buyAmount", current.buyAmount == null ? null : Number(current.buyAmount));
  const payAmount = numberField("payAmount", current.payAmount == null ? null : Number(current.payAmount));
  const value = numberField("value", Number(current.value)) ?? 0;
  const minOrderAmount = numberField("minOrderAmount", Number(current.minOrderAmount)) ?? 0;
  const maxOrderAmount = numberField(
    "maxOrderAmount",
    current.maxOrderAmount == null ? null : Number(current.maxOrderAmount),
  );
  const maxUses = numberField("maxUses", current.maxUses);
  const freeProductQuantity = numberField("freeProductQuantity", current.freeProductQuantity) ?? 1;
  const expiresAtValue = has("expiresAt") ? body.expiresAt : current.expiresAt;
  const expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;
  const imageUrl = has("imageUrl")
    ? (typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null)
    : current.imageUrl;

  const allowedTypes = ["PERCENTAGE", "FIXED", "FREE_SHIPPING", "FREE_PRODUCT", "BUY_X_GET_Y"];
  const allowedScopes = ["ALL", "PRODUCT", "CATEGORY", "BRAND"];
  const allowedBuyRules = ["QUANTITY", "AMOUNT"];
  const allowedAudiences = ["ALL", "PREMIUM_ONLY", "NORMAL_ONLY"];
  if (!code || !allowedTypes.includes(type) || !allowedScopes.includes(scope) || !allowedBuyRules.includes(buyRule) || !allowedAudiences.includes(audience)) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik veya geçersiz." }, { status: 400 });
  }
  if (type !== "FREE_SHIPPING" && value <= 0 && type !== "FREE_PRODUCT" && type !== "BUY_X_GET_Y") {
    return NextResponse.json({ error: "İndirim değeri sıfırdan büyük olmalıdır." }, { status: 400 });
  }
  if (scope !== "ALL" && !targetId) {
    return NextResponse.json({ error: "Hedef ürün, kategori veya marka seçin." }, { status: 400 });
  }
  if (type === "FREE_PRODUCT" && !(body.freeProductId ?? current.freeProductId)) {
    return NextResponse.json({ error: "Ücretsiz ürün seçin." }, { status: 400 });
  }
  if (type === "BUY_X_GET_Y" && buyRule === "QUANTITY" && (
    !Number.isInteger(buyQuantity) ||
    !Number.isInteger(payQuantity) ||
    (buyQuantity ?? 0) < 2 ||
    (payQuantity ?? 0) < 1 ||
    (payQuantity ?? 0) >= (buyQuantity ?? 0)
  )) {
    return NextResponse.json({ error: "Kampanya toplam adedini ve ödenecek adedi doğru girin." }, { status: 400 });
  }
  if (type === "BUY_X_GET_Y" && buyRule === "AMOUNT" && (
    (buyAmount ?? 0) <= 0 ||
    (payAmount ?? -1) < 0 ||
    (payAmount ?? 0) >= (buyAmount ?? 0)
  )) {
    return NextResponse.json({ error: "Alış tutarı, ödeme tutarından büyük olmalıdır." }, { status: 400 });
  }
  if (Number.isNaN(expiresAt?.getTime() ?? 0)) {
    return NextResponse.json({ error: "Son kullanım tarihi geçersiz." }, { status: 400 });
  }

  const duplicate = await db.coupon.findFirst({
    where: { code, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) return NextResponse.json({ error: "Bu kupon kodu zaten kullanımda." }, { status: 409 });

  const freeProductId = type === "FREE_PRODUCT"
    ? String(body.freeProductId ?? current.freeProductId ?? "").trim() || null
    : null;
  const coupon = await db.coupon.update({
    where: { id },
    data: {
      code,
      type,
      value,
      minOrderAmount,
      maxOrderAmount,
      scope,
      targetId,
      ruleType: String(body.ruleType ?? current.ruleType),
      buyRule,
      buyQuantity: type === "BUY_X_GET_Y" && buyRule === "QUANTITY" ? buyQuantity : null,
      payQuantity: type === "BUY_X_GET_Y" && buyRule === "QUANTITY" ? payQuantity : null,
      getQuantity: type === "BUY_X_GET_Y" && buyRule === "QUANTITY"
        ? Math.max(1, Number(buyQuantity) - Number(payQuantity))
        : null,
      buyAmount: type === "BUY_X_GET_Y" && buyRule === "AMOUNT" ? buyAmount : null,
      payAmount: type === "BUY_X_GET_Y" && buyRule === "AMOUNT" ? payAmount : null,
      freeProductId,
      freeProductQuantity: Math.max(1, freeProductQuantity),
      premiumOnly: audience === "PREMIUM_ONLY",
      audience,
      imageUrl,
      maxUses: maxUses == null ? null : Math.max(1, maxUses),
      expiresAt,
    },
  });
  return NextResponse.json({ data: coupon });
}
