"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, X } from "lucide-react";
import ProductImage from "@/components/store/product-image";

const STORAGE_KEY = "gocmen-recently-viewed";
const MAX_ITEMS = 6;

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
}

export function trackRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return;
  try {
    const stored: RecentProduct[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    const filtered = stored.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export default function RecentlyViewed({ currentId }: { currentId?: string }) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored: RecentProduct[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]"
      );
      setItems(stored.filter((p) => p.id !== currentId).slice(0, 4));
    } catch {}
  }, [currentId]);

  const remove = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-[#FAF7F2] border-t border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-[#B8973E]" />
          <h3 className="text-base font-black text-zinc-900">Son Görüntülediğiniz</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative flex-shrink-0 w-36 group"
            >
              <button
                onClick={() => remove(item.id)}
                className="absolute -top-2 -right-2 z-10 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <Link href={`/products/${item.slug}`}>
                <div className="relative aspect-square rounded-xl bg-white border border-[#E8E0D5] overflow-hidden mb-2 hover:border-[#D4AF5A] transition-colors">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="144px"
                    unoptimized
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    fallbackLabel=""
                  />
                </div>
                <p className="text-xs font-semibold text-zinc-800 line-clamp-2 leading-tight">
                  {item.name}
                </p>
                <p className="text-xs font-black text-[#B8973E] mt-0.5">
                  ₺{item.price.toLocaleString("tr-TR")}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
