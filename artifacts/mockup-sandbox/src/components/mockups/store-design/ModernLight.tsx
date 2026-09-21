import { ShoppingCart, Search, Heart, Star, ChevronRight, Truck, Shield, RotateCcw, ArrowRight, Zap } from "lucide-react";

const PRODUCTS = [
  { name: "Staedtler Mars 925", sub: "0.5mm Mekanik Kurşun", price: 189, old: 249, badge: "-24%", stars: 4.9, reviews: 214 },
  { name: "Faber-Castell Pitt", sub: "Sanatçı Keçe Uç Seti", price: 345, old: null, badge: "Yeni", stars: 5.0, reviews: 87 },
  { name: "Rhodia Dot Pad A5", sub: "Noktalı Defter 90g", price: 128, old: 160, badge: "-20%", stars: 4.8, reviews: 156 },
  { name: "Lamy Safari Dolma", sub: "Metalik Mavi / M uç", price: 520, old: null, badge: null, stars: 4.7, reviews: 342 },
];

const CATS = [
  { label: "Kalemler", emoji: "✏️", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Defterler", emoji: "📓", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { label: "Çantalar", emoji: "🎒", color: "bg-stone-50 text-stone-700 border-stone-200" },
  { label: "Boyalar", emoji: "🎨", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "Organizer", emoji: "📁", color: "bg-blue-50 text-blue-700 border-blue-200" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}`} />
      ))}
    </div>
  );
}

export function ModernLight() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-stone-900 font-sans overflow-x-hidden">
      {/* Top bar */}
      <div className="bg-stone-900 text-stone-300 text-xs text-center py-2 tracking-wide">
        🚚 500₺ üzeri ücretsiz kargo · <span className="text-amber-400 font-semibold">Yeni sezon ürünleri geldi!</span>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-stone-900 rounded-xl flex items-center justify-center">
                <span className="text-amber-400 font-black text-sm">G</span>
              </div>
              <div>
                <div className="font-black text-stone-900 text-base tracking-tight leading-none">GÖÇMEN</div>
                <div className="text-stone-400 text-[9px] tracking-[0.18em] uppercase leading-none mt-0.5">Kırtasiye</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-7 text-sm text-stone-600 font-medium">
              {["Kategoriler", "Ürünler", "Markalar", "Kampanyalar"].map(l => (
                <a key={l} href="#" className="hover:text-stone-900 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex-1 max-w-md hidden md:flex items-center bg-stone-100 rounded-xl px-4 py-2.5 gap-2">
            <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <span className="text-stone-400 text-sm">Ürün veya barkod ara...</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500">
              <Heart className="w-5 h-5" />
            </button>
            <button className="relative p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <button className="ml-1 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-bold transition-colors">
              Giriş Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 items-center">
          <div>
            {/* Overline */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-[2px] bg-amber-500 rounded" />
              <span className="text-amber-600 text-xs font-bold tracking-[0.15em] uppercase">1993'ten Beri</span>
            </div>
            <h1 className="text-5xl xl:text-[72px] font-black leading-[1.0] tracking-tight text-stone-900 mb-6">
              Kaliteli<br />
              <span className="text-amber-500">Kırtasiye</span><br />
              <span className="text-stone-400 font-light italic text-4xl xl:text-5xl">kapınızda</span>
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed mb-8 max-w-md">
              Faber-Castell, Lamy, Staedtler, Rhodia ve daha birçok premium marka — Bursa'dan Türkiye'ye hızlı teslimat.
            </p>
            <div className="flex items-center gap-3">
              <button className="group flex items-center gap-2.5 bg-stone-900 hover:bg-amber-500 hover:text-stone-900 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all">
                Keşfet
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="flex items-center gap-2 text-stone-500 hover:text-stone-900 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors underline underline-offset-4 decoration-stone-300">
                Kampanyaları Gör
              </button>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-stone-200">
              {[
                { num: "15K+", label: "Mutlu Müşteri" },
                { num: "3.500+", label: "Ürün Çeşidi" },
                { num: "4.9★", label: "Ortalama Puan" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-stone-900">{num}</div>
                  <div className="text-xs text-stone-400 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial card cluster */}
          <div className="hidden lg:block relative h-[440px]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100" />
            {/* Main product card */}
            <div className="absolute top-6 left-6 right-6 bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-amber-50 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">✏️</div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">En Çok Satan</span>
                  <p className="font-black text-stone-900 text-base mt-0.5">Staedtler Mars 925</p>
                  <p className="text-stone-400 text-sm">0.5mm Mekanik Kurşunkalem</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                    </div>
                    <span className="text-stone-400 text-xs">214 yorum</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-stone-900">₺189</div>
                  <div className="text-xs text-stone-400 line-through">₺249</div>
                  <div className="text-xs font-bold text-green-600 mt-0.5">%24 İndirim</div>
                </div>
              </div>
              <button className="w-full mt-4 bg-stone-900 hover:bg-amber-500 hover:text-stone-900 text-white py-2.5 rounded-xl text-sm font-bold transition-all">
                Sepete Ekle
              </button>
            </div>
            {/* Second card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📓</div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm">Rhodia Dot Pad A5</p>
                <p className="text-stone-400 text-xs">Noktalı · 90g kâğıt</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-stone-900">₺128</div>
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">-20%</span>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute top-[185px] right-2 bg-amber-500 text-white text-xs font-black px-3 py-2 rounded-2xl shadow-lg -rotate-6">
              🔥 Flaş İndirim<br />Bu hafta son!
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-stone-400 mr-1">Kategoriler:</span>
          {CATS.map(c => (
            <button key={c.label} className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:shadow-sm ${c.color}`}>
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-stone-900">Öne Çıkan Ürünler</h2>
            <p className="text-stone-400 text-sm mt-0.5">Editörün seçimi · Bu hafta en çok tercih edilenler</p>
          </div>
          <button className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-semibold">
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTS.map(p => (
            <div key={p.name} className="group bg-white rounded-2xl border border-stone-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all overflow-hidden hover:-translate-y-0.5">
              <div className="aspect-square bg-stone-50 relative flex items-center justify-center">
                <span className="text-5xl">✏️</span>
                {p.badge && (
                  <span className={`absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-xl ${p.badge.startsWith("-") ? "bg-red-500 text-white" : "bg-amber-500 text-stone-900"}`}>
                    {p.badge}
                  </span>
                )}
                <button className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all bg-stone-900/5 flex items-end justify-center pb-4">
                  <span className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl">Hızlı Bak</span>
                </button>
              </div>
              <div className="p-4">
                <p className="font-bold text-stone-900 text-sm leading-tight">{p.name}</p>
                <p className="text-stone-400 text-xs mt-0.5 mb-2">{p.sub}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Stars rating={p.stars} />
                  <span className="text-stone-400 text-[10px] ml-1">({p.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-stone-900 font-black text-base">₺{p.price}</span>
                    {p.old && <span className="text-stone-300 text-xs line-through ml-1.5">₺{p.old}</span>}
                  </div>
                  <button className="p-2 bg-stone-100 hover:bg-amber-500 hover:text-stone-900 text-stone-500 rounded-xl transition-all">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-stone-900 rounded-3xl p-8 flex items-center justify-between gap-6">
          <div>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Newsletter</p>
            <h3 className="text-2xl font-black text-white mb-1">Kampanyaları Kaçırma</h3>
            <p className="text-stone-400 text-sm">Yeni ürünler ve özel indirimler için bültenimize abone ol.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <input placeholder="E-posta adresiniz" className="bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 px-4 py-3 rounded-xl text-sm w-56 focus:outline-none focus:border-amber-500 transition-colors" />
            <button className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
              Abone Ol
            </button>
          </div>
        </div>
      </section>

      {/* Footer trust strip */}
      <div className="border-t border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          {[
            { icon: Truck, text: "Hızlı Kargo", sub: "Aynı gün kargolama" },
            { icon: Shield, text: "Güvenli Ödeme", sub: "SSL korumalı" },
            { icon: RotateCcw, text: "30 Gün İade", sub: "Ücretsiz iade" },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-stone-900">{text}</p>
                <p className="text-xs text-stone-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
