"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Store Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-2 text-center">
        Sayfa yüklenemedi
      </h1>
      <p className="text-zinc-500 text-center max-w-sm mb-8">
        Geçici bir sorun oluştu. Birkaç saniye sonra tekrar deneyin.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
