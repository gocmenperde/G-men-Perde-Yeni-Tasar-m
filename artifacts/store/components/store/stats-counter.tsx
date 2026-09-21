"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Trophy, Users, Package, Building2 } from "lucide-react";

const STATS = [
  {
    icon: Trophy,
    value: 30,
    suffix: "+",
    label: "Yıllık Deneyim",
    sub: "1993'ten bu yana",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/30",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200/60",
  },
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Mutlu Müşteri",
    sub: "Türkiye geneli",
    gradient: "from-rose-400 to-pink-500",
    glow: "shadow-rose-500/30",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-200/60",
  },
  {
    icon: Package,
    value: 500,
    suffix: "+",
    label: "Ürün Çeşidi",
    sub: "Güncel katalog",
    gradient: "from-violet-400 to-indigo-500",
    glow: "shadow-violet-500/30",
    bg: "from-violet-50 to-indigo-50",
    border: "border-violet-200/60",
  },
  {
    icon: Building2,
    value: 50,
    suffix: "+",
    label: "Güvenilir Marka",
    sub: "Orijinal ürünler",
    gradient: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/30",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-200/60",
  },
];

function useCountUp(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration, started]);

  return count;
}

function StatCard({ stat, delay }: { stat: typeof STATS[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useCountUp(stat.value, 2000, inView);
  const { icon: Icon, suffix, label, sub, gradient, glow, bg, border } = stat;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col items-center text-center p-7 bg-gradient-to-br ${bg} rounded-[28px] border ${border} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}
      style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      {/* Icon */}
      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-xl ${glow} group-hover:scale-110 transition-transform duration-400`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Number */}
      <div className="flex items-end justify-center gap-1 mb-2">
        <span className="text-[48px] font-black text-zinc-900 leading-none tabular-nums">
          {count.toLocaleString("tr-TR")}
        </span>
        <span className="text-3xl font-black text-zinc-900 mb-1">{suffix}</span>
      </div>

      {/* Label */}
      <p className="text-[15px] font-extrabold text-zinc-800 mb-1">{label}</p>
      <p className="text-[12px] text-zinc-400 font-medium">{sub}</p>

      {/* Decorative */}
      <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br ${gradient} opacity-8 blur-xl pointer-events-none`} />
    </motion.div>
  );
}

export default function StatsCounter() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span className="section-label justify-center block mb-4">Rakamlarla Biz</span>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
            30 Yıllık Güvenin Kanıtı
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
