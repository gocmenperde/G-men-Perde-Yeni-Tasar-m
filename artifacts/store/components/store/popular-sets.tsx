"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

const DEFAULT_SETS = [
  {
    title: "Okul Başlangıç Seti",
    subtitle: "İlkokul & Ortaokul",
    description: "Defter, kalem, silgi, cetvel ve daha fazlası. Yeni okul yılına hazır başla!",
    items: ["Spiralli Defter A4 (5 adet)", "Kurşun Kalem Seti 12'li", "Renkli Kalem Seti 24'lü", "Silgi + Kalemtıraş", "30cm Cetvel"],
    price: "₺299",
    originalPrice: "₺420",
    discount: "%29",
    href: "/kategori/okul-gerecleri",
    gradient: "from-blue-600 to-indigo-700",
    badgeColor: "bg-blue-500",
    accentColor: "text-blue-300",
    tag: "En Çok Satan",
  },
  {
    title: "Sanat & Çizim Seti",
    subtitle: "Amatör & Profesyonel",
    description: "Suluboya, pastel, fineliner ve eskiz defteri. Yaratıcılığınızı keşfedin!",
    items: ["Suluboya Seti 24 Renk", "Pastel Boya 12'li", "Fineliner 10'lu Set", "Eskiz Defteri A3", "Suluboya Fırçası Seti"],
    price: "₺549",
    originalPrice: "₺780",
    discount: "%30",
    href: "/kategori/akrilik-boya",
    gradient: "from-rose-600 to-pink-700",
    badgeColor: "bg-rose-500",
    accentColor: "text-rose-300",
    tag: "Editörün Seçimi",
  },
  {
    title: "Ofis Düzenleme Seti",
    subtitle: "Ev & İş Ofisi",
    description: "Ajanda, tükenmez, dosyalama gereçleri. Verimliliğinizi artırın!",
    items: ["2025 Haftalık Ajanda", "Tükenmez Kalem Seti 5'li", "Yapışkanlı Not Kağıdı", "Zımba + Zımba Teli", "Klasör 4'lü Set"],
    price: "₺399",
    originalPrice: "₺560",
    discount: "%29",
    href: "/kategori/kirtasiye",
    gradient: "from-amber-600 to-orange-700",
    badgeColor: "bg-amber-500",
    accentColor: "text-amber-300",
    tag: "Yeni Sezon",
  },
];

export default function PopularSets({ setsJson }: { setsJson?: string | null }) {
  let sets = DEFAULT_SETS;
  if (setsJson) {
    try {
      const parsed = JSON.parse(setsJson);
      if (Array.isArray(parsed) && parsed.length) sets = parsed;
    } catch {}
  }
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-2">Özel Paketler</p>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-3">
            Popüler Setlerimiz
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Birlikte daha avantajlı! Özenle seçilmiş ürün setlerimizle hem tasarruf edin hem de ihtiyacınız olan her şeye sahip olun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sets.map((set, i) => (
            <motion.div
              key={set.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <div className="h-full rounded-3xl overflow-hidden border border-[#E8E0D5] hover:border-[#D4AF5A] shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <div className={`bg-gradient-to-br ${set.gradient} p-7 relative overflow-hidden`}>
                   <Package className="absolute -top-8 -right-8 w-32 h-32 opacity-20" aria-hidden="true" />
                  <div className={`inline-block text-xs font-bold ${set.badgeColor} text-white px-3 py-1 rounded-full mb-3`}>
                    {set.tag}
                  </div>
                   <Package className="w-8 h-8 text-white/90 mb-3" aria-hidden="true" />
                  <h3 className="text-white font-black text-xl leading-tight">{set.title}</h3>
                  <p className={`${set.accentColor} text-sm mt-1`}>{set.subtitle}</p>
                </div>

                <div className="p-6">
                  <p className="text-zinc-600 text-sm leading-relaxed mb-5">
                    {set.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {set.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <p className="text-2xl font-black text-zinc-900">{set.price}</p>
                      <p className="text-zinc-400 line-through text-sm">{set.originalPrice}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1.5 rounded-xl">
                      {set.discount} indirim
                    </span>
                  </div>

                  <Link
                    href={set.href}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold py-3.5 rounded-2xl transition-colors duration-300 group/btn"
                  >
                    Seti İncele
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
