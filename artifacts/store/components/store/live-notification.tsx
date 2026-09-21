"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const NOTIFICATIONS = [
  { city: "İstanbul", name: "Özlem Y.", product: "Faber-Castell 12'li Kuru Boya", ago: 2 },
  { city: "Ankara", name: "Mehmet K.", product: "Staedtler Fineliner Set", ago: 5 },
  { city: "İzmir", name: "Fatma S.", product: "Pelikan Günlük Ajanda", ago: 8 },
  { city: "Bursa", name: "Ali R.", product: "Pentel EnerGel Kalem 5'li", ago: 3 },
  { city: "Antalya", name: "Zeynep A.", product: "Koh-i-Noor Sulu Boya", ago: 12 },
  { city: "Konya", name: "Hasan T.", product: "Staedtler Spiralli Defter", ago: 6 },
  { city: "Adana", name: "Merve C.", product: "Faber-Castell Kurşun Kalem", ago: 4 },
  { city: "Gaziantep", name: "Burak D.", product: "Pelikan Dolma Kalem", ago: 9 },
  { city: "Trabzon", name: "Elif N.", product: "Pastel Boya Seti 36 Renk", ago: 7 },
  { city: "Kayseri", name: "Selim O.", product: "Renkli Karton 50'li", ago: 11 },
];

export default function LiveNotification() {
  const [current, setCurrent] = useState<(typeof NOTIFICATIONS)[0] | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    let idx = 0;

    const show = () => {
      idx = (idx + 1) % NOTIFICATIONS.length;
      setCurrent(NOTIFICATIONS[idx]);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const timer = setTimeout(show, 3000);
    const interval = setInterval(show, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          key={current.name + current.product}
          initial={{ opacity: 0, y: 40, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-[150px] left-4 z-50 bg-white border border-zinc-100 rounded-2xl shadow-xl px-4 py-3 pr-10 flex items-center gap-3 max-w-[280px] md:bottom-24"
        >
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              setDismissed(true);
            }}
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
            aria-label="Bildirimi kapat"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-700 flex-shrink-0">
            {current.name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">{current.city}&apos;dan <span className="font-semibold text-zinc-800">{current.name}</span></p>
            <p className="text-xs font-semibold text-zinc-900 truncate">{current.product} sipariş verdi</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{current.ago} dakika önce · <span className="text-green-500">✓ Doğrulandı</span></p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
