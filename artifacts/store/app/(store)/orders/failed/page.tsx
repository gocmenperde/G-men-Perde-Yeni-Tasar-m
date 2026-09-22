import Link from "next/link";
import { XCircle, RefreshCcw, ShoppingCart, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ödeme Başarısız | Göçmen Perde" };

export default function OrderFailedPage() {
  return (
    <div className="min-h-[80vh] bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E0D5] p-10 text-center shadow-xl shadow-amber-100/30">
        <div className="w-24 h-24 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 mb-3">
          Ödeme Başarısız
        </h1>
        <p className="text-zinc-500 mb-8 leading-relaxed text-sm">
          Ödeme işlemi tamamlanamadı. Kart bilgilerinizi kontrol ederek tekrar deneyebilir veya farklı bir kart kullanabilirsiniz.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black rounded-2xl transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Tekrar Dene
          </Link>
          <Link
            href="/cart"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#D4AF5A] text-zinc-700 font-semibold rounded-2xl transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Sepete Dön
          </Link>
          <a
            href="https://wa.me/905462851826"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 text-green-600 font-semibold text-sm hover:text-green-700 transition-colors"
          >
            <Phone className="w-4 h-4" /> Yardım için WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
