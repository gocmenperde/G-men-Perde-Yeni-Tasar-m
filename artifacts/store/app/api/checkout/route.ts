import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import {
  calculateCurtainPrice,
  getCurtainMeasurementRequirements,
  getPileOptions,
} from "@/lib/curtain-measurements";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret:
      process.env.NEXTAUTH_SECRET ??
      process.env.AUTH_SECRET ??
      process.env.SESSION_SECRET ??
      process.env.SECRET,
  });
  if (!token?.sub) {
    return NextResponse.json({ error: "Sipariş vermek için giriş yapmanız gerekiyor." }, { status: 401 });
  }

  const body = await request.json();
  const { items, address, couponCode, paymentMethod = "KAPIDA" } = body;

  if (!items?.length) return NextResponse.json({ error: "Sepet boş." }, { status: 400 });
  if (!address?.fullName || !address?.phone || !address?.city || !address?.district || !address?.address) {
    return NextResponse.json({ error: "Teslimat adresi eksik." }, { status: 400 });
  }

  try {
    const productIds = items.map((i: any) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        unit: true,
        isMeter: true,
        isSquareMeter: true,
        requiresWidth: true,
        requiresHeight: true,
        category: { select: { slug: true, name: true } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) return NextResponse.json({ error: `Ürün bulunamadı: ${item.productId}` }, { status: 400 });
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `"${product.name}" için yeterli stok yok. Stok: ${product.stock}` }, { status: 400 });
      }
      const requirements = getCurtainMeasurementRequirements(product);
      const width = Number(item.dimensions?.width);
      const height = Number(item.dimensions?.height);
      const pileFactor = Number(item.dimensions?.pileFactor);
      if (requirements.requiresWidth && (!Number.isFinite(width) || width <= 0)) {
        return NextResponse.json({ error: `"${product.name}" için en ölçüsü zorunludur.` }, { status: 400 });
      }
      if (requirements.requiresHeight && (!Number.isFinite(height) || height <= 0)) {
        return NextResponse.json({ error: `"${product.name}" için boy ölçüsü zorunludur.` }, { status: 400 });
      }
      if (requirements.requiresPile && !getPileOptions().some((option) => Number(option.value) === pileFactor)) {
        return NextResponse.json({ error: `"${product.name}" için geçerli bir pile sıklığı seçin.` }, { status: 400 });
      }
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      const product = productMap.get(item.productId);
      if (!product) return sum;
      return sum + calculateCurtainPrice(product, item.dimensions ?? {}) * item.quantity;
    }, 0);

    // Kargo ayarlarını DB'den oku
    let FREE_SHIPPING_THRESHOLD = 1500;
    let SHIPPING_FEE = 79.9;
    try {
      const siteSettings = await db.siteSettings.findUnique({ where: { id: "global" } });
      if (siteSettings) {
        FREE_SHIPPING_THRESHOLD = siteSettings.freeShippingThreshold ?? 1500;
        SHIPPING_FEE = siteSettings.shippingFee ?? 79.9;
      }
    } catch {}
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    let discountAmount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await db.coupon.findFirst({
        where: { code: couponCode.toUpperCase(), isActive: true },
      });
      if (coupon) {
        if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            if (subtotal >= Number(coupon.minOrderAmount)) {
              if (coupon.type === "PERCENTAGE") {
                discountAmount = subtotal * (Number(coupon.value) / 100);
              } else {
                discountAmount = Math.min(Number(coupon.value), subtotal);
              }
              couponId = coupon.id;
            }
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount + shipping);

    // Transaction: create address + order + items + reduce stock + update coupon
    const order = await db.$transaction(async (tx) => {
      const addr = await tx.address.create({
        data: {
          userId: token.sub!,
          title: "Sipariş Adresi",
          fullName: address.fullName,
          phone: address.phone,
          city: address.city,
          district: address.district,
          address: address.address,
          zipCode: address.zipCode ?? null,
        },
      });

      const newOrder = await tx.order.create({
        data: {
          userId: token.sub!,
          status: "PENDING",
          subtotal,
          discount: discountAmount,
          shipping,
          total,
          addressId: addr.id,
          couponId: couponId ?? null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: Number(calculateCurtainPrice(
                productMap.get(item.productId)!,
                item.dimensions ?? {},
              ).toFixed(2)),
              dimensions: item.dimensions ?? undefined,
            })),
          },
        },
      });

      // Stok azalt
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Kupon kullanım sayısını artır
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }

      return newOrder;
    });

    return NextResponse.json({ orderId: order.id, total, shipping, discount: discountAmount });
  } catch (err) {
    console.error("Checkout error:", err);
    const msg = err instanceof Error ? err.message : "Sipariş oluşturulamadı.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
