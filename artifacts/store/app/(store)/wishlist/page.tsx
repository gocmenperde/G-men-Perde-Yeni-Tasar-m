"use client";

import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Star, PenLine } from "lucide-react";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (item: typeof items[number]) => {
    addItem({ id: item.id, slug: item.slug, name: item.name, price: item.price, image: item.image ?? "", quantity: 1 });
    toast.success("Sepete eklendi!");
  };

  const handleAddAll = () => {
    items.forEach((item) => addItem({ id: item.id, slug: item.slug, name: item.name, price: item.price, image: item.image ?? "", quantity: 1 }));
    toast.success(`${items.length} ürün sepete eklendi!`);
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--cream)] py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <Link href="/products" className="touch-target flex items-center justify-center p-2.5 rounded-xl hover:bg-[var(--surface)] border border-transparent hover:border-[var(--line)] transition-all" aria-label="Ürünlere dön">
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2.5">
                <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                Favorilerim
              </h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                {items.length === 0 ? "Henüz favori ürün yok" : `${items.length} ürün kaydedildi`}
              </p>
            </div>
          </div>

          {items.length > 1 && (
            <motion.button
              onClick={handleAddAll}
              whileTap={{ scale: 0.97 }}
             className="touch-target hidden sm:flex items-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Tümünü Sepete Ekle
            </motion.button>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
             className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl text-center py-24 px-8"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
              <Heart className="w-9 h-9 text-red-300" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-3">Favori listeniz boş</h2>
            <p className="text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
               Beğendiğiniz ürünleri listenizde tutun; beğendiğiniz anda tek dokunuşla sepete ekleyin.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-lg"
            >
              <Package className="w-4 h-4" />
              Ürünleri Keşfet
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ delay: i * 0.04 }}
                     className="group bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden hover:border-zinc-200 hover:shadow-lg transition-all duration-300"
                  >
                    <Link href={`/products/${item.slug}`} className="block relative aspect-square bg-zinc-50 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <PenLine className="w-10 h-10 text-[var(--gold)] opacity-40" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <div className="p-4">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 hover:text-amber-600 transition-colors mb-2">
                          {item.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                        ))}
                      </div>

                      <p className="font-black text-zinc-900 text-lg mb-4">
                        ₺{item.price.toLocaleString("tr-TR")}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Sepete Ekle
                        </button>
                        <button
                          onClick={() => toggle(item.id, item.name, item.price, item.image, item.slug)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl transition-colors"
                          aria-label="Favoriden kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {items.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-white border border-zinc-100 rounded-2xl"
              >
                <p className="text-zinc-500 text-sm">
                  <span className="font-bold text-zinc-900">{items.length} ürün</span> listenizde — hepsini sepete ekleyin!
                </p>
                <button
                  onClick={handleAddAll}
                  className="sm:hidden flex items-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold px-6 py-3 rounded-xl transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Tümünü Sepete Ekle
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
