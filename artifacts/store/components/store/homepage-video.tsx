"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export default function HomepageVideo({
  videoUrl,
  videoSource,
}: {
  videoUrl?: string | null;
  videoSource: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [playing, setPlaying] = useState(false);

  const ytId = videoUrl && videoSource === "youtube" ? extractYouTubeId(videoUrl) : null;

  return (
    <section id="homepage-video" ref={ref} aria-label="Göçmen Kırtasiye marka filmi" className="relative overflow-hidden bg-[var(--navy)] py-14 md:py-24">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E5B96F]/10 blur-[120px]" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#E5B96F]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#E5B96F]/25 to-transparent" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5B96F]/25 bg-[#E5B96F]/10 px-4 py-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E5B96F]">
              Bizi Tanıyın
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl font-black leading-tight text-white sm:text-3xl md:text-5xl"
          >
            Göçmen Kırtasiye&apos;yi{" "}
            <span className="bg-gradient-to-r from-[#E5B96F] to-[#F0C986] bg-clip-text text-transparent">
              Yakından Tanıyın
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-3 max-w-xl text-base text-[#B9C5C2] md:mt-4 md:text-lg"
          >
            1993'ten bu yana Bursa'da kırtasiye tutkunlarının adresi.
          </motion.p>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="relative group"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-amber-500/40 via-orange-500/20 to-amber-500/40 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Border frame */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-amber-500/30 via-zinc-700/50 to-amber-500/20" />

          {/* Video wrapper */}
             <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#152A30] shadow-2xl shadow-black/60">
            {ytId ? (
              <div className="relative aspect-video w-full">
                {!playing ? (
                  /* Custom thumbnail / play overlay */
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 w-full h-full flex items-center justify-center group/btn"
                    aria-label="Videoyu oynat"
                  >
                    {/* Fallback içerik, thumbnail yüklenene kadar siyah boşluk oluşmasını önler. */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/80 flex items-center justify-center">
                      <div className="text-center px-6">
                        <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.2em] mb-2">Göçmen Kırtasiye</p>
                        <p className="text-white/80 text-sm">1993&apos;ten beri kırtasiye tutkunlarının adresi</p>
                      </div>
                    </div>
                    <Image
                      src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                      alt="Video önizleme"
                      fill
                      sizes="(max-width: 768px) 100vw, 900px"
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.onerror = null;
                        el.style.display = "none";
                      }}
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover/btn:bg-black/30 transition-colors duration-300" />

                    {/* Play button */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <div className="absolute w-24 h-24 rounded-full bg-amber-500/30 animate-ping" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/40 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                    </motion.div>

                    {/* Bottom badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500 shrink-0">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77 0 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 100 12.67 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
                      </svg>
                      <span className="text-white text-xs font-semibold">YouTube</span>
                    </div>
                  </button>
                ) : (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                    title="Göçmen Kırtasiye Tanıtım Videosu"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                )}
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="w-full aspect-video bg-black"
                preload="metadata"
              />
            ) : (
              <div className="relative aspect-video overflow-hidden bg-[#1B3137]">
                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(229,185,111,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(229,185,111,.12)_1px,transparent_1px)] [background-size:44px_44px]" />
                <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#E5B96F]/25" />
                <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full border border-[#E5B96F]/20" />
                <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-[#E5B96F]/40 bg-[#E5B96F]/15 text-[#E5B96F] shadow-[0_0_50px_rgba(229,185,111,.16)]">
                    <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-[#E5B96F]">Göçmen Kırtasiye · Marka Filmi</p>
                  <p className="mt-3 max-w-md font-display text-2xl font-bold leading-tight text-white sm:text-3xl">İyi fikirlerin başladığı yeri keşfedin.</p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#B9C5C2]">Mağazamızın seçimini, hikâyesini ve kırtasiye tutkusunu yakında burada izleyin.</p>
                  <Link href="/about" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E5B96F]/40 px-4 py-2 text-xs font-bold text-[#F4E6CB] transition-colors hover:border-[#E5B96F] hover:bg-[#E5B96F]/10">
                    Hikâyemizi okuyun
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-7 md:mt-10 grid grid-cols-3 gap-4 max-w-xl mx-auto"
        >
          {[
            { value: "1993", label: "Kuruluş Yılı" },
            { value: "30+", label: "Yıllık Deneyim" },
            { value: "5.000+", label: "Ürün Çeşidi" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl md:text-2xl font-black text-amber-400">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
