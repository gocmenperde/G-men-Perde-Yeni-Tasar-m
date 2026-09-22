"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Star, TrendingUp, Tag, Sparkles, PanelTop, Sun, Layers3, House } from "lucide-react";

const QUICK_LINKS = [
  {
    href: "/products",
    icon: Sparkles,
    label: "Tüm Ürünler",
    sub: "500+ çeşit",
    bg: "bg-zinc-900",
    text: "text-white",
    border: "border-zinc-900",
    iconBg: "bg-white/15",
  },
  {
    href: "/products?sort=newest",
    icon: TrendingUp,
    label: "Yeni Gelenler",
    sub: "Bu hafta eklendi",
    bg: "bg-white",
    text: "text-zinc-900",
    border: "border-zinc-100",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    href: "/products?sale=true",
    icon: Tag,
    label: "İndirimli Ürünler",
    sub: "Fırsatları kaçırma",
    bg: "bg-white",
    text: "text-zinc-900",
    border: "border-zinc-100",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    href: "/products?featured=true",
    icon: Star,
    label: "Öne Çıkanlar",
    sub: "Editör seçimi",
    bg: "bg-white",
    text: "text-zinc-900",
    border: "border-zinc-100",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    href: "/kategori/tul-perde",
     icon: PanelTop,
    label: "Tül Perdeler",
    sub: "Zarif ve aydınlık",
    bg: "bg-white",
    text: "text-zinc-900",
    border: "border-zinc-100",
    iconBg: "bg-blue-50",
  },
  {
    href: "/kategori/fonperdeler",
     icon: Layers3,
    label: "Fon Perdeler",
    sub: "Salon ve yatak odası",
    bg: "bg-white",
    text: "text-zinc-900",
    border: "border-zinc-100",
    iconBg: "bg-purple-50",
  },
  {
    href: "/kategori/stor-perde",
     icon: Sun,
    label: "Stor Perdeler",
    sub: "Güneş kontrolü",
    bg: "bg-white",
    text: "text-zinc-900",
    border: "border-zinc-100",
    iconBg: "bg-pink-50",
  },
  {
    href: "/kategori/zebra-perde",
     icon: House,
    label: "Zebra Perdeler",
    sub: "Modern ve kullanışlı",
    bg: "bg-white",
    text: "text-zinc-900",
    border: "border-zinc-100",
    iconBg: "bg-orange-50",
  },
];

export default function HeroQuickLinks() {
  return (
    <section className="bg-[#FAFAF8] py-6 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-500" />
           <span className="text-xs font-black tracking-[.12em] text-zinc-500">Hızlı Erişim</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {QUICK_LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={link.href}
                  className={`group flex flex-col gap-2 p-3 rounded-2xl border ${link.bg} ${link.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${link.bg === "bg-zinc-900" ? "bg-white/15" : link.iconBg}`}>
                     {Icon && <Icon className={`w-4 h-4 ${link.bg === "bg-zinc-900" ? "text-white" : (link as any).iconColor ?? "text-zinc-600"}`} />}
                  </div>
                  <div>
                    <p className={`font-bold text-xs leading-tight ${link.text} group-hover:text-amber-600 ${link.bg === "bg-zinc-900" ? "!text-white group-hover:!text-amber-300" : ""} transition-colors`}>
                      {link.label}
                    </p>
                    <p className={`text-[10px] mt-0.5 leading-tight ${link.bg === "bg-zinc-900" ? "text-white/60" : "text-zinc-400"}`}>
                      {link.sub}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
