"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Minus, Plus, Package, Truck, Shield } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";

export default function ProductInfo({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] ?? "",
      quantity: qty,
    });
    toast.success(`${qty} adet sepete eklendi!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <span>{product.category?.name}</span>
        <span>•</span>
        <span className="font-medium text-zinc-600 dark:text-zinc-300">{product.brand?.name}</span>
      </div>
      <h1 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight">{product.name}</h1>
      <div className="flex items-center gap-3">
        <span className="text-4xl font-black text-zinc-900 dark:text-white">₺{Number(product.price).toLocaleString("tr-TR")}</span>
        {product.comparePrice && (
          <>
            <span className="text-xl text-zinc-400 line-through">₺{Number(product.comparePrice).toLocaleString("tr-TR")}</span>
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">-%{discount}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${product.stock === 0 ? "bg-red-500" : product.stock <= 5 ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
        <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-amber-600" : "text-green-600 dark:text-green-400"}`}>
          {product.stock === 0 ? "Stokta yok" : product.stock <= 5 ? `Son ${product.stock} ürün!` : "Stokta mevcut"}
        </span>
      </div>
      {product.stock > 0 && (
        <div className="flex gap-3">
          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-5 font-bold text-lg dark:text-white w-12 text-center">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg">
            <ShoppingCart className="w-5 h-5" /> Sepete Ekle
          </motion.button>
          <button className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Heart className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
      )}
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-6">{product.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
        {[
          { icon: Truck, text: "Ücretsiz Kargo", sub: "500₺ üzeri siparişlerde" },
          { icon: Shield, text: "Güvenli Ödeme", sub: "256-bit SSL şifrelemesi" },
          { icon: Package, text: "Kolay İade", sub: "30 gün iade garantisi" },
        ].map(({ icon: Icon, text, sub }) => (
          <div key={text} className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4">
            <Icon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm dark:text-white">{text}</p>
              <p className="text-zinc-400 text-xs mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
