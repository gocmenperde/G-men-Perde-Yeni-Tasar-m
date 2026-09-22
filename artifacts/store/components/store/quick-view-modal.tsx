"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X, ChevronLeft, ChevronRight, ShoppingCart, Heart,
  ExternalLink, ImageOff, Package,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import toast from "react-hot-toast";
import ProductImage from "@/components/store/product-image";
import { getCurtainMeasurementRequirements } from "@/lib/curtain-measurements";

interface Props {
  product: any;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const router = useRouter();
  const wished = has(product.id);
  const measurementRequirements = getCurtainMeasurementRequirements(product);
  const needsMeasurement = measurementRequirements.requiresWidth
    || measurementRequirements.requiresHeight
    || measurementRequirements.requiresPile;

  const images: string[] = product.images ?? [];

  const prev = useCallback(() => setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  const handleAdd = () => {
    if (product.stock === 0) return;
    if (needsMeasurement) {
      onClose();
      router.push(`/products/${product.slug}`);
      return;
    }
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: images[0] ?? "",
      quantity: 1,
    });
     toast.success(`"${product.name.slice(0, 28)}…" sepete eklendi!`);
  };

  const handleWish = () => {
    toggle(product.id, product.name, Number(product.price), images[0], product.slug);
     if (!wished) toast.success("Favorilere eklendi!");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        >
          {/* Sol: Görsel */}
          <div className="relative bg-zinc-50 dark:bg-zinc-800 md:w-[52%] flex-shrink-0 aspect-square md:aspect-auto">
            {images.length > 0 ? (
              <>
                <ProductImage
                  src={images[imgIdx]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 52vw"
                  unoptimized
                  className="object-contain p-4"
                  fallbackLabel="Görsel yok"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* Thumbnail şeridi */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4">
                      {images.slice(0, 6).map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                            i === imgIdx
                              ? "border-amber-500 scale-110"
                              : "border-white/60 dark:border-zinc-700 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <ProductImage src={img} alt="" width={32} height={32} sizes="32px" unoptimized className="object-cover w-full h-full" fallbackLabel="" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageOff className="w-16 h-16 text-zinc-300 dark:text-zinc-600" />
              </div>
            )}

            {/* İndirim rozeti */}
            {discount && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                %{discount} İNDİRİM
              </span>
            )}
          </div>

          {/* Sağ: Bilgi */}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Kapat */}
            <div className="flex items-start justify-between p-5 pb-3">
              <div className="flex-1 pr-4">
                {product.brand && (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    {product.brand.name}
                  </p>
                )}
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {product.name}
                </h2>
                {product.sku && (
                  <p className="text-xs text-zinc-400 mt-1">SKU: {product.sku}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fiyat */}
            <div className="px-5 py-3 border-t border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  ₺{Number(product.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
                {product.comparePrice && (
                  <span className="text-base text-zinc-400 line-through">
                    ₺{Number(product.comparePrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* Açıklama */}
            {product.description && (
              <div className="px-5 py-3 flex-1 overflow-y-auto">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-4">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stok durumu */}
            <div className="px-5 py-3">
              {product.stock === 0 ? (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">Stokta yok</span>
                </div>
              ) : product.stock <= 5 ? (
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">Son {product.stock} adet!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">Stokta var</span>
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="px-5 pb-5 pt-2 flex flex-col gap-2.5">
              <div className="flex gap-2">
                  <button
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-amber-500 hover:bg-zinc-700 dark:hover:bg-amber-400 text-white dark:text-zinc-900 font-bold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg"
                >
                   {needsMeasurement ? <ExternalLink className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                   {product.stock === 0 ? "Stokta Yok" : needsMeasurement ? "Ölçü Seç" : "Sepete Ekle"}
                </button>
                <button
                  onClick={handleWish}
                  className={`p-3 rounded-xl border transition-all ${
                    wished
                      ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-500"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wished ? "fill-red-500" : ""}`} />
                </button>
              </div>
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ürün sayfasına git
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
