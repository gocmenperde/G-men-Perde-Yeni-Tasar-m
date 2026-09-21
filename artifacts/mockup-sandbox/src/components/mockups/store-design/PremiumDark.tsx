import { ShoppingCart, Search, Heart, Star, ChevronRight, Package, Truck, Shield, RotateCcw, Menu, X, Zap, ArrowRight } from "lucide-react";

const PRODUCTS = [
  { name: "Staedtler Mars 925", sub: "0.5mm Mekanik Kurşun", price: 189, old: 249, badge: "-24%", stars: 4.9, reviews: 214, hot: true },
  { name: "Faber-Castell Pitt", sub: "Sanatçı Keçe Uç Seti", price: 345, old: null, badge: "Yeni", stars: 5.0, reviews: 87, hot: false },
  { name: "Rhodia Dot Pad", sub: "A5 Noktalı Defter 90g", price: 128, old: 160, badge: "-20%", stars: 4.8, reviews: 156, hot: false },
  { name: "Lamy Safari Dolma", sub: "Metalik Mavi / M uç", price: 520, old: null, badge: null, stars: 4.7, reviews: 342, hot: true },
];

const CATS = [
  { label: "Kalemler", count: "2.4K", emoji: "✏️" },
  { label: "Defterler", count: "890", emoji: "📓" },
  { label: "Çantalar", count: "340", emoji: "🎒" },
  { label: "Boya Seti", count: "610", emoji: "🎨" },
  { label: "Origami", count: "120", emoji: "🗂️" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"}`} />
      ))}
    </div>
  );
}

export function PremiumDark() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden">
      {/* Announcement */}
      <div className="bg-amber-500 text-zinc-900 text-xs font-bold text-center py-2 tracking-widest uppercase">
        🚚 500₺ Üzeri Siparişlerde Ücretsiz Kargo · Tüm Türkiye
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-zinc-900 font-black text-sm">G</span>
              </div>
              <div>
                <div className="font-black text-white text-sm tracking-tight leading-none">GÖÇMEN</div>
                <div className="text-amber-500 text-[9px] tracking-[0.2em] uppercase font-semibold leading-none">Kırtasiye</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6 text-sm text-zinc-400">
              {["Kategoriler", "Ürünler", "Markalar", "Kampanyalar"].map(l => (
                <a key={l} href="#" className="hover:text-amber-400 transition-colors font-medium">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex-1 max-w-md hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 gap-2">
            <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span className="text-zinc-600 text-sm">Ürün, marka veya barkod ara...</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2.5 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
              <Heart className="w-5 h-5" />
            </button>
            <button className="relative p-2.5 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <button className="ml-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-xl text-sm font-bold transition-colors">
              Giriş
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[580px] flex items-center overflow-hidden">
        {/* BG glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/8 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"linear-gradient(#f59e0b 1px,transparent 1px),linear-gradient(90deg,#f59e0b 1px,transparent 1px)",backgroundSize:"60px 60px"}} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-semibold mb-6 tracking-wide">
                <Zap className="w-3.5 h-3.5" />
                1993'ten Beri Bursa'nın Güvenilir Kırtasiyesi
              </div>
              <h1 className="text-5xl xl:text-7xl font-black leading-[1.0] tracking-tight mb-6">
                <span className="text-white">Yaşamınıza</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">
                  Renk Katın
                </span>
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-lg">
                Dünyaca ünlü markalar — Faber-Castell, Lamy, Rhodia, Staedtler — en uygun fiyatlarla kapınıza geliyor.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="group flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 px-7 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
                  Alışverişe Başla
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center gap-2 border border-zinc-700 hover:border-amber-500/50 hover:bg-zinc-900 text-zinc-300 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all">
                  Kampanyaları Gör
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-zinc-800">
                {[
                  { icon: Truck, text: "Ücretsiz Kargo" },
                  { icon: Shield, text: "Güvenli Ödeme" },
                  { icon: RotateCcw, text: "30 Gün İade" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-zinc-500">
                    <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Product card float */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-[4/3]">
                {/* Big card */}
                <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                  <div className="bg-zinc-800/50 rounded-2xl aspect-square w-48 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-5xl">✏️</span>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black text-xl mb-1">Faber-Castell 9000</p>
                    <p className="text-zinc-400 text-sm mb-3">Sanatçı Grafik Kalemi Seti</p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <StarRow rating={5} />
                      <span className="text-zinc-500 text-xs ml-1">(234)</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-black text-amber-400">₺284</span>
                      <span className="text-zinc-600 text-sm line-through">₺365</span>
                    </div>
                    <button className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-zinc-900 py-2.5 rounded-xl font-bold text-sm transition-colors">
                      Sepete Ekle
                    </button>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  -%22 İNDİRİM
                </div>
                <div className="absolute -bottom-4 -left-4 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 shadow-xl">
                  <p className="text-xs text-zinc-500 mb-1">Bu Hafta Satılan</p>
                  <p className="text-white font-black text-lg">1.240 Ürün</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/40 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-1">
            {CATS.map(c => (
              <button key={c.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-amber-500/30 transition-all whitespace-nowrap flex-shrink-0">
                <span className="text-base">{c.emoji}</span>
                <span className="text-sm font-semibold text-zinc-200">{c.label}</span>
                <span className="text-xs text-zinc-500">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-6 overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-700/50 to-transparent" />
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 50%,white 1px,transparent 1px)",backgroundSize:"30px 30px"}} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-900" />
                <span className="font-black text-amber-900 text-sm uppercase tracking-wider">Flaş İndirim</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-1">%40'a Varan İndirim</h2>
              <p className="text-amber-100 text-sm">Sadece bu hafta geçerli · Sınırlı stok</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
                <div className="text-3xl font-black text-white">08</div>
                <div className="text-xs text-amber-100 font-semibold">SAAT</div>
              </div>
              <div className="text-2xl text-white font-black">:</div>
              <div className="text-center bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
                <div className="text-3xl font-black text-white">34</div>
                <div className="text-xs text-amber-100 font-semibold">DAK</div>
              </div>
              <div className="text-2xl text-white font-black">:</div>
              <div className="text-center bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
                <div className="text-3xl font-black text-white">12</div>
                <div className="text-xs text-amber-100 font-semibold">SAN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Öne Çıkan Ürünler</h2>
            <p className="text-zinc-500 text-sm mt-0.5">En çok tercih edilen premium kalemler</p>
          </div>
          <button className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCTS.map(p => (
            <div key={p.name} className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1">
              <div className="aspect-square bg-zinc-800/50 relative flex items-center justify-center">
                <span className="text-5xl">✏️</span>
                {p.badge && (
                  <span className={`absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-lg ${p.badge.startsWith("-") ? "bg-red-500 text-white" : "bg-amber-500 text-zinc-900"}`}>
                    {p.badge}
                  </span>
                )}
                {p.hot && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">🔥</span>
                )}
                <button className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="bg-amber-500 text-zinc-900 text-xs font-black px-4 py-2 rounded-xl">Hızlı Görüntüle</span>
                </button>
              </div>
              <div className="p-4">
                <p className="font-bold text-white text-sm leading-tight mb-0.5">{p.name}</p>
                <p className="text-zinc-500 text-xs mb-2">{p.sub}</p>
                <div className="flex items-center gap-1 mb-3">
                  <StarRow rating={p.stars} />
                  <span className="text-zinc-600 text-[10px] ml-1">({p.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-amber-400 font-black text-lg">₺{p.price}</span>
                    {p.old && <span className="text-zinc-600 text-xs line-through ml-1.5">₺{p.old}</span>}
                  </div>
                  <button className="p-2 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900 text-zinc-400 rounded-xl transition-all">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Footer Strip */}
      <div className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">
          {[
            { icon: Truck, title: "Hızlı Kargo", sub: "Aynı gün kargolama" },
            { icon: Shield, title: "Güvenli Alışveriş", sub: "256-bit SSL şifreleme" },
            { icon: RotateCcw, title: "Kolay İade", sub: "30 gün içinde ücretsiz" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-zinc-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
