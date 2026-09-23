import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";
import { sanitizeImageList } from "@/lib/image-url";
import {
  calculateCurtainPrice,
  getCurtainMeasurementRequirements,
  getPileOptions,
} from "@/lib/curtain-measurements";
import {
  calculatePremiumDiscount,
  evaluateCoupon,
  isPremiumActive,
  type CouponCartItem,
} from "@/lib/coupon-rules";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const take = 20;
    const where: { userId?: string; status?: string } =
      user.role === "ADMIN" ? {} : { userId: user.id };
    const status = searchParams.get("status");
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: { product: { select: { name: true, images: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip: (page - 1) * take,
      }),
      db.order.count({ where }),
    ]);

    const safeOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: sanitizeImageList(item.product.images) }
          : item.product,
      })),
    }));

    return NextResponse.json({
      data: safeOrders,
      total,
      page,
      pages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json({ error: "Siparişler alınamadı." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });

    const body = await req.json();
    const { items, couponCode, address, addressId } = body;

    if (!items || items.length === 0)
      return NextResponse.json({ error: "Sepet boş." }, { status: 400 });

    // Adres zorunlu — ya kayıtlı addressId ya da tam dolu address nesnesi gelmeli
    const hasNewAddress = address?.fullName && address?.phone && address?.city && address?.district && address?.address;
    if (!addressId && !hasNewAddress) {
      return NextResponse.json({ error: "Teslimat adresi ve iletişim bilgileri zorunludur." }, { status: 400 });
    }

    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { category: { select: { slug: true, name: true } } },
    });
    const account = await db.user.findUnique({
      where: { id: user.id },
      select: { premiumUntil: true },
    });
    const settings = await db.siteSettings.findUnique({ where: { id: "global" } });
    const premiumActive = isPremiumActive(account?.premiumUntil);

    let subtotal = 0;
    const orderItems = items.map((item: {
      productId: string;
      quantity: number;
      dimensions?: {
        width?: number;
        height?: number;
        area?: number;
        pile?: string;
        pileFactor?: number;
        unit?: string;
      } | null;
    }) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Ürün bulunamadı: ${item.productId}`);
      if (product.stock < item.quantity)
        throw new Error(`"${product.name}" için yeterli stok yok. Mevcut: ${product.stock}`);
      const requirements = getCurtainMeasurementRequirements(product);
      const width = Number(item.dimensions?.width);
      const height = Number(item.dimensions?.height);
      const pileFactor = Number(item.dimensions?.pileFactor);
      const hasWidth = Number.isFinite(width) && width > 0;
      const hasHeight = Number.isFinite(height) && height > 0;
      if (requirements.requiresWidth && !hasWidth) {
        throw new Error(`"${product.name}" için en ölçüsü zorunludur.`);
      }
      if (requirements.requiresHeight && !hasHeight) {
        throw new Error(`"${product.name}" için boy ölçüsü zorunludur.`);
      }
      if (requirements.requiresPile && (!Number.isFinite(pileFactor) || pileFactor <= 0)) {
        throw new Error(`"${product.name}" için pile sıklığı seçimi zorunludur.`);
      }
      if (requirements.requiresPile && !getPileOptions().some((option) => Number(option.value) === pileFactor)) {
        throw new Error(`"${product.name}" için geçersiz pile sıklığı.`);
      }
      const dimensions = requirements.kind === "none"
        ? (item.dimensions ?? undefined)
        : {
            ...(hasWidth ? { width } : {}),
            ...(hasHeight ? { height } : {}),
            ...(hasWidth && hasHeight ? { area: Number((width * height).toFixed(2)) } : {}),
            ...(requirements.requiresPile
              ? {
                  pileFactor,
                  pile: getPileOptions().find((option) => Number(option.value) === pileFactor)?.label,
                }
              : {}),
            unit: requirements.kind === "area" ? "m²" : requirements.kind === "meter" ? "mt" : product.unit ?? "adet",
          };
      const price = calculateCurtainPrice(product, dimensions);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`"${product.name}" için geçerli bir ölçü girin.`);
      }
      subtotal += price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(price.toFixed(2)),
        dimensions,
      };
    });

    let couponDiscount = 0;
    let premiumDiscount = premiumActive
      ? calculatePremiumDiscount(subtotal, {
          premiumDiscountType: settings?.premiumDiscountType,
          premiumDiscountValue: settings?.premiumDiscountValue == null
            ? undefined
            : Number(settings.premiumDiscountValue),
        })
      : 0;
    let couponId: string | undefined;
    let couponFreeShipping = false;
    if (couponCode) {
      const coupon = await db.coupon.findFirst({
        where: {
          code: String(couponCode).toUpperCase(),
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (!coupon) throw new Error("Kupon bulunamadı veya geçersiz.");
      const couponItems: CouponCartItem[] = orderItems.map((item: { productId: string; quantity: number; price: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));
      const evaluation = evaluateCoupon(
        coupon,
        products.map((product) => ({
          id: product.id,
          price: Number(orderItems.find((item: { productId: string; price: number }) => item.productId === product.id)?.price ?? product.price),
          categoryId: product.categoryId,
          brandId: product.brandId,
        })),
        couponItems,
        premiumActive,
      );
      couponDiscount = evaluation.discount;
      couponFreeShipping = evaluation.freeShipping;
      couponId = coupon.id;
    }

    const totalDiscount = Math.min(subtotal, couponDiscount + premiumDiscount);
    const shipping = (
      premiumActive && settings?.premiumFreeShipping !== false
    ) || couponFreeShipping || subtotal >= Number(settings?.freeShippingThreshold ?? 1500)
      ? 0
      : Number(settings?.shippingFee ?? 79.9);
    const total = Math.max(0, subtotal - totalDiscount) + shipping;

    const order = await db.$transaction(async (tx) => {
      // Adres kaydı oluştur veya mevcut adresi kullan
      let resolvedAddressId: string | undefined;
      if (addressId) {
        // Kayıtlı adres — kullanıcıya ait mi doğrula
        const existing = await tx.address.findFirst({ where: { id: addressId, userId: user.id } });
        if (existing) {
          resolvedAddressId = existing.id;
        } else if (!hasNewAddress) {
          // addressId geçersiz ve yedek address nesnesi de yok → sert hata
          throw new Error("Seçilen teslimat adresi bulunamadı. Lütfen tekrar adres seçin.");
        }
        // addressId geçersiz ama hasNewAddress varsa aşağıda yeni adres oluşturulur
      }
      if (!resolvedAddressId && address) {
        const newAddr = await tx.address.create({
          data: {
            userId: user.id,
            title: "Sipariş Adresi",
            fullName: address.fullName,
            phone: address.phone,
            city: address.city,
            district: address.district,
            address: address.address,
            zipCode: address.zipCode ?? null,
          },
        });
        resolvedAddressId = newAddr.id;
      }

      // Son güvence: adres çözümlenemedi
      if (!resolvedAddressId) {
        throw new Error("Teslimat adresi zorunludur. Lütfen geçerli bir adres girin.");
      }

      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: "AWAITING_PAYMENT",
          subtotal,
          discount: totalDiscount,
          premiumDiscount,
          shipping,
          total,
          couponId,
          addressId: resolvedAddressId ?? null,
          items: { create: orderItems },
        },
        include: { items: true },
      });
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
      return created;
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (err: any) {
    console.error("[ORDERS_POST]", err);
    return NextResponse.json(
      { error: err.message ?? "Sipariş oluşturulamadı." },
      { status: 500 },
    );
  }
}
