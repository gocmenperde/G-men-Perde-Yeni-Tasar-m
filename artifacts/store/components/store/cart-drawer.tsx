"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Minus, Plus, ShieldCheck, Sparkles, Trash2, Truck, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useSiteSettings } from "@/lib/store/site-settings";
import CouponOfferCard, { type CouponOffer } from "@/components/store/coupon-offer-card";
import toast from "react-hot-toast";

interface Recommendation {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  comparePrice?: number | string | null;
  images?: string[];
  stock?: number;
  brand?: { name?: string } | null;
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "256-bit SSL", text: "Güvenli ödeme" },
  { icon: Truck, title: "Aynı gün kargo", text: "Hızlı hazırlık" },
  { icon: Check, title: "14 gün iade", text: "Kolay iade garantisi" },
];

function price(value: number | string) {
  return `₺${Number(value).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useCartStore((state) => state.total);
  const addItem = useCartStore((state) => state.addItem);
  const appliedCouponCode = useCartStore((state) => state.appliedCouponCode);
  const setAppliedCouponCode = useCartStore((state) => state.setAppliedCouponCode);
  const { freeShippingThreshold, shippingFee, load } = useSiteSettings();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<CouponOffer[]>([]);
  const [applyingCouponCode, setApplyingCouponCode] = useState("");
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const subtotal = total();
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;
  const shipping = remaining === 0 ? 0 : shippingFee;

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open || items.length === 0) {
      setRecommendations([]);
      setLoadingRecommendations(false);
      return;
    }
    const controller = new AbortController();
    setLoadingRecommendations(true);
    fetch("/api/products?take=8&sort=popular&includeTotal=false", {
      signal: controller.signal,
      cache: "force-cache",
    })
      .then((response) => response.json())
      .then((payload) => {
        const ids = new Set(items.map((item) => item.id));
        setRecommendations((payload.data ?? []).filter((product: Recommendation) => !ids.has(product.id)).slice(0, 5));
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") setRecommendations([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingRecommendations(false);
      });
    return () => controller.abort();
  }, [items, open]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/coupons/available", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => setAvailableCoupons(Array.isArray(payload.data) ? payload.data : []))
      .catch(() => setAvailableCoupons([]));
  }, [open]);

  useEffect(() => {
    if (!open || subtotal < freeShippingThreshold || subtotal === 0) return;
    setCelebrate(true);
    const timer = window.setTimeout(() => setCelebrate(false), 2200);
    return () => window.clearTimeout(timer);
  }, [freeShippingThreshold, open, subtotal]);

  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items]);

  const addRecommendation = (product: Recommendation) => {
    if (product.stock === 0) {
      toast.error("Bu ürün şu an stokta yok.");
      return;
    }
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] ?? "",
      quantity: 1,
      stock: product.stock,
    });
    toast.success("Tamamlayıcı ürün sepete eklendi.");
  };

  const applyCoupon = async (code: string) => {
    setApplyingCouponCode(code);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: items.map((item) => ({
            productId: item.productId ?? item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Kupon şu anda bu sepette kullanılamıyor.");
      setAppliedCouponCode(code);
      toast.success(`Kupon uygulandı: ${code}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kupon uygulanamadı.");
    } finally {
      setApplyingCouponCode("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-[rgba(38,53,59,0.38)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={false}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 330, damping: 34 }}
            className="fixed inset-y-0 left-0 right-0 z-[80] flex h-[100dvh] w-screen max-w-none min-w-0 flex-col overflow-x-hidden border-[var(--line)] bg-[var(--surface)] shadow-[-20px_0_60px_rgba(38,53,59,0.18)] md:left-auto md:w-full md:max-w-[460px] md:border-l"
            role="dialog"
            aria-modal="true"
            aria-label="Sepetim"
          >
            <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 md:px-6">
              <div>
                 <p className="section-label">Göçmen Perde</p>
                <h2 className="mt-1 font-display text-2xl text-[var(--ink)]">Sepetim <span className="font-body text-sm font-bold text-[var(--ink-muted)]">({itemCount})</span></h2>
              </div>
              <button type="button" onClick={onClose} className="touch-target flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink-muted)] hover:text-[var(--ink)]" aria-label="Sepeti kapat" data-testid="button-close-cart-drawer">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="drawer-scroll min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--gold)]">
                    <Sparkles className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-[var(--ink)]">Sepetiniz henüz boş</h3>
                   <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--ink-muted)]">Aradığınız perde ürünlerini bulun, sepetinizi birlikte hazırlayalım.</p>
                  <Link href="/products" onClick={onClose} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--navy)] px-5 py-3 text-sm font-black text-[var(--surface)] hover:bg-[var(--gold)]" data-testid="link-drawer-start-shopping">
                    Ürünlere göz at <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-5 p-5 md:p-6">
                  <div className={`relative overflow-hidden rounded-2xl border p-4 ${remaining === 0 ? "border-emerald-200 bg-[var(--success-pale)] dark:border-emerald-900/50" : "border-[var(--gold-muted)] bg-[var(--gold-pale)]/65"}`} data-testid="status-free-shipping">
                    {celebrate && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                        {[...Array(14)].map((_, index) => (
                          <i key={index} className="absolute h-1.5 w-1.5 rounded-full bg-[var(--gold)]" style={{ left: `${8 + (index * 17) % 88}%`, top: `${12 + (index * 23) % 70}%`, transform: `rotate(${index * 29}deg)` }} />
                        ))}
                      </div>
                    )}
                    <div className="relative flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${remaining === 0 ? "bg-emerald-600 text-white" : "bg-[var(--gold)] text-white"}`}>
                        {remaining === 0 ? <Check className="h-4 w-4" aria-hidden="true" /> : <Truck className="h-4 w-4" aria-hidden="true" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-black ${remaining === 0 ? "text-emerald-800 dark:text-emerald-200" : "text-[var(--ink)]"}`}>
                          {remaining === 0 ? "Ücretsiz kargo aktif" : `${price(remaining)} daha ekleyin`}
                        </p>
                        <p className={`mt-0.5 text-xs ${remaining === 0 ? "text-emerald-700 dark:text-emerald-300" : "text-[var(--ink-muted)]"}`}>
                          {remaining === 0 ? "Siparişiniz kargo ücreti olmadan hazırlanacak." : `${price(freeShippingThreshold)} üzeri siparişlerde kargo bizden.`}
                        </p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                          <motion.div className={`h-full rounded-full ${remaining === 0 ? "bg-emerald-600" : "bg-[var(--gold)]"}`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} />
                        </div>
                      </div>
                      <span className={`text-xs font-black ${remaining === 0 ? "text-emerald-700 dark:text-emerald-200" : "text-[var(--gold)]"}`}>{Math.round(progress)}%</span>
                    </div>
                  </div>

                  {availableCoupons.length > 0 && (
                    <section className="border-t border-[var(--line)] pt-5" aria-label="Kullanılabilir kuponlar">
                      <div className="mb-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="section-label">Size özel fırsatlar</p>
                          <h3 className="mt-1 text-sm font-black text-[var(--ink)]">Bu sepette kullanabileceğiniz kuponlar</h3>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-[var(--ink-muted)]">{availableCoupons.length} kampanya</span>
                      </div>
                      <div className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-1">
                        {availableCoupons.map((coupon) => (
                          <CouponOfferCard
                            key={coupon.id}
                            coupon={coupon}
                            compact
                            applied={appliedCouponCode === coupon.code}
                            applying={applyingCouponCode === coupon.code}
                            onApply={applyCoupon}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="space-y-2">
                    {items.map((item) => (
                      <motion.div layout key={item.id} className="flex gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] p-3" data-testid={`row-drawer-cart-item-${item.id}`}>
                        <Link href={`/products/${item.slug ?? item.id}`} onClick={onClose} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)]" data-testid={`link-drawer-cart-item-${item.id}`}>
                          {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[var(--ink-muted)]">Görsel yok</div>}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/products/${item.slug ?? item.id}`} onClick={onClose} className="line-clamp-2 text-sm font-bold leading-snug text-[var(--ink)] hover:text-[var(--gold)]">{item.name}</Link>
                          <p className="mt-1 text-sm font-black text-[var(--gold)]">{price(item.price)}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-muted)]">
                              <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)} className="touch-target flex items-center justify-center px-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)]" aria-label={`${item.name} miktarını azalt`} data-testid={`button-drawer-decrease-${item.id}`}><Minus className="h-3 w-3" aria-hidden="true" /></button>
                              <span className="min-w-7 text-center text-xs font-black text-[var(--ink)]">{item.quantity}</span>
                              <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)} className="touch-target flex items-center justify-center px-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)]" aria-label={`${item.name} miktarını artır`} data-testid={`button-drawer-increase-${item.id}`}><Plus className="h-3 w-3" aria-hidden="true" /></button>
                            </div>
                            <button type="button" onClick={() => removeItem(item.id)} className="touch-target flex items-center justify-center rounded-xl text-[var(--ink-muted)] hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20" aria-label={`${item.name} ürününü kaldır`} data-testid={`button-drawer-remove-${item.id}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-black text-[var(--ink)]">{price(item.price * item.quantity)}</p>
                      </motion.div>
                    ))}
                  </div>

                  {loadingRecommendations ? (
                    <div className="space-y-3 border-t border-[var(--line)] pt-5" aria-label="Öneriler yükleniyor">
                      <div className="skeleton h-4 w-40" />
                      <div className="flex gap-3 overflow-hidden">{[1, 2, 3].map((item) => <div key={item} className="skeleton h-32 min-w-[132px] rounded-2xl" />)}</div>
                    </div>
                  ) : recommendations.length > 0 ? (
                    <section className="border-t border-[var(--line)] pt-5" aria-label="Tamamlayıcı ürünler">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="section-label">Sepeti tamamla</p>
                          <h3 className="mt-1 text-sm font-black text-[var(--ink)]">Bunlar da iyi gider</h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--ink-muted)]" aria-hidden="true" />
                      </div>
                      <div className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-1">
                        {recommendations.map((product) => (
                          <div key={product.id} className="min-w-[142px] snap-start overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)]" data-testid={`card-drawer-recommendation-${product.id}`}>
                            <Link href={`/products/${product.slug}`} onClick={onClose} className="block">
                              <div className="relative aspect-square bg-[var(--surface-muted)]">
                                {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="142px" unoptimized className="object-cover p-1.5" /> : <div className="flex h-full items-center justify-center text-xs text-[var(--ink-muted)]">Görsel yok</div>}
                              </div>
                              <div className="p-2.5">
                                <p className="line-clamp-2 min-h-8 text-[11px] font-bold leading-snug text-[var(--ink)]">{product.name}</p>
                                <p className="mt-1 text-xs font-black text-[var(--gold)]">{price(product.price)}</p>
                              </div>
                            </Link>
                            <button type="button" onClick={() => addRecommendation(product)} disabled={product.stock === 0} className="flex w-full items-center justify-center gap-1 border-t border-[var(--line)] bg-[var(--navy)] py-2 text-[11px] font-black text-[var(--surface)] hover:bg-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50" data-testid={`button-add-recommendation-${product.id}`}>
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {product.stock === 0 ? "Tükendi" : "Ekle"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-[var(--line)] bg-[var(--surface-elevated)] px-5 py-4 md:px-6">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-[var(--ink-muted)]">Ara toplam</span>
                  <span className="font-black text-[var(--ink)]">{price(subtotal)}</span>
                </div>
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-[var(--ink-muted)]">Kargo</span>
                  <span className={`font-black ${shipping === 0 ? "text-[var(--success)]" : "text-[var(--ink)]"}`}>{shipping === 0 ? "Ücretsiz" : price(shipping)}</span>
                </div>
                <Link href="/checkout" onClick={onClose} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--navy)] py-3.5 text-sm font-black text-[var(--surface)] shadow-lg transition-colors hover:bg-[var(--gold)]" data-testid="link-drawer-checkout">
                  Ödemeye geç <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/cart" onClick={onClose} className="mt-2 flex items-center justify-center gap-1 py-2 text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--gold)]" data-testid="link-view-full-cart">
                  Sepeti görüntüle <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-3">
                  {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="text-center">
                      <Icon className="mx-auto h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
                      <p className="mt-1 text-[10px] font-black leading-tight text-[var(--ink)]">{title}</p>
                      <p className="mt-0.5 text-[9px] leading-tight text-[var(--ink-muted)]">{text}</p>
                    </div>
                  ))}
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}