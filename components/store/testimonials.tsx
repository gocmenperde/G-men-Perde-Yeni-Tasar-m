"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const REVIEWS = [
  { name: "Ahmet Y.", text: "Defterin sayfaları kalın ve kaliteli, okul listemizi tek seferde tamamladık.", rating: 5, product: "Spiralli Okul Defteri 120 Yaprak" },
  { name: "Zeynep K.", text: "Pastel boyaların renkleri canlı, çocuğum resim dersinde çok keyifle kullanıyor.", rating: 5, product: "Pastel Boya 24 Renk Jumbo Set" },
  { name: "Mehmet D.", text: "Kalem kutusu görseldeki gibi sağlam geldi, bölmeleri gerçekten kullanışlı.", rating: 5, product: "Metal Kalem Kutusu Organizer" },
  { name: "Selin A.", text: "Fotokopi kağıdı paketi ezilmeden teslim edildi, ofiste sorunsuz kullanıyoruz.", rating: 4, product: "A4 Fotokopi Kağıdı 500 Yaprak" },
  { name: "Can Ö.", text: "Çanta ve matara seti kaliteli, askıları rahat. Kızım çok beğendi.", rating: 5, product: "İlkokul Okul Çantası ve Matara Seti" },
  { name: "Ayşe T.", text: "Deneme sınavı paketi güncel ve açıklayıcı, hızlı kargo için ayrıca teşekkürler.", rating: 5, product: "8. Sınıf Deneme Sınavı Paketi" },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-widest">Yorumlar</span>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white mt-2">Müşterilerimiz Ne Diyor?</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <Quote className="w-8 h-8 text-amber-100 dark:text-zinc-700 absolute top-5 right-5" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
                ))}
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed mb-5">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {review.name[0]}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white text-sm">{review.name}</p>
                  <p className="text-zinc-400 text-xs">{review.product}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
