import type { Coupon } from "@prisma/client";

export type CouponProduct = {
  id: string;
  price: number;
  categoryId?: string | null;
  brandId?: string | null;
};

export type CouponCartItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type CouponEvaluation = {
  discount: number;
  freeShipping: boolean;
  eligibleSubtotal: number;
  message: string;
};

function matchesScope(
  coupon: Pick<Coupon, "scope" | "targetId">,
  product: CouponProduct,
) {
  if (coupon.scope === "PRODUCT") return coupon.targetId === product.id;
  if (coupon.scope === "CATEGORY") return coupon.targetId === product.categoryId;
  if (coupon.scope === "BRAND") return coupon.targetId === product.brandId;
  return true;
}

export function isPremiumActive(premiumUntil?: Date | string | null, now = new Date()) {
  return !!premiumUntil && new Date(premiumUntil).getTime() > now.getTime();
}

export function calculatePremiumDiscount(
  subtotal: number,
  settings: {
    premiumDiscountType?: string | null;
    premiumDiscountValue?: number | string | null;
  },
) {
  const value = Number(settings.premiumDiscountValue ?? 0);
  if (!Number.isFinite(value) || value <= 0 || subtotal <= 0) return 0;
  const discount = settings.premiumDiscountType === "FIXED"
    ? value
    : (subtotal * value) / 100;
  return Math.min(subtotal, Math.max(0, Number(discount.toFixed(2))));
}

export function evaluateCoupon(
  coupon: Coupon,
  products: CouponProduct[],
  items: CouponCartItem[],
  premiumActive: boolean,
  now = new Date(),
): CouponEvaluation {
  if (!coupon.isActive) throw new Error("Kupon aktif değil.");
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) {
    throw new Error("Kuponun kullanım süresi dolmuş.");
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Kupon kullanım limitine ulaştı.");
  }
  if (coupon.premiumOnly && !premiumActive) {
    throw new Error("Bu kupon yalnızca Premium üyeler içindir.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (Number(coupon.minOrderAmount) > 0 && subtotal < Number(coupon.minOrderAmount)) {
    throw new Error(`Minimum sipariş tutarı ₺${Number(coupon.minOrderAmount).toLocaleString("tr-TR")}`);
  }
  if (coupon.maxOrderAmount && subtotal > Number(coupon.maxOrderAmount)) {
    throw new Error(`Bu kupon en fazla ₺${Number(coupon.maxOrderAmount).toLocaleString("tr-TR")} siparişlerde geçerlidir.`);
  }

  const eligibleItems = items.filter((item) => {
    const product = productMap.get(item.productId);
    return product ? matchesScope(coupon, product) : false;
  });
  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (eligibleItems.length === 0 || eligibleSubtotal <= 0) {
    throw new Error("Kupon sepetteki ürünlerde geçerli değil.");
  }

  if (coupon.type === "FREE_SHIPPING") {
    return {
      discount: 0,
      freeShipping: true,
      eligibleSubtotal,
      message: "Ücretsiz kargo kuponu uygulandı.",
    };
  }

  if (coupon.type === "FREE_PRODUCT") {
    if (!coupon.freeProductId) throw new Error("Kuponun ücretsiz ürün tanımı eksik.");
    const reward = items.find((item) => item.productId === coupon.freeProductId);
    if (!reward) {
      throw new Error("Ücretsiz ürünü de sepete ekleyerek kuponu kullanabilirsiniz.");
    }
    const quantity = Math.min(reward.quantity, coupon.freeProductQuantity || 1);
    return {
      discount: Number((reward.price * quantity).toFixed(2)),
      freeShipping: false,
      eligibleSubtotal,
      message: "Ücretsiz ürün indirimi uygulandı.",
    };
  }

  if (coupon.type === "BUY_X_GET_Y") {
    const buy = Math.max(1, coupon.buyQuantity ?? 1);
    const get = Math.max(1, coupon.getQuantity ?? 1);
    const discount = eligibleItems.reduce((sum, item) => {
      const freeGroups = Math.floor(item.quantity / (buy + get));
      return sum + freeGroups * get * item.price;
    }, 0);
    if (discount <= 0) {
      throw new Error(`Bu kupon için en az ${buy + get} adet uygun ürün gereklidir.`);
    }
    return {
      discount: Number(Math.min(discount, eligibleSubtotal).toFixed(2)),
      freeShipping: false,
      eligibleSubtotal,
      message: `${buy} al ${get} öde kampanyası uygulandı.`,
    };
  }

  const discount = coupon.type === "FIXED"
    ? Number(coupon.value)
    : (eligibleSubtotal * Number(coupon.value)) / 100;
  return {
    discount: Number(Math.min(Math.max(0, discount), eligibleSubtotal).toFixed(2)),
    freeShipping: false,
    eligibleSubtotal,
    message: coupon.type === "PERCENTAGE"
      ? `%${Number(coupon.value)} indirim uygulandı.`
      : `₺${Number(coupon.value).toLocaleString("tr-TR")} indirim uygulandı.`,
  };
}