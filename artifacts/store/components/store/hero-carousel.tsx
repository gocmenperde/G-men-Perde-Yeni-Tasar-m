"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
  cta2Text?: string | null;
  cta2Href?: string | null;
  imageUrl?: string | null;
  gradient: string;
  darkText: boolean;
}

const GRADIENTS: Record<string, string> = {
  amber:   "from-amber-600 via-amber-500 to-orange-400",
  rose:    "from-rose-700 via-rose-600 to-pink-500",
  blue:    "from-blue-800 via-blue-700 to-indigo-600",
  emerald: "from-emerald-800 via-emerald-700 to-teal-600",
  zinc:    "from-zinc-900 via-zinc-800 to-zinc-700",
  purple:  "from-purple-800 via-purple-700 to-violet-600",
  cream:   "from-amber-50 via-orange-50 to-yellow-50",
  slate:   "from-slate-900 via-slate-800 to-slate-700",
};

const BG_PATTERNS: Record<string, string> = {
  amber:   "bg-amber-500/10",
  rose:    "bg-rose-500/10",
  blue:    "bg-blue-500/10",
  emerald: "bg-emerald-500/10",
  zinc:    "bg-white/5",
  purple:  "bg-purple-500/10",
  cream:   "bg-amber-400/10",
  slate:   "bg-white/5",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const textVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1 + 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroCarousel({ slides }: { slides: BannerSlide[] }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = slides[idx];
  const isLight = active?.darkText;

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setIdx(next);
  }, []);

  const prev = useCallback(() => {
    go((idx - 1 + slides.length) % slides.length, -1);
  }, [idx, slides.length, go]);

  const next = useCallback(() => {
    go((idx + 1) % slides.length, 1);
  }, [idx, slides.length, go]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timerRef.current = setTimeout(next, 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, paused, next, slides.length]);

  if (!slides.length) return null;

  const gradClass = GRADIENTS[active.gradient] ?? GRADIENTS.amber;
  const patternClass = BG_PATTERNS[active.gradient] ?? BG_PATTERNS.amber;
  const textColor = isLight ? "text-zinc-900" : "text-white";
  const mutedColor = isLight ? "text-zinc-700" : "text-white/80";
  const badgeClass = isLight
    ? "bg-zinc-900/10 text-zinc-800 border border-zinc-900/20"
    : "bg-white/15 text-white border border-white/25 backdrop-blur-sm";

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{ height: "clamp(420px, 58vw, 640px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.div
          key={active.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          className={`absolute inset-0 bg-gradient-to-br ${gradClass}`}
        >
          {/* Decorative circles */}
          <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full ${patternClass} blur-3xl`} />
          <div className={`absolute -bottom-16 -left-16 w-72 h-72 rounded-full ${patternClass} blur-3xl`} />
          <div className={`absolute top-1/3 right-1/4 w-40 h-40 rounded-full ${patternClass} blur-2xl`} />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          />

          <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center">
            <div className={`grid ${active.imageUrl ? "lg:grid-cols-2" : "grid-cols-1"} gap-10 w-full items-center`}>

              {/* Left: Text */}
              <div className="space-y-5 max-w-xl">
                {active.badge && (
                  <motion.div custom={0} variants={textVariants} initial="hidden" animate="visible">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${badgeClass}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
                      {active.badge}
                    </span>
                  </motion.div>
                )}

                <motion.h1
                  custom={1} variants={textVariants} initial="hidden" animate="visible"
                  className={`font-black leading-[1.05] tracking-tight ${textColor}`}
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  {active.title}
                </motion.h1>

                {active.subtitle && (
                  <motion.p
                    custom={2} variants={textVariants} initial="hidden" animate="visible"
                    className={`text-lg sm:text-xl font-medium leading-relaxed ${mutedColor}`}
                  >
                    {active.subtitle}
                  </motion.p>
                )}

                <motion.div
                  custom={3} variants={textVariants} initial="hidden" animate="visible"
                  className="flex flex-wrap gap-3 pt-2"
                >
                  {active.ctaText && active.ctaHref && (
                    <Link
                      href={active.ctaHref}
                      className={`group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg ${
                        isLight
                          ? "bg-zinc-900 text-white shadow-zinc-900/25 hover:bg-zinc-800"
                          : "bg-white text-zinc-900 shadow-white/20 hover:bg-white/95"
                      }`}
                    >
                      {active.ctaText}
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  )}
                  {active.cta2Text && active.cta2Href && (
                    <Link
                      href={active.cta2Href}
                      className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 border-2 ${
                        isLight
                          ? "border-zinc-900/30 text-zinc-800 hover:bg-zinc-900/5"
                          : "border-white/40 text-white hover:bg-white/10"
                      }`}
                    >
                      {active.cta2Text}
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Right: Image */}
              {active.imageUrl && (
                <motion.div
                  custom={4} variants={textVariants} initial="hidden" animate="visible"
                  className="hidden lg:flex justify-center items-center"
                >
                  <div className="relative w-full max-w-sm aspect-square">
                    <div className={`absolute inset-0 rounded-3xl ${patternClass} blur-xl`} />
                    <Image
                      src={active.imageUrl}
                      alt={active.title}
                      fill
                      className="object-contain drop-shadow-2xl relative z-10"
                      sizes="(max-width: 1024px) 0px, 400px"
                      priority
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide counter */}
      {slides.length > 1 && (
        <div className={`absolute top-5 right-16 text-xs font-bold tabular-nums ${isLight ? "text-zinc-700" : "text-white/60"}`}>
          {idx + 1} / {slides.length}
        </div>
      )}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/35 transition-all duration-200 flex items-center justify-center text-white hover:scale-110 active:scale-90"
            aria-label="Önceki"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/35 transition-all duration-200 flex items-center justify-center text-white hover:scale-110 active:scale-90"
            aria-label="Sonraki"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > idx ? 1 : -1)}
              aria-label={`Slayt ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === idx
                  ? "w-7 h-2.5 bg-white shadow-md"
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && !paused && (
        <motion.div
          key={`progress-${idx}`}
          className="absolute bottom-0 left-0 h-0.5 bg-white/50"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
        />
      )}
    </section>
  );
}
