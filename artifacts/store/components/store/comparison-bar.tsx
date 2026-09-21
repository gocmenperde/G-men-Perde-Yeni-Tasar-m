"use client";

import { useComparisonStore } from "@/lib/store/comparison";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, GitCompareArrows, ArrowRight } from "lucide-react";
import ProductImage from "@/components/store/product-image";

export default function ComparisonBar() {
  const { items, remove, clear } = useComparisonStore();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E0D5] shadow-[0_-8px_32px_rgba(0,0,0,0.10)] px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap md:flex-nowrap">
            {/* Icon + label */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <GitCompareArrows className="w-4 h-4 text-[#B8973E]" />
              <span className="text-xs font-bold text-zinc-700 whitespace-nowrap">
                Karşılaştır ({items.length}/3)
              </span>
            </div>

            {/* Product slots */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl px-2.5 py-1.5 flex-shrink-0 max-w-[160px]"
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    <ProductImage src={p.image} alt={p.name} width={32} height={32} className="w-full h-full object-cover" fallbackLabel="" />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-800 truncate">{p.name}</span>
                  <button
                    onClick={() => remove(p.id)}
                    className="flex-shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-[120px] h-11 border-2 border-dashed border-[#E8E0D5] rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-[11px] text-zinc-400">+ Ürün ekle</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <button
                onClick={clear}
                className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Temizle
              </button>
              <Link
                href="/karsilastir"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  items.length >= 2
                    ? "bg-zinc-900 hover:bg-[#B8973E] text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed pointer-events-none"
                }`}
              >
                Karşılaştır
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
