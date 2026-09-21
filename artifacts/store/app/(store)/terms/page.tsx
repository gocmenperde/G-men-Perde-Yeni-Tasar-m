import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Göçmen Kırtasiye",
  description: "Göçmen Kırtasiye kullanım koşulları ve satış sözleşmesi.",
  alternates: { canonical: "https://www.gocmenkirtasiye.com.tr/terms" },
};

const sections = [
  {
    title: "1. Genel Hükümler",
    content: `Göçmen Kırtasiye web sitesini ve hizmetlerini kullanarak aşağıdaki kullanım koşullarını kabul etmiş olursunuz. Bu koşullar, sitemizle olan ilişkinizi düzenler.\n\nSitemizi kullanmaya devam etmek, bu koşulları kabul ettiğiniz anlamına gelir. Koşulları kabul etmiyorsanız lütfen sitemizi kullanmayın.`,
  },
  {
    title: "2. Hesap Oluşturma",
    content: `• Hesap oluştururken doğru ve güncel bilgi vermeniz gerekmektedir.\n• Hesap güvenliğinizden siz sorumlusunuz; şifrenizi kimseyle paylaşmayın.\n• Hesabınızdaki şüpheli işlemleri derhal bize bildirin.\n• Her kişi yalnızca bir hesap açabilir.\n• 18 yaş altı kullanıcıların ebeveyn onayı alması gerekmektedir.`,
  },
  {
    title: "3. Sipariş ve Satın Alma",
    content: `• Sepete eklenen ürünler, ödeme tamamlanana kadar rezerve edilmez.\n• Sipariş onayı e-posta ile gönderilir; bu, satış sözleşmesinin kurulduğunu gösterir.\n• Stok tükendiğinde siparişiniz iptal edilebilir; ücret alınmışsa iade edilir.\n• Fiyatlar KDV dahildir ve önceden haber vermeksizin değişebilir.\n• Açıkça hatalı fiyat içeren siparişleri iptal etme hakkımız saklıdır.`,
  },
  {
    title: "4. Ödeme",
    content: `Kredi kartı, banka kartı ve havale/EFT ile ödeme kabul edilmektedir. Ödemeler PayTR güvenli ödeme altyapısı üzerinden işlenir.\n\n• Kart bilgileriniz sistemlerimizde saklanmaz.\n• Ödeme başarısız olursa sipariş tamamlanmaz.\n• Taksit seçenekleri bankanıza göre değişir.`,
  },
  {
    title: "5. Teslimat",
    content: `• Teslimat süresi 1–5 iş günüdür (stok ve bölgeye göre değişir).\n• 500₺ ve üzeri siparişlerde kargo ücretsizdir.\n• Teslimat adresi bilgileri müşteri sorumluluğundadır; hatalı adres nedeniyle oluşan gecikmeler tarafımıza yüklenemez.\n• Ürün kargoya verildikten sonra takip numarası e-posta ile bildirilir.`,
  },
  {
    title: "6. İade ve Değişim",
    content: `Ayrıntılı bilgi için İade Politikası sayfamızı inceleyiniz.\n\n• Teslimattan itibaren 14 gün içinde iade talep edebilirsiniz.\n• Ürün kullanılmamış, ambalajı açılmamış veya hasarsız olmalıdır.\n• İade kargo ücreti alıcıya aittir (hatalı ürün gönderimi hariç).\n• Onaylanan iadeler 5–10 iş günü içinde kartınıza yansır.`,
  },
  {
    title: "7. Fikri Mülkiyet",
    content: `Sitemizdeki tüm içerik (görseller, metinler, logolar, tasarımlar) Göçmen Kırtasiye'ye ait olup telif hakkıyla korunmaktadır. İzinsiz kopyalanamaz, dağıtılamaz veya değiştirilemez.`,
  },
  {
    title: "8. Sorumluluk Sınırı",
    content: `Göçmen Kırtasiye, internet bağlantısı sorunları, teknik arızalar veya üçüncü tarafların eylemleri nedeniyle oluşan kayıplardan sorumlu tutulamaz. Yasal sınırlar dahilinde, sorumluluğumuz satın aldığınız ürünlerin tutarıyla sınırlıdır.`,
  },
  {
    title: "9. Değişiklikler",
    content: `Bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkımız saklıdır. Güncel koşullar her zaman bu sayfada yayımlanır. Değişiklik sonrası siteyi kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.`,
  },
];

export default function TermsPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-[#B8973E] transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-700 font-medium">Kullanım Koşulları</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900">Kullanım Koşulları</h1>
              <p className="text-zinc-400 text-sm">Son güncelleme: Ocak 2025</p>
            </div>
          </div>
          <p className="text-zinc-600 leading-relaxed">
            Bu kullanım koşulları, Göçmen Kırtasiye web sitesini ve hizmetlerini kullanımınızı düzenleyen yasal sözleşmeyi oluşturur. Lütfen dikkatlice okuyun.
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

        <div className="mt-8 p-5 bg-zinc-50 border border-zinc-200 rounded-2xl text-center">
          <p className="text-zinc-600 text-sm">
            Sorularınız için{" "}
            <Link href="/contact" className="text-[#B8973E] font-bold underline underline-offset-2">bizimle iletişime geçin</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
