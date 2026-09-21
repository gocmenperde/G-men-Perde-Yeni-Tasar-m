import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular | Göçmen Kırtasiye",
  description:
    "Göçmen Kırtasiye hakkında sık sorulan sorular — sipariş, ödeme, kargo, iade ve ürün bilgileri.",
  alternates: { canonical: "https://www.gocmenkirtasiye.com.tr/faq" },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kredi kartı, banka kartı (Visa, Mastercard, Troy) ve havale/EFT ile ödeme yapabilirsiniz. Tüm kart ödemeleri PayTR güvenli altyapısı üzerinden işlenir.",
      },
    },
    {
      "@type": "Question",
      name: "Siparişim ne zaman onaylanır?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ödeme tamamlandıktan hemen sonra siparişiniz sisteme alınır ve e-posta ile onay gönderilir. Havale/EFT ödemelerinde para hesabımıza geçtikten sonra onay yapılır.",
      },
    },
    {
      "@type": "Question",
      name: "Siparişimi iptal edebilir miyim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sipariş kargoya verilmeden önce iptal işlemi yapılabilir. Bunun için lütfen WhatsApp veya e-posta ile iletişime geçin. Kargoya verildikten sonra iade prosedürü uygulanır.",
      },
    },
    {
      "@type": "Question",
      name: "Taksit imkânı var mı?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet, Türk bankaların desteklediği kart türlerine göre 3'e kadar taksit seçeneği sunulmaktadır. Taksit seçenekleri ödeme sayfasında görüntülenir.",
      },
    },
    {
      "@type": "Question",
      name: "Kargo ücreti ne kadar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "500₺ ve üzeri siparişlerde kargo tamamen ücretsizdir. 500₺ altı siparişlerde 49,90₺ kargo ücreti uygulanır.",
      },
    },
    {
      "@type": "Question",
      name: "Siparişim kaç günde gelir?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stokta bulunan ürünler siparişi takiben 1–3 iş günü içinde kargoya verilir. Kargo süresi bölgenize göre 1–3 iş günü arasında değişir. Toplam teslimat süresi genellikle 2–5 iş günüdür.",
      },
    },
    {
      "@type": "Question",
      name: "İade süresi ne kadar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz. Ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir.",
      },
    },
    {
      "@type": "Question",
      name: "İade kargo ücreti kime ait?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Normal iade durumlarında kargo ücreti müşteriye aittir. Ancak hatalı ürün gönderimi veya üründe kusur varsa kargo ücreti tarafımızca karşılanır.",
      },
    },
    {
      "@type": "Question",
      name: "Paramı ne zaman geri alırım?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "İade ürünü teslim alıp kontrolden geçirdikten sonra 5–10 iş günü içinde ödemeniz iade edilir. Banka işlem süresi hesaba eklenmelidir.",
      },
    },
    {
      "@type": "Question",
      name: "Hesap oluşturmak zorunlu mu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hayır, misafir olarak da alışveriş yapabilirsiniz. Ancak hesap oluşturarak sipariş takibi, kayıtlı adresler ve özel tekliflerden yararlanabilirsiniz.",
      },
    },
    {
      "@type": "Question",
      name: "Kart bilgilerim güvende mi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet, kart bilgileriniz tarafımızda hiçbir şekilde saklanmamaktadır. Tüm ödeme işlemleri PCI-DSS uyumlu PayTR güvenli altyapısında gerçekleştirilir.",
      },
    },
    {
      "@type": "Question",
      name: "Ürünler orijinal mi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet, tüm ürünler yetkili distribütörlerden temin edilmekte olup yüzde yüz orijinaldir. Faber-Castell, Pelikan, Staedtler gibi dünya markalarının Türkiye distribütörleriyle çalışıyoruz.",
      },
    },
    {
      "@type": "Question",
      name: "Toplu sipariş verebilir miyim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet, okul, kurum veya toplu alımlar için özel fiyatlandırma yapıyoruz. Lütfen WhatsApp veya e-posta ile iletişime geçin.",
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      {children}
    </>
  );
}
