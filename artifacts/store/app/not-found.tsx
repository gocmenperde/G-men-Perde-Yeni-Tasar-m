import Link from "next/link";
import { Home, Search, ShoppingBag, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] px-4">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-8">
          <h1 className="text-[10rem] font-black leading-none text-[#E8E0D5] select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#E8E0D5] shadow-lg flex items-center justify-center">
              <Search className="w-9 h-9 text-[#D4AF5A]" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-zinc-900 mb-3">
          Sayfa Bulunamadı
        </h2>
        <p className="text-zinc-500 mb-8 leading-relaxed">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. Aşağıdaki bağlantıları kullanarak devam edebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-[#B8973E] transition-colors shadow-lg"
          >
            <Home className="w-4 h-4" /> Ana Sayfa
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#E8E0D5] text-zinc-700 font-bold px-6 py-3.5 rounded-2xl hover:border-[#D4AF5A] hover:bg-[#FAF7F2] transition-all"
          >
            <ShoppingBag className="w-4 h-4" /> Ürünlere Bak
          </Link>
        </div>

        {/* Quick links */}
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-5">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Hızlı Linkler</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Tül Perdeler", "/kategori/tul-perde"],
              ["Fon Perdeler", "/kategori/fonperdeler"],
              ["Stor Perdeler", "/kategori/stor-perde"],
              ["Zebra Perdeler", "/kategori/zebra-perde"],
              ["İletişim", "/contact"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-[#B8973E] transition-colors p-2 rounded-xl hover:bg-[#FAF7F2]"
              >
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
