import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL, SITE_NAME } from '@/lib/seo-keywords';

export const metadata: Metadata = {
  title: "Göçmen Kırtasiye | Kırtasiye, Kitap, Kalem ve Okul Malzemeleri",
  description:
    "Göçmen Kırtasiye: kalem, defter, boya, sanat malzemeleri ve okul/ofis malzemelerinde uygun fiyat, hızlı kargo ve güvenli alışveriş. Bursa'da 1993'ten bu yana hizmetinizdeyiz.",
  keywords: generateKeywords(),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    title: 'Göçmen Kırtasiye | Kırtasiye, Kitap, Kalem ve Okul Malzemeleri',
    description:
      "Kırtasiye, kitap, kalem, defter, boya ve daha fazlası Göçmen Kırtasiye'de. Hızlı teslimat ve güvenli ödeme ile online alışveriş.",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Göçmen Kırtasiye — Kalem, Defter, Boya ve Sanat Malzemeleri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Göçmen Kırtasiye | Kırtasiye, Kitap, Kalem ve Okul Malzemeleri',
    description:
      "Kırtasiye, kitap, kalem ve okul malzemeleri için Göçmen Kırtasiye'yi keşfedin.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Ana Sayfa',
      item: SITE_URL,
    },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Göçmen Kırtasiye ne zaman kuruldu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Göçmen Kırtasiye 1993 yılında Bursa'da kurulmuş olup 30 yılı aşkın süredir kırtasiye, okul ve sanat malzemeleri alanında hizmet vermektedir.",
      },
    },
    {
      '@type': 'Question',
      name: 'Ücretsiz kargo ne zaman geçerlidir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '500₺ ve üzeri siparişlerde Türkiye genelinde ücretsiz kargo uygulanmaktadır.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hangi ödeme yöntemlerini kullanabilirim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kredi kartı, banka havalesi ve kapıda ödeme seçenekleri mevcuttur.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hangi markaların ürünleri satılmaktadır?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Faber-Castell, Staedtler, Pelikan, BIC, Pilot, Rotring, Pentel, Lyra, Giotto, Maped ve daha birçok dünyaca ünlü markanın ürünleri mevcuttur.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kargo süresi ne kadardır?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Siparişler ortalama 1-3 iş günü içinde teslim edilmektedir.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePage />
    </>
  );
}
