"use client";

import Link from "next/link";
import { useState } from "react";
import { Gift, Sparkles, Tag, Truck } from "lucide-react";

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
  audience?: string | null;
  premiumOnly?: boolean;
  locked?: boolean;
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
    const payableQuantity = coupon.payQuantity
      ?? (coupon.buyQuantity == null ? null : Math.max(1, coupon.buyQuantity - 1));
    return `${coupon.buyQuantity ?? 0} adet al, ${payableQuantity ?? 0} adet öde`;
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
      <div className="relative min-h-[150px] overflow-hidden bg-[#2b2118]">
        <img src={coupon.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c140e]/90 via-[#241b14]/20 to-[#241b14]/15" />
        <div className="relative flex min-h-[150px] flex-col justify-between p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#f5d88d]">Göçmen Perde</span>
            <span className="rounded-full border border-[#f5d88d]/50 bg-[#1d150e]/55 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#fff1ba]">Özel teklif</span>
          </div>
          <span className="max-w-[15rem] text-lg font-black leading-tight drop-shadow-sm">{couponOfferTitle(coupon)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[150px] overflow-hidden bg-[#211914] text-white">
      <svg viewBox="0 0 640 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`coupon-wall-${coupon.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#392a1d" />
            <stop offset="1" stopColor="#120f0c" />
          </linearGradient>
          <linearGradient id={`coupon-window-${coupon.id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#d4b76d" stopOpacity=".3" />
            <stop offset=".48" stopColor="#fff2bd" stopOpacity=".75" />
            <stop offset="1" stopColor="#9e7834" stopOpacity=".25" />
          </linearGradient>
          <linearGradient id={`coupon-curtain-${coupon.id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#704e2b" />
            <stop offset=".3" stopColor="#c59b52" />
            <stop offset=".52" stopColor="#7e572d" />
            <stop offset=".78" stopColor="#d5b56a" />
            <stop offset="1" stopColor="#4a301d" />
          </linearGradient>
          <filter id={`coupon-glow-${coupon.id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        <rect width="640" height="300" fill={`url(#coupon-wall-${coupon.id})`} />
        <ellipse cx="320" cy="88" rx="190" ry="110" fill="#f8d987" opacity=".16" filter={`url(#coupon-glow-${coupon.id})`} />
        <rect x="155" y="43" width="330" height="212" rx="6" fill="#17120e" stroke="#c9a65b" strokeOpacity=".7" strokeWidth="5" />
        <rect x="174" y="60" width="292" height="178" fill={`url(#coupon-window-${coupon.id})`} />
        <path d="M320 60v178M174 149h292" stroke="#75552c" strokeOpacity=".55" strokeWidth="4" />
        <path d="M320 60v178M174 149h292" stroke="#fff1bc" strokeOpacity=".18" strokeWidth="1" />
        <path d="M26 24c57 6 91 25 111 69 17 37 7 122-5 207H22Z" fill={`url(#coupon-curtain-${coupon.id})`} />
        <path d="M614 24c-57 6-91 25-111 69-17 37-7 122 5 207h110Z" fill={`url(#coupon-curtain-${coupon.id})`} transform="translate(0 0) scale(-1 1) translate(-640 0)" />
        <path d="M50 25c37 50 45 121 28 275M86 33c35 43 43 113 24 267M590 25c-37 50-45 121-28 275M554 33c-35 43-43 113-24 267" fill="none" stroke="#f7dda0" strokeOpacity=".32" strokeWidth="7" />
        <path d="M22 25h596" stroke="#d9b86b" strokeOpacity=".85" strokeWidth="8" />
        <path d="M24 34h592" stroke="#fff0b4" strokeOpacity=".22" strokeWidth="2" />
      </svg>
      <div className="relative flex min-h-[150px] flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d88d]">Göçmen Perde</span>
          <span className="rounded-full border border-[#f5d88d]/50 bg-[#1d150e]/55 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#fff1ba]">Özel teklif</span>
        </div>
        <div>
          <p className="text-lg font-black leading-tight drop-shadow-sm">{couponOfferTitle(coupon)}</p>
          <p className="mt-1 text-[10px] text-white/75">Pencerenize yakışan avantaj</p>
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
  const [showPremiumNotice, setShowPremiumNotice] = useState(false);
  const premiumLocked = coupon.locked === true;

  return (
    <article
      className={`overflow-hidden rounded-[1.35rem] border border-[#d8bc78] bg-[#fffdf7] shadow-[0_14px_34px_rgba(92,68,25,.14)] transition-transform duration-300 hover:-translate-y-0.5 ${
        compact ? "min-w-[286px] snap-start" : ""
      }`}
      data-testid={`coupon-offer-${coupon.code}`}
    >
      <div>
        <CouponArtwork coupon={coupon} />
        <div className="flex min-w-0 flex-col p-4">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
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
              <span className="shrink-0 rounded-full bg-[#f6ebc9] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#8b6a2e]">Sepette</span>
            </div>
            <p className="mt-3 truncate font-mono text-sm font-black tracking-wide text-[#2d2923]">{coupon.code}</p>
            <p className="mt-1 text-base font-black leading-snug text-[#4c3a20]">{couponOfferLabel(coupon)}</p>
            {premiumLocked && (
              <span className="mt-2 inline-flex rounded-full bg-[#f5e7bd] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#866725]">
                Premium müşterilere özel
              </span>
            )}
          </div>
          {onApply && (
            <button
              type="button"
              onClick={() => {
                if (premiumLocked) {
                  setShowPremiumNotice(true);
                  return;
                }
                onApply(coupon.code);
              }}
              disabled={applying || applied}
              className={`mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl px-3 text-xs font-black transition-all disabled:cursor-default ${
                premiumLocked
                  ? "border border-[#caa653] bg-[#f7e9bf] text-[#725519] hover:bg-[#efd99a]"
                  : "bg-[#2b2721] text-white shadow-[0_5px_12px_rgba(45,38,28,.14)] hover:bg-[#b8973e] hover:shadow-[0_8px_18px_rgba(184,151,62,.24)] disabled:bg-[#e8dfca] disabled:text-[#806f4c]"
              }`}
            >
              {premiumLocked ? "Premium'a özel" : applied ? "Uygulandı" : applying ? "Kontrol ediliyor..." : "Sepete uygula"}
            </button>
          )}
        </div>
      </div>
      {premiumLocked && showPremiumNotice && (
        <div className="border-t border-[#ead9ae] bg-[#fff8e8] px-3 py-3" role="alert">
          <p className="text-xs font-black leading-snug text-[#5f4a1f]">
            Bu kupon yalnızca Premium müşterilere özeldir.
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#78653d]">
            Hemen Premium ol ve bu avantajdan yararlan.
          </p>
          <Link
            href="/premium"
            className="mt-2 inline-flex min-h-8 items-center justify-center rounded-lg bg-[#b8973e] px-3 text-[11px] font-black text-white hover:bg-[#9d7d2e]"
          >
            Premium ol
          </Link>
        </div>
      )}
    </article>
  );
}