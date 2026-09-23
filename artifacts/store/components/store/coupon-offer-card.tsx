"use client";

import { Gift, PanelTop, Sparkles, Tag, Truck } from "lucide-react";

export interface CouponOffer {
  id: string;
  code: string;
  type: string;
  value?: number | string | null;
  buyRule?: string | null;
  buyQuantity?: number | null;
  payQuantity?: number | null;
  buyAmount?: number | string | null;
  payAmount?: number | string | null;
  imageUrl?: string | null;
  premiumOnly?: boolean;
}

export function couponOfferLabel(coupon: CouponOffer) {
  if (coupon.type === "PERCENTAGE") return `%${Number(coupon.value ?? 0)} indirim`;
  if (coupon.type === "FIXED") return `₺${Number(coupon.value ?? 0).toLocaleString("tr-TR")} indirim`;
  if (coupon.type === "FREE_SHIPPING") return "Ücretsiz kargo";
  if (coupon.type === "FREE_PRODUCT") return "Ücretsiz ürün fırsatı";
  if (coupon.type === "BUY_X_GET_Y" && coupon.buyRule === "AMOUNT") {
    return `₺${Number(coupon.buyAmount ?? 0).toLocaleString("tr-TR")} al, ₺${Number(coupon.payAmount ?? 0).toLocaleString("tr-TR")} öde`;
  }
  if (coupon.type === "BUY_X_GET_Y") {
    return `${coupon.buyQuantity ?? 0} adet al, ${coupon.payQuantity ?? 0} adet öde`;
  }
  return "Özel alışveriş fırsatı";
}

function couponOfferTitle(coupon: CouponOffer) {
  if (coupon.type === "BUY_X_GET_Y") return "Adet avantajı";
  if (coupon.type === "FREE_SHIPPING") return "Kargo bizden";
  if (coupon.type === "FREE_PRODUCT") return "Hediye fırsatı";
  if (coupon.type === "PERCENTAGE") return "Yüzde indirimi";
  if (coupon.type === "FIXED") return "Sepette indirim";
  return "Göçmen fırsatı";
}

function CouponArtwork({ coupon }: { coupon: CouponOffer }) {
  if (coupon.imageUrl) {
    return (
      <div className="relative h-full min-h-[116px] overflow-hidden bg-[#3a2f24]">
        <img src={coupon.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#241b14]/90 via-[#241b14]/35 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-4 text-white">
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d88d]">Göçmen Perde</span>
          <span className="max-w-[12rem] text-sm font-black leading-tight">{couponOfferTitle(coupon)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[116px] overflow-hidden bg-gradient-to-br from-[#5b4527] via-[#312820] to-[#191613] text-white">
      <svg viewBox="0 0 260 150" className="absolute inset-0 h-full w-full opacity-80" aria-hidden="true">
        <defs>
          <linearGradient id={`coupon-curtain-${coupon.id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#c59b46" stopOpacity=".85" />
            <stop offset=".45" stopColor="#f2d589" stopOpacity=".25" />
            <stop offset="1" stopColor="#8c682c" stopOpacity=".75" />
          </linearGradient>
          <radialGradient id={`coupon-glow-${coupon.id}`}>
            <stop offset="0" stopColor="#f6dc8c" stopOpacity=".5" />
            <stop offset="1" stopColor="#f6dc8c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="215" cy="42" r="70" fill={`url(#coupon-glow-${coupon.id})`} />
        <path d="M18 0h224v10c-24 3-28 20-29 46l-4 94h-49l8-101c2-19-1-34-11-39H18Z" fill={`url(#coupon-curtain-${coupon.id})`} opacity=".78" />
        <path d="M18 0h43c12 13 14 32 10 55l-8 95H18Z" fill="#d8b15d" opacity=".46" />
        <path d="M242 0h-32c-14 14-15 35-12 58l5 92h39Z" fill="#a57b35" opacity=".5" />
        <path d="M18 11c35 8 73 8 111 0s77-8 113 0" fill="none" stroke="#f6df9a" strokeOpacity=".75" strokeWidth="2" />
        <path d="M26 19c32 7 69 7 103 0m15 0c28 7 60 7 91 0" fill="none" stroke="#f6df9a" strokeOpacity=".3" strokeWidth="1" />
      </svg>
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d88d]">Göçmen Perde</span>
          <PanelTop className="h-5 w-5 text-[#f5d88d]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-black leading-tight">{couponOfferTitle(coupon)}</p>
          <p className="mt-1 text-[10px] text-white/70">Pencerenize yakışan avantaj</p>
        </div>
      </div>
    </div>
  );
}

export default function CouponOfferCard({
  coupon,
  applied,
  applying,
  onApply,
  compact = false,
}: {
  coupon: CouponOffer;
  applied?: boolean;
  applying?: boolean;
  onApply?: (code: string) => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border border-[#d9c38b] bg-[#fffdf7] shadow-[0_8px_24px_rgba(92,68,25,.08)] ${
        compact ? "min-w-[248px] snap-start" : ""
      }`}
      data-testid={`coupon-offer-${coupon.code}`}
    >
      <div className="grid grid-cols-[42%_58%]">
        <CouponArtwork coupon={coupon} />
        <div className="flex min-w-0 flex-col justify-between p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {coupon.type === "FREE_SHIPPING" ? (
                <Truck className="h-3.5 w-3.5 shrink-0 text-[#b8973e]" aria-hidden="true" />
              ) : coupon.type === "FREE_PRODUCT" ? (
                <Gift className="h-3.5 w-3.5 shrink-0 text-[#b8973e]" aria-hidden="true" />
              ) : coupon.type === "BUY_X_GET_Y" ? (
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#b8973e]" aria-hidden="true" />
              ) : (
                <Tag className="h-3.5 w-3.5 shrink-0 text-[#b8973e]" aria-hidden="true" />
              )}
              <span className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#8b6a2e]">
                {couponOfferTitle(coupon)}
              </span>
            </div>
            <p className="mt-2 truncate font-mono text-sm font-black text-[#2d2923]">{coupon.code}</p>
            <p className="mt-1 text-xs font-bold leading-snug text-[#665d50]">{couponOfferLabel(coupon)}</p>
          </div>
          {onApply && (
            <button
              type="button"
              onClick={() => onApply(coupon.code)}
              disabled={applying || applied}
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-xl bg-[#2b2721] px-2.5 text-[11px] font-black text-white transition-colors hover:bg-[#b8973e] disabled:cursor-default disabled:bg-[#e8dfca] disabled:text-[#806f4c]"
            >
              {applied ? "Uygulandı" : applying ? "Kontrol ediliyor..." : "Sepete uygula"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}