"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShoppingCart, ArrowRight, Flame, Clock, Check, ImageOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 47, s: 23 });

  useEffect(() => {
    const stored = sessionStorage.getItem("flashSaleEnd");
    let endTime: number;
    if (stored) {
      endTime = parseInt(stored);
    } else {
      endTime = Date.now() + (5 * 3600 + 47 * 60 + 23) * 1000;
      sessionStorage.setItem("flashSaleEnd", endTime.toString());
    }

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      if (diff === 0) {
        const newEnd = Date.now() + 24 * 3600 * 1000;
        sessionStorage.setItem("flashSaleEnd", newEnd.toString());
        endTime = newEnd;
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 md:w-20 md:h-20">
        {/* Top half */}
        <div className="absolute inset-0 top-0 h-1/2 bg-white/15 backdrop-blur-sm rounded-t-xl border-b border-white/10 flex items-end justify-center pb-0.5">
           <span className="text-xl md:text-3xl font-black text-white tabular-nums leading-none">{v}</span>
        </div>
        {/* Bottom half */}
        <div className="absolute inset-0 top-1/2 h-1/2 bg-white/10 backdrop-blur-sm rounded-b-xl flex items-start justify-center pt-0.5">
           <span className="text-xl md:text-3xl font-black text-white tabular-nums leading-none">{v}</span>
        </div>
        {/* Divider line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/20 z-10" />
      </div>
      <span className="text-[9px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1.5 md:mt-2">{label}</span>
    </div>
  );
}

function FlashProductCard({ product }: { product: any }) {
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0 || adding) return;
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] ?? "",
      quantity: 1,
      stock: product.stock,
    });
    setAdding(true);
    setTimeout(() => setAdding(false), 1800);
    toast.success("Sepete eklendi!");
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:bg-white/18">
      <Link href={`/products/${product.slug}`} prefetch={false} className="flex flex-1 flex-col" data-testid={`link-flash-product-${product.id}`}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {product.images?.[0] && !imgError ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30"><ImageOff className="h-8 w-8" aria-hidden="true" /></div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {discount && discount > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[12px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30">
            <Flame className="w-3 h-3" />
            −{discount}%
          </div>
        )}

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-2 inset-x-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-2 py-1 text-center">
              <p className="text-[10px] font-bold text-orange-300">Son {product.stock} adet!</p>
              <div className="mt-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                  style={{ width: `${(product.stock / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <p className="text-[10px] text-amber-300 uppercase tracking-widest font-extrabold mb-1">
            {product.brand.name}
          </p>
        )}
        <h3 className="text-white font-bold text-[13px] leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-4 mt-auto">
          <span className="text-[18px] font-black text-white leading-none">
            ₺{Number(product.price).toLocaleString("tr-TR")}
          </span>
          {product.comparePrice && (
            <span className="text-[13px] text-white/40 line-through">
              ₺{Number(product.comparePrice).toLocaleString("tr-TR")}
            </span>
          )}
        </div>

      </div>
      </Link>

        {/* Add to cart */}
        <motion.button
          onClick={handleAdd}
          disabled={product.stock === 0}
          whileTap={{ scale: 0.96 }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 ${
            adding
              ? "bg-emerald-500 text-white"
              : product.stock === 0
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/25"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {adding ? (
              <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Eklendi!
              </motion.span>
            ) : product.stock === 0 ? (
              <motion.span key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Tükendi</motion.span>
            ) : (
              <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Sepete Ekle
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
    </div>
  );
}

export default function FlashSale({ products = [] }: { products?: any[] }) {
  const { h, m, s } = useCountdown();
  if (!products.length) return null;

  return (
    <section className="relative overflow-hidden py-20">
      {/* ── Dramatic dark background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-[#0f0c08] to-zinc-950" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/30 to-transparent blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.20, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-orange-600/20 to-transparent blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-red-600/15 to-transparent blur-3xl pointer-events-none"
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div className="relative max-w-7xl mx-auto px-4">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16"
        >
          {/* Title */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/40"
              >
                <Zap className="w-5 h-5 text-white fill-white" />
              </motion.div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
                Flaş İndirim
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Bugüne Özel
              <br />
              <span className="text-gradient-warm">Fırsatlar</span>
            </h2>
            <p className="text-zinc-400 mt-3 text-[15px] max-w-sm">
              Sınırlı stok, sınırlı süre. Fırsatı kaçırmayın!
            </p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <span className="text-[12px] font-bold uppercase tracking-widest">Kalan Süre</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-3">
              <TimeUnit value={h} label="Saat" />
              <span className="text-3xl font-black text-white/40 mb-5">:</span>
              <TimeUnit value={m} label="Dakika" />
              <span className="text-3xl font-black text-white/40 mb-5">:</span>
              <TimeUnit value={s} label="Saniye" />
            </div>
          </div>
        </motion.div>

        {/* ── Products ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-12">
          {products.slice(0, 5).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <FlashProductCard product={p} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/products?hasDiscount=true"
            className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-amber-500/30 text-[14.5px]"
          >
            <Flame className="w-5 h-5" />
            Tüm Kampanyaları Gör
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
