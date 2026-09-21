"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const QUICK_MESSAGES = [
  { label: "Sipariş Vermek İstiyorum", msg: "Merhaba, sipariş vermek istiyorum. Yardımcı olabilir misiniz?" },
  { label: "Ürün Bilgisi", msg: "Merhaba, bir ürün hakkında bilgi almak istiyorum." },
  { label: "Kargo Takip", msg: "Merhaba, sipariş takibi hakkında bilgi almak istiyorum." },
];

export default function WhatsAppFAB({ whatsapp, siteName = "Göçmen Perde" }: { whatsapp?: string | null; siteName?: string | null }) {
  const [open, setOpen] = useState(false);
  const number = (whatsapp ?? "905462851826").replace(/\D/g, "");

  const send = (msg: string) => {
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, "_blank");
    setOpen(false);
  };

  return (
    <div className="mobile-whatsapp-offset fixed right-4 z-[80] flex flex-col items-end gap-3 md:bottom-8 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="bg-white rounded-2xl shadow-2xl border border-zinc-100 w-64 overflow-hidden"
          >
            <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">WhatsApp</p>
                   <p className="text-white/80 text-xs mt-0.5">{siteName}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-1.5">
              <p className="text-xs text-zinc-400 px-1 pb-1">Nasıl yardımcı olabiliriz?</p>
              {QUICK_MESSAGES.map(({ label, msg }) => (
                <button
                  key={label}
                  onClick={() => send(msg)}
                  className="w-full text-left text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-[#25D366]/10 hover:text-[#25D366] border border-zinc-100 hover:border-[#25D366]/30 rounded-xl px-3 py-2.5 transition-all"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => send("Merhaba, size bir sorum var.")}
                className="w-full text-left text-sm font-medium text-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-3 py-2.5 transition-all mt-1"
              >
                <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Serbest Mesaj Yaz</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition-colors hover:bg-[#1ebe5d] md:h-14 md:w-14"
          aria-label="WhatsApp ile iletişim"
          data-testid="button-whatsapp"
        >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
               <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      </div>
    </div>
  );
}
