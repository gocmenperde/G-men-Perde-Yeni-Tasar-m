"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import toast from "react-hot-toast";
import ProductImage from "@/components/store/product-image";

export default function RelatedProducts({ products }: { products: any[] }) {
  const addItem = useCartStore((state) => state.addItem);
  const [addedId, setAddedId] = useState<string | null>(null);

  if (!products.length) return null;

  const addProduct = (product: any) => {
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
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1600);
    toast.success("Tamamlayıcı ürün sepete eklendi.");
  };

  return (
    <div className="mt-16 border-t border-[#E8E0D5] pt-12 dark:border-[var(--line)]">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-2 text-2xl font-black text-zinc-900 dark:text-[var(--ink)]"
      >
        Birlikte iyi gider
      </motion.h2>
      <p className="mb-7 text-sm text-zinc-500 dark:text-[var(--ink-muted)]">Bu ürünü tamamlayan, aynı alışverişte işinize yarayacak seçenekler.</p>
      <div className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-3">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="min-w-[190px] max-w-[220px] snap-start overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm md:min-w-[220px]"
          >
            <Link href={`/products/${p.slug}`} prefetch={false} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
                <ProductImage
                  src={p.images?.[0]}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 190px, 220px"
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  fallbackLabel="Görsel yok"
                />
                {p.comparePrice && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white">
                    İndirimli
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 min-h-9 text-sm font-bold leading-snug text-zinc-800 transition-colors group-hover:text-[var(--gold)] dark:text-[var(--ink)]">{p.name}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-black text-[var(--gold)]">₺{Number(p.price).toLocaleString("tr-TR")}</span>
                  {p.comparePrice && <span className="text-[10px] text-zinc-400 line-through">₺{Number(p.comparePrice).toLocaleString("tr-TR")}</span>}
                </div>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => addProduct(p)}
              disabled={p.stock === 0}
              className={`flex w-full items-center justify-center gap-1.5 border-t border-[var(--line)] py-2.5 text-xs font-black transition-colors ${addedId === p.id ? "bg-emerald-600 text-white" : "bg-[var(--navy)] text-[var(--surface)] hover:bg-[var(--gold)]"} disabled:cursor-not-allowed disabled:opacity-50`}
              aria-label={`${p.name} ürününü sepete ekle`}
              data-testid={`button-add-related-${p.id}`}
            >
              {addedId === p.id ? <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Eklendi</> : p.stock === 0 ? "Tükendi" : <><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Sepete ekle</>}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
