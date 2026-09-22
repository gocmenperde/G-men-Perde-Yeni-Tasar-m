"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ProductImage from "@/components/store/product-image";
import { BRAND_IMAGES } from "@/lib/taxonomy-images";

const BRAND_YEAR: Record<string, string> = {
  "gocmen-perde": "1993",
};

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

function BrandCard({ brand }: { brand: Brand }) {
  const storedLogo = brand.logo?.trim() || null;
  const logoSrc = storedLogo || BRAND_IMAGES[brand.slug];
  const fallbackLogo = storedLogo ? BRAND_IMAGES[brand.slug] : undefined;

  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-zinc-50 hover:bg-amber-50 rounded-2xl border border-zinc-100 hover:border-amber-200 transition-all duration-200 cursor-default group min-w-[160px]">
      <div className="relative w-10 h-8 flex items-center justify-center bg-white rounded-lg border border-zinc-100 p-0.5 flex-shrink-0 overflow-hidden">
        {logoSrc ? (
          <ProductImage
            src={logoSrc}
            fallbackSrc={fallbackLogo}
            alt={brand.name}
            fill
            sizes="40px"
            unoptimized
            className="object-contain"
            fallbackLabel=""
          />
        ) : (
           <Sparkles className="w-5 h-5 text-[var(--gold)]" aria-hidden="true" />
        )}
      </div>
      <div>
        <p className="text-zinc-700 font-bold text-sm whitespace-nowrap group-hover:text-amber-600 transition-colors">
          {brand.name}
        </p>
        {BRAND_YEAR[brand.slug] && (
          <p className="text-zinc-400 text-xs">{BRAND_YEAR[brand.slug]}&apos;dan beri</p>
        )}
      </div>
    </div>
  );
}

export default function BrandSlider({ brands }: { brands: Brand[] }) {
  const displayBrands = brands;
  if (!displayBrands.length) return null;

  const doubled = [...displayBrands, ...displayBrands];

  return (
    <section className="py-12 border-y border-zinc-100 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <p className="text-center text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">
          Güvenilir Markalar
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-3"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((brand, i) => (
            <BrandCard key={`${brand.id}-${i}`} brand={brand} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
