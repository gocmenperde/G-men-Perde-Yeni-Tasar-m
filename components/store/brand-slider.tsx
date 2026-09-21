"use client";

import { motion } from "framer-motion";

const BRANDS = ["Apple", "Samsung", "Nike", "Adidas", "IKEA", "Zara", "Sony", "LG", "Puma", "H&M"];

export default function BrandSlider() {
  return (
    <section className="py-12 bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400 mb-6 font-semibold">
        Güvenilir Markalar
      </p>
      <div className="relative flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex gap-14 items-center whitespace-nowrap"
        >
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span
              key={i}
              className="text-2xl font-black text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-default select-none px-2"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
