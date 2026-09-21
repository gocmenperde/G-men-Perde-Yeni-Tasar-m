"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    category: "Sipariş & Ödeme",
    items: [
      {
        q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        a: "Kredi kartı, banka kartı (Visa, Mastercard, Troy) ve havale/EFT ile ödeme yapabilirsiniz. Tüm kart ödemeleri PayTR güvenli altyapısı üzerinden işlenir.",
      },
      {
        q: "Siparişim ne zaman onaylanır?",
        a: "Ödeme tamamlandıktan hemen sonra siparişiniz sisteme alınır ve e-posta ile onay gönderilir. Havale/EFT ödemelerinde para hesabımıza geçtikten sonra onay yapılır.",
      },
      {
        q: "Siparişimi iptal edebilir miyim?",
        a: "Sipariş kargoya verilmeden önce iptal işlemi yapılabilir. Bunun için lütfen WhatsApp veya e-posta ile iletişime geçin. Kargoya verildikten sonra iade prosedürü uygulanır.",
      },
      {
        q: "Taksit imkânı var mı?",
        a: "Evet, Türk bankaların desteklediği kart türlerine göre 3'e kadar taksit seçeneği sunulmaktadır. Taksit seçenekleri ödeme sayfasında görüntülenir.",
      },
    ],
  },
  {
    category: "Kargo & Teslimat",
    items: [
      {
        q: "Kargo ücreti ne kadar?",
        a: "500₺ ve üzeri siparişlerde kargo tamamen ücretsizdir. 500₺ altı siparişlerde 49,90₺ kargo ücreti uygulanır.",
      },
      {
        q: "Siparişim kaç günde gelir?",
        a: "Stokta bulunan ürünler siparişi takiben 1–3 iş günü içinde kargoya verilir. Kargo süresi bölgenize göre 1–3 iş günü arasında değişir. Toplam teslimat süresi genellikle 2–5 iş günüdür.",
      },
      {
        q: "Kargomun durumunu nasıl takip ederim?",
        a: "Siparişiniz kargoya verildikten sonra takip numaranız e-posta ile gönderilir. Ayrıca 'Siparişlerim' sayfasından da sipariş durumunuzu anlık takip edebilirsiniz.",
      },
      {
        q: "Yurtiçi kargo firmalarıyla mı çalışıyorsunuz?",
        a: "Evet, Türkiye genelinde anlaşmalı kargo firmalarıyla gönderim yapıyoruz. Şu an yurt dışı gönderim yapmamaktayız.",
      },
    ],
  },
  {
    category: "İade & Değişim",
    items: [
      {
        q: "İade süresi ne kadar?",
        a: "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz. Ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir.",
      },
      {
        q: "İade kargo ücreti kime ait?",
        a: "Normal iade durumlarında kargo ücreti müşteriye aittir. Ancak hatalı ürün gönderimi veya üründe kusur varsa kargo ücreti tarafımızca karşılanır.",
      },
      {
        q: "Paramı ne zaman geri alırım?",
        a: "İade ürünü teslim alıp kontrolden geçirdikten sonra 5–10 iş günü içinde ödemeniz iade edilir. Banka işlem süresi hesaba eklenmelidir.",
      },
    ],
  },
  {
    category: "Hesap & Güvenlik",
    items: [
      {
        q: "Hesap oluşturmak zorunlu mu?",
        a: "Hayır, misafir olarak da alışveriş yapabilirsiniz. Ancak hesap oluşturarak sipariş takibi, kayıtlı adresler ve özel tekliflerden yararlanabilirsiniz.",
      },
      {
        q: "Şifremi unuttum, ne yapmalıyım?",
        a: "Giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayarak e-posta adresinize sıfırlama bağlantısı gönderebilirsiniz.",
      },
      {
        q: "Kart bilgilerim güvende mi?",
        a: "Evet, kart bilgileriniz tarafımızda hiçbir şekilde saklanmamaktadır. Tüm ödeme işlemleri PCI-DSS uyumlu PayTR güvenli altyapısında gerçekleştirilir.",
      },
    ],
  },
  {
    category: "Ürünler",
    items: [
      {
        q: "Ürünler orijinal mi?",
        a: "Evet, tüm ürünler yetkili distribütörlerden temin edilmekte olup yüzde yüz orijinaldir. Faber-Castell, Pelikan, Staedtler gibi dünya markalarının Türkiye distribütörleriyle çalışıyoruz.",
      },
      {
        q: "Stokta olmayan ürünü nasıl takip ederim?",
        a: "Ürün sayfasındaki 'Stok Bildirimi Al' butonuna tıklayarak e-posta adresinizi kaydettirin. Ürün tekrar stoğa girdiğinde sizi bilgilendiririz.",
      },
      {
        q: "Toplu sipariş verebilir miyim?",
        a: "Evet, okul, kurum veya toplu alımlar için özel fiyatlandırma yapıyoruz. Lütfen WhatsApp veya e-posta ile iletişime geçin.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#F0EAE0] last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="font-semibold text-zinc-900 text-sm leading-snug group-hover:text-[#B8973E] transition-colors">{q}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-zinc-500 text-sm leading-relaxed pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-700 font-medium">Sık Sorulan Sorular</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-3 h-3" />
            Yardım Merkezi
          </div>
          <h1 className="text-4xl font-black text-zinc-900 mb-3">Sık Sorulan Sorular</h1>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Aradığınız yanıtı bulamazsanız{" "}
            <Link href="/contact" className="text-[#B8973E] font-semibold underline underline-offset-2">
              iletişime geçin
            </Link>
            , yardımcı olmaktan memnuniyet duyarız.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Category tabs */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-2 space-y-1 sticky top-24">
              {FAQS.map(({ category }) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeCategory === category
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-[#FAF7F2] hover:text-zinc-900"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ items */}
          <div className="md:col-span-3">
            {FAQS.filter((f) => f.category === activeCategory).map(({ category, items }) => (
              <div key={category} className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
                <h2 className="font-black text-zinc-900 mb-4">{category}</h2>
                {items.map(({ q, a }) => (
                  <FAQItem key={q} q={q} a={a} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 text-center">
          <h3 className="text-white font-black text-xl mb-2">Yanıt Bulamadınız mı?</h3>
          <p className="text-zinc-400 mb-5 text-sm">Ekibimiz size yardımcı olmaya hazır.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/905462851826"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#1ebe5d] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold px-6 py-3 rounded-2xl hover:border-zinc-500 transition-colors"
            >
              İletişim Formu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
