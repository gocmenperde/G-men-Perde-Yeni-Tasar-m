"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "./product-card";

export default function NewArrivals({ products }: { products: any[] }) {
  if (!products.length) return null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-widest">
            Yeni
          </span>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white mt-2">
            Yeni Gelenler
          </h2>
        </div>
        <Link
          href="/products?sort=newest"
          className="hidden md:block text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors border-b border-zinc-300 pb-0.5"
        >
          Tümünü Gör →
        </Link>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.slice(0, 8).map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
