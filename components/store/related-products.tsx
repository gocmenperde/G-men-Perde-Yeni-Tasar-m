"use client";
import { motion } from "framer-motion";
import ProductCard from "./product-card";

export default function RelatedProducts({ products }: { products: any[] }) {
  if (!products.length) return null;

  return (
    <div className="mt-16 border-t border-zinc-100 dark:border-zinc-800 pt-12">
      <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl font-black dark:text-white mb-8">
        Benzer Ürünler
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
