"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "gocmen-cookie-consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setTimeout(() => setShow(true), 2000);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[9000] md:left-auto md:right-6 md:max-w-sm"
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Çerez Bildirimi</p>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  Deneyiminizi geliştirmek için çerezler kullanıyoruz.{" "}
                  <Link href="/privacy" className="text-[#D4AF5A] underline underline-offset-2">
                    Gizlilik Politikası
                  </Link>
                </p>
              </div>
              <button onClick={decline} className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold text-sm py-2 rounded-xl transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Kabul Et
              </button>
              <button
                onClick={decline}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm py-2 rounded-xl transition-colors"
              >
                Reddet
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
