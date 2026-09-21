"use client";

import { useCartStore } from "@/lib/store/cart";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck, Shield, RotateCcw, Tag, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import ProductImage from "@/components/store/product-image";
import { useSiteSettings } from "@/lib/store/site-settings";
const CartCrossSell = dynamic(() => import("@/components/store/cart-cross-sell"), { ssr: false });

export default function CartClient() {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { freeShippingThreshold: FREE_SHIPPING_THRESHOLD, shippingFee, load: loadSettings } = useSiteSettings();

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { setMounted(true); }, []);

  const totalVal = total();
  const remaining = FREE_SHIPPING_THRESHOLD - totalVal;
  const progressPct = Math.min(100, (totalVal / FREE_SHIPPING_THRESHOLD) * 100);
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const shippingCost = totalVal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingFee;
  const finalTotal = totalVal - discountAmount + shippingCost;

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setApplyingPromo(true);
    setPromoError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: totalVal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error ?? "Geçersiz promosyon kodu.");
        return;
      }
      const { coupon: _coupon, discount } = data;
      const coupon = data.data;
      const calcDiscount = typeof discount === "number" ? discount : 0;
      const label = coupon?.type === "PERCENTAGE"
        ? `-%${Number(coupon.value)}` : `-₺${calcDiscount.toFixed(2)}`;
      setAppliedPromo({ code, discountAmount: calcDiscount, label });
      setPromoInput("");
       toast.success(`Kupon uygulandı! ${label} indirim kazandınız.`);
    } catch {
      setPromoError("Kupon doğrulanamadı. Tekrar deneyin.");
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] bg-[var(--cream)] py-10">
        <div className="mx-auto max-w-5xl space-y-6 px-4">
          <div className="space-y-2">
            <div className="skeleton h-8 w-36" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="skeleton h-20 w-20 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/4" />
                    <div className="skeleton h-8 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
            <div className="skeleton h-72 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 rounded-3xl bg-[var(--surface-muted)] border border-[var(--line)] flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-[#D4AF5A]" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-3">Sepetiniz Boş</h1>
        <p className="text-zinc-400 mb-8 max-w-sm mx-auto">Harika ürünler sizi bekliyor. Alışverişe hemen başlayın!</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-zinc-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#B8973E] transition-colors shadow-lg">
          <ShoppingBag className="w-5 h-5" /> Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
      <div className="bg-[var(--cream)] min-h-screen py-6 pb-28 sm:py-10 sm:pb-10">
       <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900">Sepetim</h1>
            <p className="text-zinc-400 text-sm mt-1">{items.reduce((s, i) => s + i.quantity, 0)} ürün</p>
          </div>
          <button onClick={clearCart} className="touch-target -mr-2 -mt-2 inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 sm:text-sm">
            <Trash2 className="w-4 h-4" /> Sepeti Temizle
          </button>
        </div>

        {/* Free shipping progress */}
        {totalVal < FREE_SHIPPING_THRESHOLD && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-100 rounded-2xl p-4 mb-6 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                <Truck className="w-4 h-4 text-[#B8973E]" />
                Ücretsiz kargoya <strong className="text-[#B8973E]">₺{remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</strong> kaldı
              </span>
              <span className="text-zinc-400 text-xs">{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#B8973E] to-[#D4AF5A] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
        {totalVal >= FREE_SHIPPING_THRESHOLD && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-green-700">
            <Truck className="w-4 h-4 flex-shrink-0" />
             <span className="text-sm font-semibold">Tebrikler! Ücretsiz kargo kazandınız.</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 transition-colors hover:border-zinc-200 sm:gap-4 sm:p-4"
                >
                  <Link href={`/products/${item.slug ?? item.id}`} className="relative h-[4.5rem] w-[4.5rem] flex-shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 sm:h-20 sm:w-20">
                    <ProductImage src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1 transition-transform duration-300 hover:scale-105" fallbackLabel="Görsel yok" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                    <p className="text-[#B8973E] text-xs font-bold mt-0.5">₺{item.price.toLocaleString("tr-TR")} / adet</p>
                    {item.dimensions && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Ölçü: {item.dimensions.width ? `${item.dimensions.width} m en` : ""}
                        {item.dimensions.height ? ` × ${item.dimensions.height} m boy` : ""}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center border border-zinc-100 rounded-xl overflow-hidden bg-zinc-50">
                         <button onClick={() => updateQty(item.id, item.quantity - 1)} className="touch-target px-3 py-2 hover:bg-zinc-100 transition-colors text-zinc-600" aria-label={`${item.name} miktarını azalt`}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-bold text-zinc-900 min-w-[2rem] text-center">{item.quantity}</span>
                         <button onClick={() => updateQty(item.id, item.quantity + 1)} className="touch-target px-3 py-2 hover:bg-zinc-100 transition-colors text-zinc-600" aria-label={`${item.name} miktarını artır`}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                       <button onClick={() => removeItem(item.id)} className="touch-target p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" aria-label={`${item.name} ürününü kaldır`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col justify-between items-end">
                    <p className="whitespace-nowrap text-base font-black text-zinc-900 sm:text-lg">
                      ₺{(item.price * item.quantity).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
             <div className="space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 dark:bg-[var(--surface)] sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-black text-lg text-zinc-900">Sipariş Özeti</h2>

              {/* Promo code */}
              <div className="border border-zinc-100 rounded-2xl p-3 bg-zinc-50">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#B8973E]" /> Promosyon Kodu
                </p>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700">{appliedPromo.code}</span>
                      <span className="text-xs text-green-600">{appliedPromo.label}</span>
                    </div>
                    <button onClick={removePromo} className="text-green-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="Kod girin"
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent transition-all uppercase font-semibold placeholder:normal-case placeholder:font-normal"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-3 py-2 bg-zinc-900 hover:bg-[#B8973E] text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      Uygula
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs text-red-500 mt-1.5 font-semibold">{promoError}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Ara Toplam</span>
                  <span className="font-semibold text-zinc-900">₺{totalVal.toLocaleString("tr-TR")}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> {appliedPromo.code}
                    </span>
                    <span className="font-bold text-green-600">-₺{discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Kargo</span>
                  <span className={`font-semibold ${shippingCost === 0 ? "text-green-600" : "text-zinc-900"}`}>
                     {shippingCost === 0 ? "Ücretsiz" : `₺${shippingFee.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4">
                <div className="flex justify-between font-black text-xl text-zinc-900">
                  <span>Toplam</span>
                  <span>₺{finalTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-green-600 font-semibold mt-1">{appliedPromo.label} indirim uygulandı — ₺{discountAmount.toFixed(2)} tasarruf!</p>
                )}
                {shippingCost === 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">Kargo ücretsiz dahil</p>
                )}
              </div>

               <Link href="/checkout" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 font-bold text-white shadow-lg transition-colors hover:bg-[#B8973E]">
                Ödemeye Geç <ArrowRight className="w-5 h-5" />
              </Link>

              <Link href="/products" className="block text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
                ← Alışverişe Devam Et
              </Link>

              {/* Trust badges */}
              <div className="border-t border-zinc-100 pt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Shield, text: "256-bit SSL", sub: "Güvenli ödeme" },
                  { icon: RotateCcw, text: "14 gün iade", sub: "İade garantisi" },
                  { icon: Truck, text: "Aynı gün kargo", sub: "Hızlı hazırlık" },
                ].map(({ icon: Icon, text, sub }) => (
                  <div key={text} className="flex flex-col items-center gap-1">
                    <Icon className="w-4 h-4 text-[#B8973E]" />
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 leading-tight">{text}</span>
                    <span className="text-[9px] text-zinc-400 leading-tight">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Çapraz satış önerileri */}
        <CartCrossSell cartProductIds={items.map((i) => i.id)} />
      </div>
    </div>
  );
}
