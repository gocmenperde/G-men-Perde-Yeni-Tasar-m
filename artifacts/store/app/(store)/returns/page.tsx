import type { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  Phone,
  CheckCircle,
  XCircle,
  Scale,
  FileText,
  AlertCircle,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "İade, Değişim & Cayma Hakkı Politikası | Göçmen Kırtasiye",
  description:
    "Göçmen Kırtasiye iade, değişim ve cayma hakkı politikası — Mesafeli Sözleşmeler Yönetmeliği kapsamındaki başvuru ve süreç bilgileri.",
  alternates: { canonical: "https://www.gocmenkirtasiye.com.tr/returns" },
};

const steps = [
  {
    icon: Phone,
    step: "1",
    title: "Bizimle İletişime Geçin",
    desc: "WhatsApp veya e-posta ile iade/cayma talebinizi bildirin. Size iade kodu verilecektir.",
  },
  {
    icon: Package,
    step: "2",
    title: "Ürünü Paketleyin",
    desc: "Ürünü orijinal ambalajında, tüm aksesuarlarıyla birlikte güvenli şekilde paketleyin.",
  },
  {
    icon: Truck,
    step: "3",
    title: "Kargoya Verin",
    desc: "Anlaşmalı kargo firmasıyla ürünü gönderin. Takip numarasını bize iletin.",
  },
  {
    icon: CreditCard,
    step: "4",
    title: "Para İadenizi Alın",
    desc: "Ürün kontrolü sonrası 14 gün içinde ödemeniz kartınıza iade edilir.",
  },
];

const accepted = [
  "Kullanılmamış ve orijinal ambalajında ürünler",
  "Teslimattan itibaren 14 gün içinde iade talepleri",
  "Hasarlı veya hatalı gönderilen ürünler (kargo ücretsiz)",
  "Yanlış ürün gönderimi durumunda değişim",
  "Fatura ile birlikte iade edilen ürünler",
];

const notAccepted = [
  "Kullanılmış, yırtık veya tahrip edilmiş ürünler",
  "Ambalajı açılmış, mühürü kırılmış ürünler",
  "14 gün sonrası yapılan iade talepleri",
  "Özel sipariş veya kişiselleştirilmiş ürünler",
  "Hijyen ürünleri (açılmış)",
];

// Cayma hakkı kapsamı dışındaki ürünler (Mesafeli Sözleşmeler Yönetmeliği Madde 15)
const caymaHakkiDisinda = [
  "Fiyatı borsa veya teşkilatlanmış diğer piyasalarda belirlenen mallara ilişkin sözleşmeler",
  "Tüketicinin istekleri veya açıkça onun kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler",
  "Çabuk bozulabilen veya son kullanma tarihi geçebilecek mallara ilişkin sözleşmeler",
  "Teslimattan sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan ve iadesi sağlık veya hijyen açısından uygun olmayan mallara ilişkin sözleşmeler",
  "Teslimden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan mallara ilişkin sözleşmeler",
];

export default function ReturnsPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#B8973E] transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-700 font-medium">İade & Cayma Hakkı</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">
            İade, Değişim & Cayma Hakkı
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed">
            İade, değişim ve yasal cayma sürecine dair başvuru adımlarını ve
            gerekli koşulları aşağıda bulabilirsiniz. Güncel mevzuat
            kapsamındaki haklarınız saklıdır.
          </p>
        </div>

        {/* ── Yasal Cayma Hakkı ── */}
        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900">
                Yasal Cayma Hakkı
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                6502 sayılı Tüketicinin Korunması Hakkında Kanun &amp; Mesafeli
                Sözleşmeler Yönetmeliği
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: Clock,
                color: "text-blue-600",
                bg: "bg-blue-50",
                title: "14 Günlük Süre",
                desc: "Ürünü teslim aldığınız tarihten itibaren herhangi bir gerekçe göstermeksizin 14 gün içinde cayma hakkınızı kullanabilirsiniz.",
              },
              {
                icon: AlertCircle,
                color: "text-amber-600",
                bg: "bg-amber-50",
                title: "Gerekçe Gösterme Zorunluluğu Yok",
                desc: "Cayma hakkını kullanmak için herhangi bir neden bildirmenize gerek yoktur. Cezai şart veya tazminat talep edilmez.",
              },
              {
                icon: CreditCard,
                color: "text-green-600",
                bg: "bg-green-50",
                title: "14 Gün İçinde İade",
                desc: "Cayma bildirimini aldıktan sonra en geç 14 gün içinde tüm ödemeleriniz (varsa teslimat ücreti dahil) iade edilir.",
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="bg-[#FAF7F2] border border-[#E8E0D5] rounded-2xl p-4"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <p className="font-bold text-zinc-900 text-sm mb-1">{title}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Cayma bildirimi */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="font-black text-zinc-900 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Cayma Bildirimini Nasıl Yaparsınız?
            </h3>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Cayma hakkınızı kullanmak için aşağıdaki yöntemlerden biriyle
              bize ulaşmanız yeterlidir:
            </p>
            <ul className="space-y-1.5 text-sm text-zinc-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <strong>WhatsApp:</strong>&nbsp;0546 285 18 26
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <strong>E-posta:</strong>&nbsp;muhammedemint76@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <strong>İletişim Formu:</strong>&nbsp;
                <Link
                  href="/contact"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  gocmenkirtasiye.com.tr/contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Cayma hakkı dışında kalanlar */}
          <div className="mt-5 bg-red-50 border border-red-100 rounded-2xl p-5">
            <h3 className="font-black text-zinc-900 text-sm mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Cayma Hakkı Kullanılamayan Durumlar
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Mesafeli Sözleşmeler Yönetmeliği Madde 15 uyarınca aşağıdaki
              durumlarda cayma hakkı kullanılamaz:
            </p>
            <ul className="space-y-1.5">
              {caymaHakkiDisinda.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs text-zinc-600"
                >
                  <XCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* İade Süreci */}
        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 mb-6">
          <h2 className="text-xl font-black text-zinc-900 mb-6 text-center">
            İade Süreci
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 relative">
                  <Icon className="w-5 h-5 text-amber-600" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-900 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-black text-zinc-900 text-sm mb-1">
                  {title}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted / Not accepted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-black text-zinc-900">İade Kabul Edilir</h3>
            </div>
            <ul className="space-y-2.5">
              {accepted.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-zinc-600"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="font-black text-zinc-900">İade Kabul Edilmez</h3>
            </div>
            <ul className="space-y-2.5">
              {notAccepted.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-zinc-600"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Important notes */}
        <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 mb-6 space-y-3">
          <h3 className="font-black text-zinc-900">Önemli Notlar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                 icon: Package,
                title: "Orijinal Ambalaj",
                desc: "Ürünü orijinal kutusu ve ambalajıyla gönderin.",
              },
              {
                 icon: FileText,
                title: "Fatura Zorunlu",
                desc: "İade işlemi için fatura veya sipariş numarası gereklidir.",
              },
              {
                 icon: CreditCard,
                title: "Para İadesi",
                desc: "Onay sonrası 14 gün içinde kartınıza iade edilir.",
              },
             ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl p-4 text-center"
              >
                 <Icon className="w-6 h-6 text-[var(--gold)] mx-auto mb-2" aria-hidden="true" />
                <p className="font-bold text-zinc-900 text-sm">{title}</p>
                <p className="text-zinc-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <h3 className="font-black text-zinc-900 mb-2">
            İade veya Cayma Talebinde Bulunmak İster misiniz?
          </h3>
          <p className="text-zinc-500 text-sm mb-4">
            WhatsApp veya e-posta ile bizimle iletişime geçin, hızlıca yardımcı
            olalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/905462851826"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#1ebe5d] transition-colors shadow-md"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.506 5.823L0 24l6.335-1.483A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-4.988-1.364l-.358-.213-3.713.868.886-3.613-.235-.372A9.794 9.794 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
              </svg>
              WhatsApp ile İletişim
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#E8E0D5] text-zinc-700 font-bold px-6 py-3 rounded-2xl hover:border-[#D4AF5A] transition-colors"
            >
              İletişim Formu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
