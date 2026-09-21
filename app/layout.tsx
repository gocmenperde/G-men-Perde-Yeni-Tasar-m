import type { Metadata } from 'next';
import './globals.css';
import { generateKeywords, WEBSITE_JSONLD, LOCAL_BUSINESS_JSONLD, ORGANIZATION_JSONLD } from '@/lib/seo-keywords';

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.gocmenkirtasiye.com.tr'
).replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Göçmen Kırtasiye | Bursa'nın Kırtasiye Uzmanı",
    template: '%s | Göçmen Kırtasiye',
  },
  description:
    "Göçmen Kırtasiye — Bursa'da 1993'ten bu yana kırtasiye uzmanı. Kalem, defter, boya, sanat malzemeleri, okul ve ofis gereçleri. Faber-Castell, Staedtler, Pelikan ve daha fazlası. Ücretsiz kargo, hızlı teslimat.",
  keywords: generateKeywords(),
  authors: [{ name: 'Göçmen Kırtasiye', url: BASE_URL }],
  creator: 'Göçmen Kırtasiye',
  publisher: 'Göçmen Kırtasiye',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'Göçmen Kırtasiye',
    title: "Göçmen Kırtasiye | Bursa'nın Kırtasiye Uzmanı",
    description:
      "Bursa'da 1993'ten bu yana kalem, defter, sanat malzemeleri ve okul gereçlerinde güvenilir adresiniz. Türkiye genelinde hızlı kargo.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Göçmen Kırtasiye — Bursa'nın Kırtasiye Uzmanı",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Göçmen Kırtasiye | Bursa'nın Kırtasiye Uzmanı",
    description:
      "Bursa'da 1993'ten bu yana kırtasiye ürünlerinde güvenilir adresiniz.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'google5a5b2a90acddec72',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Göçmen Kırtasiye',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#B8973E',
    'theme-color': '#B8973E',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='tr' suppressHydrationWarning>
      <head>
        <meta name='theme-color' content='#B8973E' />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
