"use client";

import { useComparisonStore } from "@/lib/store/comparison";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2, ImageOff, ArrowLeft, GitCompareArrows, Check, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const FIELDS: { key: string; label: string }[] = [
  { key: "brand",       label: "Marka" },
  { key: "category",    label: "Kategori" },
  { key: "sku",         label: "SKU" },
  { key: "barcode",     label: "Barkod" },
  { key: "stock",       label: "Stok" },
  { key: "description", label: "Açıklama" },
];

export default function KarsilastirPage() {
  const { items, remove, clear } = useComparisonStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (p: typeof items[0]) => {
    addItem({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image ?? "", quantity: 1 });
    toast.success(`${p.name} sepete eklendi!`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-3xl bg-[#B8973E]/10 flex items-center justify-center">
          <GitCompareArrows className="w-10 h-10 text-[#B8973E]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-zinc-900 mb-2">Karşılaştırılacak ürün yok</h1>
          <p className="text-zinc-500 text-sm">Ürün kartlarındaki karşılaştırma butonuna basarak ürün ekleyin.</p>
        </div>
        <Link href="/products" className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold rounded-2xl transition-all">
          <ArrowLeft className="w-4 h-4" />
          Ürünlere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E0D5] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/products" className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-black text-zinc-900 flex items-center gap-2">
                <GitCompareArrows className="w-5 h-5 text-[#B8973E]" />
                Ürün Karşılaştırma
              </h1>
              <p className="text-xs text-zinc-500">{items.length} ürün karşılaştırılıyor</p>
            </div>
          </div>
          <button onClick={clear} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            Temizle
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-x-3">
          <colgroup>
            <col className="w-32" />
            {items.map((p) => <col key={p.id} />)}
          </colgroup>

          {/* Product header cards */}
          <thead>
            <tr>
              <th />
              {items.map((p) => (
                <th key={p.id} className="align-top pb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden"
                  >
                    {/* Remove */}
                    <div className="flex justify-end p-2">
                      <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image */}
                    <Link href={`/products/${p.slug}`} className="block">
                      <div className="aspect-square relative bg-zinc-50 mx-4 rounded-xl overflow-hidden">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="200px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-8 h-8 text-zinc-300" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Name + price */}
                    <div className="p-4 space-y-2">
                      <Link href={`/products/${p.slug}`} className="block">
                        <h2 className="font-bold text-zinc-900 text-sm leading-snug hover:text-[#B8973E] transition-colors line-clamp-2">
                          {p.name}
                        </h2>
                      </Link>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-black ${p.comparePrice ? "text-red-600" : "text-zinc-900"}`}>
                          ₺{p.price.toLocaleString("tr-TR")}
                        </span>
                        {p.comparePrice && (
                          <span className="text-sm text-zinc-400 line-through">
                            ₺{p.comparePrice.toLocaleString("tr-TR")}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAdd(p)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-[#B8973E] text-white text-sm font-bold rounded-xl transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Sepete Ekle
                      </button>
                    </div>
                  </motion.div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Comparison rows */}
          <tbody>
            {FIELDS.map(({ key, label }) => (
              <tr key={key} className="group">
                <td className="py-3 pr-4 align-middle">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{label}</span>
                </td>
                {items.map((p) => {
                  const val = (p as any)[key];
                  const display =
                    key === "stock"
                      ? val == null ? "—" : val === 0 ? "Tükendi" : `${val} adet`
                      : val || "—";
                  const isEmpty = !val;

                  return (
                    <td key={p.id} className="py-3 align-middle">
                      <div className="bg-white rounded-xl border border-[#E8E0D5] px-4 py-3 group-hover:border-amber-200 transition-colors min-h-[3rem] flex items-start">
                        <span className={`text-sm leading-relaxed ${isEmpty ? "text-zinc-300 italic" : key === "stock" && val === 0 ? "text-red-500 font-semibold" : key === "stock" ? "text-emerald-600 font-semibold" : "text-zinc-700"}`}>
                          {display}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Price row highlight */}
            <tr>
              <td className="py-3 pr-4 align-middle">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">En Ucuz</span>
              </td>
              {(() => {
                const minPrice = Math.min(...items.map((p) => p.price));
                return items.map((p) => (
                  <td key={p.id} className="py-3 align-middle">
                    <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 min-h-[3rem] ${p.price === minPrice ? "bg-emerald-50 border-emerald-200" : "bg-white border-[#E8E0D5]"}`}>
                      {p.price === minPrice && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                      <span className={`text-sm font-bold ${p.price === minPrice ? "text-emerald-700" : "text-zinc-400"}`}>
                        {p.price === minPrice ? "En uygun fiyat" : "—"}
                      </span>
                    </div>
                  </td>
                ));
              })()}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
