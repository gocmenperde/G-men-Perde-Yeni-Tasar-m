import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Göçmen Perde",
  description: "Göçmen Perde gizlilik politikası — kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.",
  alternates: { canonical: "https://www.gocmenperde.com.tr/privacy" },
};

const sections = [
  {
    title: "1. Toplanan Bilgiler",
    content: `Sitemizi ziyaret ettiğinizde veya alışveriş yaptığınızda şu bilgileri toplayabiliriz:\n\n• Kimlik bilgileri (ad, soyad)\n• İletişim bilgileri (e-posta, telefon numarası)\n• Teslimat adresi\n• Ödeme bilgileri (kart bilgileri tarafımızca saklanmaz; PayTR güvenli ödeme altyapısı kullanılır)\n• Tarayıcı ve cihaz bilgileri (çerezler aracılığıyla)\n• Satın alma geçmişi`,
  },
  {
    title: "2. Bilgilerin Kullanımı",
    content: `Toplanan bilgiler aşağıdaki amaçlarla kullanılır:\n\n• Siparişlerinizin işlenmesi ve teslimatı\n• Müşteri hizmetleri sunumu\n• Hesap yönetimi\n• E-posta bildirimleri (sipariş durumu, kampanyalar — abonelikten çıkabilirsiniz)\n• Site güvenliği ve dolandırıcılığın önlenmesi\n• Yasal yükümlülüklerin yerine getirilmesi`,
  },
  {
    title: "3. Çerezler",
    content: `Sitemiz oturum yönetimi, sepet işlemleri ve analitik amaçlı çerezler kullanır. Tarayıcınızın ayarları aracılığıyla çerezleri reddedebilirsiniz; ancak bu durumda bazı site özellikleri düzgün çalışmayabilir.\n\n• Zorunlu çerezler: Oturum ve güvenlik\n• Analitik çerezler: Anonim site kullanımı istatistikleri\n• Pazarlama çerezleri: Tercihlerinize göre kişiselleştirilmiş içerik`,
  },
  {
    title: "4. Üçüncü Taraf Paylaşımı",
    content: `Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:\n\n• Siparişin teslimatı için kargo firmaları\n• Güvenli ödeme işlemleri için PayTR\n• Yasal zorunluluk halinde resmi makamlar\n\nVerileriniz hiçbir şekilde reklam amacıyla üçüncü taraflara satılmaz veya kiralanmaz.`,
  },
  {
    title: "5. Veri Güvenliği",
    content: `Verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:\n\n• SSL/TLS şifreleme (HTTPS)\n• Güvenli sunucu altyapısı\n• Düzenli güvenlik denetimleri\n• Ödeme bilgileri PCI-DSS uyumlu PayTR altyapısında işlenir`,
  },
  {
    title: "6. Haklarınız",
    content: `KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:\n\n• Verilerinizin işlenip işlenmediğini öğrenme\n• İşlenme amacını ve kullanım şeklini öğrenme\n• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme\n• Eksik veya yanlış işlenmiş verilerin düzeltilmesini talep etme\n• Verilerin silinmesini veya yok edilmesini talep etme\n• İşlemenin otomatik sistemle gerçekleştirilmesi halinde ortaya çıkan aleyhte sonuca itiraz etme`,
  },
  {
    title: "7. İletişim",
    content: `Gizlilik politikamız hakkında sorularınız için:\n\nE-posta: muhammedemint76@gmail.com\nTelefon: 0546 285 18 26\nAdres: Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A Osmangazi/Bursa\n\nTalebinizi almamızın ardından en geç 30 gün içinde yanıt vereceğiz.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-700 font-medium">Gizlilik Politikası</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900">Gizlilik Politikası</h1>
              <p className="text-zinc-400 text-sm">Son güncelleme: Ocak 2025</p>
            </div>
          </div>
          <p className="text-zinc-600 leading-relaxed">
            Göçmen Perde olarak kişisel verilerinizin gizliliğini ciddiye alıyoruz. Bu politika, sitemizi kullandığınızda hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve haklarınızı açıklamaktadır.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
              <h2 className="text-lg font-black text-zinc-900 mb-3">{section.title}</h2>
              <div className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
          <p className="text-amber-800 text-sm">
            Bu politika hakkında sorularınız için{" "}
            <Link href="/contact" className="font-bold underline underline-offset-2">iletişim sayfamızı</Link>{" "}
            ziyaret edebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
