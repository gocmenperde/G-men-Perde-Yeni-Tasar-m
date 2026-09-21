import type { Metadata } from 'next';
import { HomePage } from '@/components/home/home-page';
import { generateKeywords, SITE_URL } from '@/lib/seo-keywords';

export const metadata: Metadata = {
  title: 'Tüm Ürünler | Kalem, Defter, Boya ve Kırtasiye Malzemeleri',
  description:
    "Göçmen Kırtasiye'nin tüm ürünlerini keşfedin. Kalem, defter, boya, silgi, makas, sanat malzemeleri ve okul gereçlerinde binlerce çeşit. Faber-Castell, Staedtler, Pelikan ve daha fazlası.",
  keywords: generateKeywords(),
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: `${SITE_URL}/products`,
    title: 'Tüm Ürünler | Göçmen Kırtasiye',
    description:
      'Binlerce kırtasiye ürünü uygun fiyatlarla. Kalem, defter, boya, sanat malzemeleri ve okul gereçleri.',
    siteName: 'Göçmen Kırtasiye',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Göçmen Kırtasiye Ürünleri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tüm Ürünler | Göçmen Kırtasiye',
    description:
      'Binlerce kırtasiye ürünü uygun fiyatlarla. Kalem, defter, boya ve daha fazlası.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Göçmen Kırtasiye Ürün Kataloğu',
  description: 'Kalem, defter, boya, sanat malzemeleri ve okul gereçleri',
  url: `${SITE_URL}/products`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Kalemler', url: `${SITE_URL}/kategori/kalemler` },
    { '@type': 'ListItem', position: 2, name: 'Defterler', url: `${SITE_URL}/kategori/defterler` },
    { '@type': 'ListItem', position: 3, name: 'Boyalar', url: `${SITE_URL}/kategori/boyalar` },
    { '@type': 'ListItem', position: 4, name: 'Sanat Malzemeleri', url: `${SITE_URL}/kategori/sanat-malzemeleri` },
    { '@type': 'ListItem', position: 5, name: 'Ofis Malzemeleri', url: `${SITE_URL}/kategori/ofis-malzemeleri` },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Ürünler', item: `${SITE_URL}/products` },
  ],
};

export default function ProductsPage() {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <HomePage />
    </>
  );
}
