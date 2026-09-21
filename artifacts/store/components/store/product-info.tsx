"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, Minus, Plus, Package, PackageSearch, Headphones, Truck, Shield, Star, Check, AlertTriangle,
  CreditCard, ChevronDown, Copy, CheckCheck, Flame,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import SocialShare from "@/components/store/social-share";
import { trackRecentlyViewed } from "@/components/store/recently-viewed";
import dynamic from "next/dynamic";
import ProductImage from "@/components/store/product-image";
const SaleCountdown = dynamic(() => import("@/components/store/sale-countdown"), { ssr: false });
const SameDayShipping = dynamic(() => import("@/components/store/same-day-shipping"), { ssr: false });

export default function ProductInfo({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [viewers, setViewers] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [restockEmail, setRestockEmail] = useState("");
  const [restockStatus, setRestockStatus] = useState<"idle" | "sending" | "done">("idle");
  const [showInstallment, setShowInstallment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDesktopBar, setShowDesktopBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const copyBarcode = useCallback(() => {
    const val = product.barcode ?? product.sku;
    if (!val) return;
    navigator.clipboard.writeText(String(val)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [product.barcode, product.sku]);
  const addItem = useCartStore((s) => s.addItem);
  const { data: session } = useSession();

  // Desktop sticky bar: CTA görünmez olduğunda üstte sabit çubuk göster
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowDesktopBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const base = Math.floor(Math.random() * 12) + 3;
    setViewers(base);
    const interval = setInterval(() => {
      setViewers((v) => Math.max(2, Math.min(24, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!product?.id) return;
    trackRecentlyViewed({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0],
    });
  }, [product?.id]);

  useEffect(() => {
    if (!session || !product?.id) return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((j) => setIsWishlisted((j.data ?? []).some((w: any) => w.productId === product.id)))
      .catch(() => {});
  }, [session, product?.id]);

  const submitRestock = async () => {
    if (!restockEmail) return;
    setRestockStatus("sending");
    try {
      const res = await fetch("/api/restock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, email: restockEmail }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setRestockStatus("done");
      toast.success("Ürün stoğa girince size e-posta göndereceğiz!");
    } catch (e: any) {
      setRestockStatus("idle");
      toast.error(e.message ?? "Bir hata oluştu.");
    }
  };

  const toggleWishlist = async () => {
    if (!session) { toast.error("Favorilere eklemek için giriş yapınız."); return; }
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const j = await res.json();
       if (j.action === "added") { setIsWishlisted(true); toast.success("Favorilere eklendi!"); }
      else { setIsWishlisted(false); toast("Favorilerden kaldırıldı."); }
    } catch { toast.error("Bir hata oluştu."); }
    finally { setWishlistLoading(false); }
  };

  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  const validRatings = (product.reviews ?? [])
    .map((review: any) => Number(review.rating))
    .filter((rating: number) => Number.isFinite(rating) && rating >= 1 && rating <= 5);
  const avgRating = validRatings.length
    ? validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length
    : null;
  const reviewCount = validRatings.length;

  const handleAdd = () => {
    if ((product.stock ?? 0) < 1) { toast.error("Bu ürün stokta yok."); return; }
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] ?? "",
      quantity: qty,
      stock: product.stock ?? 0,
    });
    toast.success(`${qty} adet sepete eklendi!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const phone = "905462851826";
  const waMsg = encodeURIComponent(`Merhaba, "${product.name}" ürününü sipariş etmek istiyorum.`);
  const waHref = `https://wa.me/${phone}?text=${waMsg}`;

  const QtySelector = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] overflow-hidden ${compact ? "h-11" : "h-12"}`}>
      <button
        onClick={() => setQty((q) => Math.max(1, q - 1))}
         className="touch-target px-3.5 text-zinc-500 hover:text-zinc-900 hover:bg-[#F0EAE0] transition-colors h-full"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="px-4 font-bold text-zinc-900 min-w-[2.5rem] text-center text-sm">{qty}</span>
      <button
        onClick={() => setQty((q) => Math.min(product.stock ?? 99, q + 1))}
         className="touch-target px-3.5 text-zinc-500 hover:text-zinc-900 hover:bg-[#F0EAE0] transition-colors h-full"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-5 pb-40 md:pb-0"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span>{product.category?.name}</span>
        {product.brand && (
          <>
            <span>•</span>
            <span className="font-semibold text-[#B8973E]">{product.brand?.name}</span>
          </>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">{product.name}</h1>

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-3" aria-label={reviewCount > 0 ? `Ürün puanı: ${avgRating!.toFixed(1)} / 5` : "Henüz değerlendirme yok"}>
        {reviewCount > 0 ? (
          <>
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating!) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
              ))}
            </div>
            <span className="text-sm font-black text-zinc-900">{avgRating!.toFixed(1)}</span>
            <a href="#reviews" className="text-sm text-zinc-500 hover:text-[#B8973E] transition-colors underline underline-offset-2">
              {reviewCount} değerlendirme
            </a>
          </>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-500">
            <Star className="w-3.5 h-3.5 text-zinc-400" /> Henüz değerlendirme yok
          </span>
        )}
      </div>

      {/* Sipariş desteği ürün akışında kalır; sabit CTA ile çakışmaz. */}
      <div className="flex flex-wrap items-center gap-2.5 md:hidden" aria-label="Sipariş desteği">
        <a
          href="/orders"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3.5 text-xs font-black text-[var(--ink)] shadow-sm backdrop-blur-md transition-all hover:border-[var(--gold)]/50 hover:text-[var(--gold)]"
          aria-label="Sipariş takibi"
        >
          <PackageSearch className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
          Takip
        </a>
        <button
          type="button"
          onClick={() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent("Merhaba, canlı destek almak istiyorum.")}`, "_blank")}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3.5 text-xs font-black text-[var(--ink)] shadow-sm backdrop-blur-md transition-all hover:border-[var(--gold)]/50 hover:text-[var(--gold)]"
          aria-label="Canlı destek"
        >
          <Headphones className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
          Destek
        </button>
      </div>

      {/* Price */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E8E0D5] bg-gradient-to-br from-white via-[#FAF7F2] to-[#F2EADB] p-5 shadow-[0_12px_35px_-24px_rgba(80,62,30,0.65)]">
        <div className="flex items-end gap-3 flex-wrap">
          <span className="text-4xl font-black text-zinc-900 leading-none">
            ₺{Number(product.price).toLocaleString("tr-TR")}
          </span>
          {product.comparePrice && (
            <>
              <span className="text-xl text-zinc-400 line-through pb-0.5">
                ₺{Number(product.comparePrice).toLocaleString("tr-TR")}
              </span>
              <span className="bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full">
                %{discount} İNDİRİM
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-emerald-600 font-semibold mt-2 flex items-center gap-1.5">
           <Truck className="w-3.5 h-3.5" /> Hızlı teslimat · Türkiye geneli
        </p>
      </div>

      {/* Premium güven şeridi */}
      <div className="grid grid-cols-3 gap-2.5" aria-label="Alışveriş avantajları">
        {[
          { icon: Truck, title: "Hızlı teslimat", text: "Özenli paketleme" },
          { icon: Shield, title: "Güvenli ödeme", text: "Korunan alışveriş" },
          { icon: Package, title: "Orijinal ürün", text: "Kontrollü gönderim" },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-[#E8E0D5]/80 bg-white/70 p-3 text-center shadow-sm backdrop-blur-sm">
            <Icon className="mx-auto mb-1.5 h-4 w-4 text-[#B8973E]" />
            <p className="text-[11px] font-black leading-tight text-zinc-800">{title}</p>
            <p className="mt-1 text-[10px] leading-tight text-zinc-500">{text}</p>
          </div>
        ))}
      </div>

      {/* Flash sale pulse: gerçek ürün indirimi ve stok bilgisiyle görünür. */}
      {product.comparePrice && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-600 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Flaş fırsat
          </span>
          {product.stock > 0 && product.stock <= 10 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/25 dark:text-orange-300">
              Son {product.stock} adet
            </span>
          )}
        </div>
      )}
      {product.comparePrice && <SaleCountdown />}

      {/* Aynı gün kargo sayacı */}
      <SameDayShipping stock={product.stock ?? 0} />

      {/* Live viewers */}
      {viewers > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-zinc-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span>Şu an <strong className="text-zinc-900">{viewers} kişi</strong> bu ürüne bakıyor</span>
        </motion.div>
      )}

      {/* Stock */}
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${product.stock === 0 ? "bg-red-500" : product.stock <= 10 ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
        <span className={`text-sm font-semibold ${product.stock === 0 ? "text-red-500" : product.stock <= 10 ? "text-amber-600" : "text-green-600"}`}>
          {product.stock === 0 ? "Stokta yok" : product.stock <= 10 ? `Son ${product.stock} ürün — hemen sipariş verin!` : `Stokta mevcut (${product.stock} adet)`}
        </span>
      </div>

      {/* ── DESKTOP: Qty + Sepete Ekle + Wishlist ── */}
      {product.stock > 0 && (
        <div ref={ctaRef} className="hidden md:flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <QtySelector />
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 h-12 flex items-center justify-center gap-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${added ? "bg-green-600 shadow-green-200" : "bg-zinc-900 hover:bg-[#B8973E] shadow-zinc-200/80"} text-white`}
            >
              {added ? (
                <><Check className="w-4 h-4" /> Sepete Eklendi!</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Sepete Ekle</>
              )}
            </motion.button>
            <motion.button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              whileTap={{ scale: 0.93 }}
              className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition-all ${isWishlisted ? "border-red-400 bg-red-50 text-red-500" : "border-[#E8E0D5] text-zinc-400 hover:border-red-300 hover:text-red-400"}`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
            </motion.button>
          </div>

          {/* WhatsApp */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 border border-[#25D366]/30 text-[#25D366] font-semibold py-3 rounded-xl hover:bg-[#25D366]/5 transition-colors text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp ile Sipariş Ver
          </a>
        </div>
      )}

      {/* ── MOBILE: only WhatsApp (Sepete Ekle is in sticky bar) ── */}
      {product.stock > 0 && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl hover:bg-[#1ebe5d] transition-colors shadow-md"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp ile Sipariş Ver
        </a>
      )}

      {/* Out-of-stock notify */}
      {(product.stock ?? 0) === 0 && (
        <div className="border border-orange-100 bg-orange-50 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-orange-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Bu ürün şu an stokta yok
          </p>
          {restockStatus === "done" ? (
            <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> Kaydınız alındı — stoğa girince e-posta ile haber vereceğiz!
            </p>
          ) : (
            <>
              <p className="text-xs text-orange-600 leading-relaxed">
                E-posta adresinizi bırakın, ürün stoğa girince anında haber verelim.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={restockEmail}
                  onChange={(e) => setRestockEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitRestock()}
                  placeholder="e-posta@adresiniz.com"
                  className="flex-1 text-sm border border-orange-200 bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-orange-300"
                />
                <button
                  onClick={submitRestock}
                  disabled={restockStatus === "sending" || !restockEmail}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap"
                >
                  {restockStatus === "sending" ? "…" : "Haber Ver"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Description */}
      {(product.description || product.barcode || product.sku) && (
        <div id="product-details" className="border-t border-[#E8E0D5] pt-5 space-y-3">
          <h3 className="font-bold text-zinc-900 text-sm">Ürün Açıklaması</h3>
          {product.description && (
            <p className="text-zinc-600 leading-relaxed text-sm">{product.description}</p>
          )}
          {(product.barcode || product.sku) && (
            <button
              onClick={copyBarcode}
              className="group flex items-center gap-2 text-xs font-mono bg-zinc-50 hover:bg-amber-50 border border-[#E8E0D5] hover:border-amber-200 rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer"
              title="Kopyalamak için tıklayın"
            >
              <span className="text-zinc-400">Barkod:</span>
              <span className="text-zinc-700 font-semibold">{product.barcode ?? product.sku}</span>
              {copied
                ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500 ml-1" />
                : <Copy className="w-3 h-3 text-zinc-400 group-hover:text-amber-500 ml-1 transition-colors" />
              }
              {copied && <span className="text-emerald-500 font-sans font-semibold not-italic">Kopyalandı!</span>}
            </button>
          )}
          <ul className="space-y-2 text-sm text-zinc-600">
            {["Orijinal ürün garantisi", "Hızlı kargo ve özenli paketleme"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#B8973E]/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#B8973E]" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Taksit tablosu */}
      {Number(product.price) >= 100 && (product.stock ?? 0) > 0 && (
        <div className="border border-[#E8E0D5] rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowInstallment((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF7F2] hover:bg-[#F0EAE0] transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-zinc-800">
              <CreditCard className="w-4 h-4 text-[#B8973E]" />
              Taksit Seçenekleri
            </span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showInstallment ? "rotate-180" : ""}`} />
          </button>
          {showInstallment && (
            <div className="border-t border-[#E8E0D5]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF7F2]">
                    <th className="text-left px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wide">Taksit</th>
                    <th className="text-right px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wide">Aylık Ödeme</th>
                    <th className="text-right px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wide">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 1,  rate: 0 },
                    { n: 2,  rate: 0 },
                    { n: 3,  rate: 0 },
                    { n: 6,  rate: 2.5 },
                    { n: 9,  rate: 4.5 },
                    { n: 12, rate: 7 },
                  ].map(({ n, rate }) => {
                    const base = Number(product.price);
                    const total = base * (1 + rate / 100);
                    const monthly = total / n;
                    return (
                      <tr key={n} className="border-t border-[#E8E0D5] hover:bg-[#FAF7F2] transition-colors">
                        <td className="px-4 py-3 font-semibold text-zinc-800">
                          {n === 1 ? "Tek çekim" : `${n} Taksit`}
                          {rate === 0 && <span className="ml-1.5 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 rounded px-1 py-0.5">Faizsiz</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-900">
                          {n === 1 ? "—" : `₺${monthly.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600">
                          ₺{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="px-4 py-2.5 text-[10px] text-zinc-400 border-t border-[#E8E0D5] bg-[#FAF7F2]">
                * Taksit seçenekleri bankanıza göre farklılık gösterebilir. Oranlar yaklaşık hesaplanmıştır.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Social share */}
      <div className="border-t border-[#E8E0D5] pt-4">
        <SocialShare title={product.name} url={`/products/${product.slug}`} />
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 border-t border-[#E8E0D5] pt-5">
        {[
           { icon: Truck, text: "Aynı gün kargo", sub: "Hızlı hazırlık" },
           { icon: Shield, text: "256-bit SSL", sub: "Güvenli ödeme" },
           { icon: Package, text: "14 gün iade", sub: "İade garantisi" },
        ].map(({ icon: Icon, text, sub }) => (
          <div key={text} className="flex flex-col items-center gap-1.5 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-[#B8973E]/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#B8973E]" />
            </div>
            <p className="font-bold text-xs text-zinc-900">{text}</p>
            <p className="text-zinc-400 text-[10px]">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── DESKTOP STICKY BAR — CTA kaydırıldığında üstte görünür ── */}
      <AnimatePresence>
        {showDesktopBar && product.stock > 0 && (
          <motion.div
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -72, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
             className="fixed top-[100px] left-0 right-0 z-40 hidden md:flex items-center gap-4 bg-[var(--surface)]/95 dark:bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--line)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-6 py-2.5"
          >
            {/* Ürün görseli */}
            {product.images?.[0] && (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#E8E0D5] flex-shrink-0">
                <ProductImage src={product.images} alt={product.name} width={40} height={40} className="w-full h-full object-cover" fallbackLabel="" />
              </div>
            )}
            {/* Ürün adı + fiyat */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate leading-tight">{product.name}</p>
              <p className="text-xs text-[#B8973E] font-black">₺{Number(product.price).toLocaleString("tr-TR")}</p>
            </div>
            {/* Qty */}
            <div className="flex items-center rounded-lg border border-[#E8E0D5] overflow-hidden h-9 flex-shrink-0">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2.5 text-zinc-500 hover:bg-[#F0EAE0] h-full transition-colors"><Minus className="w-3 h-3" /></button>
              <span className="px-3 text-sm font-bold text-zinc-900 min-w-[2rem] text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock ?? 99, q + 1))} className="px-2.5 text-zinc-500 hover:bg-[#F0EAE0] h-full transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
            {/* Sepete Ekle */}
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${added ? "bg-green-600 text-white" : "bg-zinc-900 hover:bg-[#B8973E] text-white"}`}
            >
              {added ? <><Check className="w-4 h-4" />Eklendi!</> : <><ShoppingCart className="w-4 h-4" />Sepete Ekle</>}
            </motion.button>
            {/* Favori */}
            <motion.button
              onClick={toggleWishlist}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-xl border-2 transition-all ${isWishlisted ? "border-red-400 bg-red-50 text-red-500" : "border-[#E8E0D5] text-zinc-400 hover:border-red-300 hover:text-red-400"}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE STICKY BAR ── */}
       <div className="mobile-cart-sticky fixed left-0 right-0 z-[90] px-4 pb-2 md:hidden">
         <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 dark:bg-[var(--surface)]/95 p-3 shadow-xl backdrop-blur-md flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] overflow-hidden flex-shrink-0">
             <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
               className="touch-target px-3 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-[#F0EAE0] transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-2.5 text-sm font-bold text-zinc-900 min-w-[2rem] text-center">{qty}</span>
             <button
              onClick={() => setQty((q) => Math.min(product.stock ?? 99, q + 1))}
               className="touch-target px-3 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-[#F0EAE0] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
           <button
            onClick={handleAdd}
            disabled={(product.stock ?? 0) < 1}
             className="touch-target flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#B8973E] hover:bg-[#9E7F32] text-white font-bold py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            {(product.stock ?? 0) < 1 ? "Tükendi" : "Sepete Ekle"}
          </button>
           <button
            onClick={toggleWishlist}
             className={`touch-target p-2.5 rounded-xl border transition-colors ${isWishlisted ? "border-red-300 text-red-500 bg-red-50" : "border-[#E8E0D5] text-zinc-400"}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
