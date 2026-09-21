import { ShoppingCart, Search, Heart, Star, ChevronRight, Truck, Shield, RotateCcw, ArrowRight, Zap, TrendingUp } from "lucide-react";

const PRODUCTS = [
  { name: "Staedtler Mars 925", sub: "0.5mm Mekanik Kurşun", price: 189, old: 249, badge: "-24%", stars: 4.9, reviews: 214 },
  { name: "Faber-Castell Pitt", sub: "Sanatçı Keçe Uç Seti 12li", price: 345, old: null, badge: "YENİ", stars: 5.0, reviews: 87 },
  { name: "Rhodia Dot Pad A5", sub: "Noktalı Defter 90g", price: 128, old: 160, badge: "-20%", stars: 4.8, reviews: 156 },
  { name: "Lamy Safari Dolma", sub: "Metalik Mavi / M uç", price: 520, old: null, badge: null, stars: 4.7, reviews: 342 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"}`} />
      ))}
    </div>
  );
}

export function BoldAmber() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{background:"#0a0a0a"}}>
      {/* Top strip */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-zinc-900 text-xs font-black text-center py-2.5 tracking-widest uppercase">
        ⚡ Flaş İndirim — %40'a varan fırsatlar · Bugün son gün!
      </div>

      {/* Nav — fully amber-accented */}
      <nav className="sticky top-0 z-50 border-b border-amber-500/20" style={{background:"rgba(10,10,10,0.98)", backdropFilter:"blur(20px)"}}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo — bold geometric */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-amber-500 rounded-lg rotate-[10deg] absolute inset-0 opacity-30" />
                <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center relative">
                  <span className="font-black text-zinc-900 text-lg leading-none">G</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-lg tracking-tighter leading-none">GÖÇMEN</span>
                <span className="text-amber-400 text-[9px] font-extrabold tracking-[0.25em] uppercase leading-none">KIRTASIYE</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              {["Kategoriler", "Ürünler", "Markalar", "İndirimler"].map(l => (
                <a key={l} href="#" className="text-sm text-zinc-500 hover:text-amber-400 font-semibold transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex-1 max-w-xs hidden lg:block mx-6">
            <div className="flex items-center bg-zinc-900 border border-amber-500/20 hover:border-amber-500/40 rounded-xl px-4 py-2.5 gap-2 transition-colors">
              <Search className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-zinc-600 text-sm">Ara...</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2.5 text-zinc-500 hover:text-amber-400 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="relative p-2.5 text-zinc-500 hover:text-amber-400 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full text-[8px] text-zinc-900 font-black flex items-center justify-center">3</span>
            </button>
            <button className="ml-2 px-4 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-900 rounded-xl text-sm font-bold transition-all">
              Giriş
            </button>
          </div>
        </div>
      </nav>

      {/* HERO — full-bleed amber gradient */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Amber gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700" />
        {/* Dark overlay vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")"}} />
        {/* Large G watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[28rem] font-black text-white/5 select-none leading-none pr-16">G</div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
              <span className="text-amber-200 text-sm font-bold tracking-widest uppercase">1993'ten Beri</span>
            </div>
            <h1 className="text-6xl xl:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-6">
              PRE<span className="text-zinc-900">MIUM</span><br />
              <span className="text-zinc-900">KIRTA</span>SİYE
            </h1>
            <p className="text-amber-100/80 text-xl leading-relaxed mb-8 max-w-xl">
              Türkiye'nin en kapsamlı kırtasiye koleksiyonu. Faber-Castell'den Staedtler'a, Lamy'den Rhodia'ya kadar.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="group flex items-center gap-3 bg-white hover:bg-amber-50 text-zinc-900 px-8 py-4 rounded-2xl font-black text-base transition-all hover:scale-105 shadow-2xl">
                HEMEN KEŞFET
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-2 border-2 border-white/30 hover:border-white text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all">
                <Zap className="w-4 h-4" />
                Flaş İndirimler
              </button>
            </div>
            {/* Animated counter row */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/20">
              {[
                { num: "15K+", label: "Müşteri" },
                { num: "3.5K", label: "Ürün" },
                { num: "%100", label: "Orijinal" },
                { num: "4.9★", label: "Puan" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{num}</div>
                  <div className="text-xs text-amber-200/70 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flash sale ticker */}
      <div className="bg-zinc-900 border-y border-zinc-800 overflow-hidden py-2">
        <div className="flex items-center gap-8" style={{animation:"marquee 20s linear infinite", whiteSpace:"nowrap"}}>
          {Array(3).fill(null).map((_, gi) => (
            <div key={gi} className="flex items-center gap-8 flex-shrink-0">
              {["Faber-Castell • %30 İndirim", "Rhodia • Yeni Sezon", "Lamy Safari • Sınırlı Stok", "Staedtler • Bestseller", "Moleskine • %25 Fırsatı"].map(t => (
                <span key={t} className="text-zinc-400 text-sm font-semibold flex items-center gap-2 px-4">
                  <span className="w-1 h-1 bg-amber-500 rounded-full" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}`}</style>
      </div>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-amber-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">ÖNE ÇIKANLAR</h2>
              <p className="text-zinc-500 text-sm">En çok tercih edilen ürünler</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((p, i) => (
            <div key={p.name} className="group relative bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10">
              {/* Top color strip */}
              <div className={`h-1 w-full ${i === 0 ? "bg-gradient-to-r from-amber-500 to-orange-500" : i === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-400" : "bg-zinc-800"}`} />
              <div className="aspect-square bg-zinc-800/50 flex items-center justify-center relative">
                <span className="text-5xl">✏️</span>
                {p.badge && (
                  <span className={`absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-lg ${p.badge.startsWith("-") ? "bg-red-500 text-white" : "bg-amber-500 text-zinc-900"}`}>
                    {p.badge}
                  </span>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/60 flex items-center justify-center">
                  <button className="bg-amber-500 text-zinc-900 text-xs font-black px-4 py-2 rounded-xl">
                    Sepete Ekle
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-white text-sm leading-tight mb-0.5">{p.name}</p>
                <p className="text-zinc-500 text-xs mb-2">{p.sub}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Stars rating={p.stars} />
                  <span className="text-zinc-600 text-[10px] ml-1">({p.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-amber-400 font-black text-xl">₺{p.price}</span>
                    {p.old && <span className="text-zinc-700 text-xs line-through ml-1.5">₺{p.old}</span>}
                  </div>
                  {p.old && (
                    <span className="text-xs font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded-lg">
                      ₺{p.old - p.price} KAR!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bold CTA Section */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600" />
          <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:"repeating-linear-gradient(45deg,white 0px,white 2px,transparent 2px,transparent 16px)"}} />
          <div className="relative z-10 p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-amber-900" />
                <span className="font-black text-amber-900 text-sm uppercase tracking-wider">Bu Hafta Sınırlı</span>
              </div>
              <h3 className="text-4xl font-black text-white mb-1">%40'a Varan<br />Flaş İndirim</h3>
              <p className="text-amber-100 text-sm">Saatler geçmeden fırsatı kaçırma!</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                {["08", "34", "52"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center">
                      <div className="text-3xl font-black text-white">{t}</div>
                      <div className="text-[10px] text-amber-100 uppercase tracking-wider font-bold">{["saat","dak","san"][i]}</div>
                    </div>
                    {i < 2 && <span className="text-white font-black text-xl">:</span>}
                  </div>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 px-8 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105">
                <Zap className="w-4 h-4" />
                HEMEN AL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 gap-4">
          {[
            { icon: Truck, text: "Ücretsiz Kargo", sub: "500₺ üzeri" },
            { icon: Shield, text: "Güvenli Ödeme", sub: "SSL korumalı" },
            { icon: RotateCcw, text: "30 Gün İade", sub: "Ücretsiz iade" },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{text}</p>
                <p className="text-xs text-zinc-600">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
