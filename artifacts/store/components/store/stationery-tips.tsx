"use client";

import { motion } from "framer-motion";
import { PenLine, BookOpen, Palette, Ruler } from "lucide-react";

const TIPS = [
  {
    icon: PenLine,
    category: "Kalem Bakımı",
    title: "Kurşun Kalem Ucu Kırmadan Açmanın Püf Noktası",
    excerpt: "Kalemtıraşı kullanmadan önce kalemi hafifçe ıslatmak, ucu daha pürüzsüz ve dayanıklı yapar. Elektrikli kalemtıraş kullanıyorsanız kalemin tam dik tutulması şart.",
    readTime: "2 dk okuma",
    bg: "bg-amber-50",
    border: "border-amber-100",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  {
    icon: BookOpen,
    category: "Defter Seçimi",
    title: "Doğru Defter Kağıt Gramajı Nasıl Seçilir?",
    excerpt: "Dolma kalem kullanıyorsanız en az 90g/m² kağıt tercih edin. Mürekkep sızmasını önler. Kurşun kalem için 70-80g/m² idealdir.",
    readTime: "3 dk okuma",
    bg: "bg-blue-50",
    border: "border-blue-100",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  {
    icon: Palette,
    category: "Sanat İpuçları",
    title: "Suluboya ile Gradient Efekti Yaratmanın 3 Tekniği",
    excerpt: "Islak-ıslak (wet-on-wet) tekniği en pürüzsüz geçişleri verir. Kağıdı önce su ile ıslatın, ardından boyanızı uygulayın. Kağıt ne kadar kalın olursa işlem o kadar kolay.",
    readTime: "4 dk okuma",
    bg: "bg-rose-50",
    border: "border-rose-100",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
  },
  {
    icon: Ruler,
    category: "Çizim Teknikleri",
    title: "Fineliner Kalemle Profesyonel Çizgiler Nasıl Çizilir?",
    excerpt: "Fineliner kalemi yüzeye 45-60 derece açıyla tutun. Çizgiyi tek hamlede çizmeye çalışın. Mürekkep kuruyana kadar ellerinizi kağıda değdirmeyin.",
    readTime: "3 dk okuma",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
];

export default function StationeryTips() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="section-label mb-3 justify-center block">Bilgi Köşesi</span>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-3">
            Kırtasiye İpuçları
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto text-[15px]">
            Ürünlerinizden maksimum verim alın. Uzmanlarımızdan pratik bilgiler ve kullanım tüyoları.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {TIPS.map((tip, i) => {
             const Icon = tip.icon;
             return (
            <motion.article
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className={`${tip.bg} border ${tip.border} rounded-3xl p-7 transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-start gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-white/70 border border-black/5 flex items-center justify-center flex-shrink-0 mt-1">
                   <Icon className="w-6 h-6 text-[var(--gold)]" aria-hidden="true" />
                 </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[11px] font-semibold ${tip.badgeBg} ${tip.badgeText} px-2.5 py-1 rounded-lg`}>
                      {tip.category}
                    </span>
                    <span className="text-zinc-400 text-xs">{tip.readTime}</span>
                  </div>
                  <h3 className="font-black text-zinc-900 text-[17px] leading-tight mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    {tip.excerpt}
                  </p>
                </div>
              </div>
            </motion.article>
           );})}
        </div>

        {/* Tip of the day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-5 bg-amber-50 border border-amber-100 rounded-3xl p-7 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="text-5xl flex-shrink-0 select-none">💡</div>
          <div className="text-center md:text-left">
            <p className="text-amber-600 font-bold text-[11px] uppercase tracking-widest mb-1">Günün Tüyosu</p>
            <p className="text-zinc-900 font-black text-lg leading-tight mb-1">
              Kalemlerinizi Dik Tutun!
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">
              Tükenmez ve jel kalemleri yatay veya baş aşağı tutmak mürekkebin akmasını engeller, kalemi erken bitirir. Her zaman dik ya da hafif açılı tutun ve kapağını kapatmayı unutmayın.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
