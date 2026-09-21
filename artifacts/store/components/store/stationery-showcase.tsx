"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  Truck,
  HeadphonesIcon,
  ArrowRight,
  CheckCircle2,
  Pencil,
  BookOpen,
  Palette,
  Backpack,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Award,
    title: "Orijinal Ürünler",
    desc: "Tüm ürünlerimiz yetkili distribütörlerden temin edilir. Sahte ürün garantisi veriyoruz.",
    badge: "Yetkili bayi",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
    lightBg: "bg-amber-50",
    lightBorder: "border-amber-100",
    badgeCls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: Truck,
    title: "Hızlı Teslimat",
    desc: "Bursa içi aynı gün kargo. Türkiye geneline 1–3 iş günü içinde hızlı teslimat.",
    badge: "Aynı gün çıkış",
    gradient: "from-blue-500 to-indigo-500",
    glow: "shadow-blue-500/20",
    lightBg: "bg-blue-50",
    lightBorder: "border-blue-100",
    badgeCls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    icon: HeadphonesIcon,
    title: "7/24 Destek",
    desc: "WhatsApp, telefon veya e-posta ile her zaman yanınızdayız. Ortalama 5 dakika yanıt süresi.",
    badge: "Ortalama 5 dakika",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/20",
    lightBg: "bg-violet-50",
    lightBorder: "border-violet-100",
    badgeCls: "bg-violet-50 text-violet-700 border-violet-200",
  },
];

const QUICK_LINKS = [
  { Icon: Pencil,   label: "Kalemler",          href: "/kategori/kirtasiye",      count: "50+" },
  { Icon: BookOpen, label: "Defterler",         href: "/kategori/kareli-defter",  count: "30+" },
  { Icon: Palette,  label: "Sanat Malzemeleri", href: "/kategori/sulu-boyalar",   count: "80+" },
  { Icon: Backpack, label: "Okul Gereçleri",    href: "/kategori/tahta-kalemleri-ve-gerecleri", count: "40+" },
];

export default function StationeryShowcase() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      {/* ── Neden Biz ── */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-[#F5EFE4]">
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full border border-[#DCC8A7]/70" />
        <div className="absolute -right-12 top-28 h-48 w-48 rounded-full border border-[#DCC8A7]/50" />
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.55 }}
            className="text-center mb-16"
          >
            <span className="section-label justify-center block mb-4">Farkımız</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight mb-4 leading-tight">
              Neden{" "}
              <span style={{
                background: "linear-gradient(135deg, #d97706, #B8973E, #D4AF5A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Göçmen Kırtasiye?
              </span>
            </h2>
            <p className="text-[#62584D] max-w-lg mx-auto text-[16px] leading-relaxed">
              30 yıllık tecrübemiz ve müşteri odaklı hizmet anlayışımızla kırtasiye alışverişini yeniden tanımlıyoruz.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
            {FEATURES.map(({ icon: Icon, title, desc, badge, gradient, glow, badgeCls }, i) => (
              <motion.div
                key={title}
                initial={reducedMotion ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={reducedMotion ? { duration: 0 } : { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex flex-col bg-[#FFFDF9] rounded-[28px] border border-[#E4D5BF] shadow-[0_16px_35px_-28px_rgba(75,55,29,0.7)] hover:border-[#CFA664] p-6 hover:shadow-[0_22px_42px_-26px_rgba(93,64,27,0.38)] hover:-translate-y-1.5 transition-all duration-400 ${i === 0 ? "lg:col-span-5" : i === 1 ? "lg:col-span-4 lg:-translate-y-3" : "lg:col-span-3"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg ${glow} group-hover:scale-110 transition-transform duration-400`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Badge */}
                <span className={`inline-flex w-fit items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-4 ${badgeCls}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {badge}
                </span>

                <h3 className="text-[16px] font-extrabold text-zinc-900 mb-2.5">{title}</h3>
                <p className="text-[13.5px] leading-relaxed text-zinc-500 flex-1">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick category links */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.5, duration: 0.5 }}
            className="mt-12 bg-[#FFFDF9] rounded-[28px] border border-[#E4D5BF] p-5 md:p-6 shadow-[0_12px_30px_-24px_rgba(75,55,29,0.65)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-[15px] font-black text-zinc-900 mb-0.5">Popüler Kategoriler</p>
                <p className="text-[13px] text-[#62584D]">En çok tercih edilen ürün grupları</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {QUICK_LINKS.map(({ Icon, label, href, count }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-2.5 bg-[#F8F2E8] hover:bg-[#FFF2D9] border border-[#E4D5BF] hover:border-[#CFA664] rounded-2xl px-4 py-2.5 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <span className="w-8 h-8 rounded-xl bg-[#FFFDF9] border border-[#E4D5BF] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#9A621E]" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-bold text-[#302920] group-hover:text-amber-700 transition-colors leading-none">{label}</p>
                      <p className="text-[10px] text-[#75695C] mt-0.5">{count} ürün</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8A7A68] group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all duration-300 ml-1" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
