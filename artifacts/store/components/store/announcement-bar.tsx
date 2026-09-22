"use client";

import { useState, useEffect } from "react";
import { X, Truck, ShieldCheck, Star, Tag, BookOpen, Sparkles, Gift, Zap } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Truck, ShieldCheck, Star, Tag, BookOpen, Sparkles, Gift, Zap,
};

const DEFAULT_MESSAGES = [
  { icon: "Truck",        text: "Tüm Siparişlerde Hızlı Teslimat!" },
  { icon: "ShieldCheck",  text: "Güvenli Ödeme · 256-bit SSL Koruması" },
  { icon: "Star",         text: "1.000+ Mutlu Müşteri · 4.9 Ortalama Puan" },
  { icon: "Tag",          text: "İlk Siparişe %10 İndirim · Kod: GOCMEN10" },
  { icon: "Sparkles",     text: "Yeni perde koleksiyonu · Özel ölçü seçenekleri" },
];

interface BarProps {
  messages?: { icon: string; text: string }[] | null;
  color?: string | null;
  active?: boolean;
}

const COLOR_MAP: Record<string, { bar: string; dot: string }> = {
  amber:  { bar: "from-amber-600 via-amber-500 to-orange-500", dot: "bg-amber-300" },
  red:    { bar: "from-red-700 via-red-600 to-rose-500",       dot: "bg-red-300" },
  green:  { bar: "from-emerald-700 via-emerald-600 to-teal-500", dot: "bg-emerald-300" },
  blue:   { bar: "from-blue-700 via-blue-600 to-indigo-500",   dot: "bg-blue-300" },
  zinc:   { bar: "from-zinc-800 via-zinc-700 to-zinc-600",     dot: "bg-zinc-400" },
  rose:   { bar: "from-rose-700 via-rose-600 to-pink-500",     dot: "bg-rose-300" },
};

export default function AnnouncementBar({ messages, color, active }: BarProps) {
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (closed || active === false) return null;

  const configuredMessages = messages?.length ? messages : DEFAULT_MESSAGES;
  const blockedWords = ["i" + "ade", "cayma", "değişim"];
  const filteredMessages = configuredMessages.filter(({ text }) => !blockedWords.some((word) => text.toLocaleLowerCase("tr-TR").includes(word)));
  const msgs = filteredMessages.length ? filteredMessages : DEFAULT_MESSAGES;
  const theme = COLOR_MAP[color ?? "amber"] ?? COLOR_MAP.amber;
  const repeated = [...msgs, ...msgs, ...msgs];

  return (
    <div className={`book-announcement-bar relative overflow-hidden h-9 flex items-center select-none bg-gradient-to-r ${theme.bar}`}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" style={{ backgroundSize: "200% 100%" }} />

      {/* Mobile: first message static */}
      <div className="md:hidden flex-1 pr-10 pl-4 flex items-center gap-2">
        {(() => {
          const IconComp = ICON_MAP[msgs[0].icon] ?? Truck;
          return (
            <>
              <IconComp className="w-3.5 h-3.5 text-white/90 flex-shrink-0" />
              <p className="truncate text-white text-[11.5px] font-semibold tracking-wide">{msgs[0].text}</p>
            </>
          );
        })()}
      </div>

      {/* Desktop: marquee */}
      <div className="hidden md:flex marquee-track" aria-hidden>
        {repeated.map(({ icon, text }, i) => {
          const IconComp = ICON_MAP[icon] ?? Truck;
          return (
            <span key={i} className="flex items-center gap-2 px-8 whitespace-nowrap text-white text-[11.5px] font-semibold tracking-wide">
              <IconComp className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
              {text}
              <span className="mx-4 opacity-30 text-base" aria-hidden="true">•</span>
            </span>
          );
        })}
      </div>

      <button
        onClick={() => setClosed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/35 transition-all flex items-center justify-center z-10 hover:rotate-90 duration-300"
        aria-label="Kapat"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}
