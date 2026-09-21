"use client";

import { useState } from "react";
import { Share2, MessageCircle, Twitter, Link2, Check } from "lucide-react";

export default function ShareButtons({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${slug}`
      : `https://www.gocmenkirtasiye.com.tr/products/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const encoded = () => encodeURIComponent(getUrl());
  const encodedName = encodeURIComponent(name);

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" />
        Paylaş:
      </span>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${name} `)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          window.open(`https://wa.me/?text=${encodeURIComponent(`${name} ${getUrl()}`)}`, "_blank");
        }}
        className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all text-xs font-semibold"
        aria-label="WhatsApp'ta paylaş"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedName}&url=${encoded()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all text-xs font-semibold"
        aria-label="Twitter'da paylaş"
      >
        <Twitter className="w-3.5 h-3.5" />
        Twitter
      </a>

      <button
        onClick={handleCopy}
        className={`touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
          copied
            ? "bg-emerald-500 border-emerald-400 text-white"
            : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:border-zinc-300"
        }`}
        aria-label="Bağlantıyı kopyala"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? "Kopyalandı!" : "Linki Kopyala"}
      </button>
    </div>
  );
}
