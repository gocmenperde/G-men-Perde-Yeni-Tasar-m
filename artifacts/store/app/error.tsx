"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ArrowRight } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Root Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        {/* Branded icon */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200/60 shadow-xl shadow-amber-100/50 flex items-center justify-center">
            <AlertTriangle className="w-11 h-11 text-amber-500" strokeWidth={1.75} />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
            <span className="text-white text-[10px] font-black leading-none">!</span>
          </div>
        </div>

        {/* Brand badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#E8E0D5] text-zinc-500 text-[11px] font-bold uppercase tracking-[0.16em] px-3.5 py-1.5 rounded-full mb-5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Göçmen Perde
        </div>

        <h1 className="text-2xl font-black text-zinc-900 mb-3 leading-tight">
          Beklenmedik Bir Hata Oluştu
        </h1>
        <p className="text-zinc-500 mb-8 leading-relaxed text-[15px]">
          Üzgünüz, bir şeyler ters gitti. Sayfayı yenileyerek tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
        </p>

        {/* Error digest for support */}
        {error.digest && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 mb-6 text-center">
            <span className="text-[11px] text-zinc-400 font-mono">
              Hata kodu: <span className="text-zinc-600 font-bold">{error.digest}</span>
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <motion.button
            onClick={reset}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-amber-500 hover:text-zinc-900 transition-all duration-200 shadow-lg shadow-zinc-900/15"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </motion.button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#E8E0D5] text-zinc-700 font-bold px-6 py-3.5 rounded-2xl hover:border-amber-300 hover:bg-amber-50 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Quick help links */}
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-4">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Sorun devam ederse
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Ürünlere Göz At", "/products"],
              ["Bize Ulaşın", "/contact"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-amber-600 transition-colors p-2 rounded-xl hover:bg-amber-50 font-medium"
              >
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
