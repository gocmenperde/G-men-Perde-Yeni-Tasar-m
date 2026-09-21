import type { Metadata } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Hakkımızda | Göçmen Kırtasiye — 1993'ten Bu Yana Bursa'nın Kırtasiye Uzmanı",
  description:
    "Göçmen Kırtasiye, 1993 yılında Bursa Osmangazi'nde kurulmuş kırtasiye mağazasıdır. 30 yılı aşkın deneyimimizle kalem, defter, boya, sanat malzemeleri ve okul gereçlerinde Türkiye geneline hizmet veriyoruz.",
  keywords: [
    "göçmen kırtasiye hakkında",
    "göçmen kırtasiye tarihçe",
    "bursa kırtasiye mağazası",
    "1993 kırtasiye bursa",
    "osmangazi kırtasiye",
    "güvenilir kırtasiye sitesi",
    "türkiye kırtasiye mağazası",
  ],
  openGraph: {
    title: "Hakkımızda | Göçmen Kırtasiye",
    description:
      "1993'ten bu yana Bursa Osmangazi'nde hizmet veren Göçmen Kırtasiye. 30+ yıllık deneyimle kalem, defter, boya ve sanat malzemeleri.",
    url: `${BASE_URL}/about`,
    siteName: "Göçmen Kırtasiye",
    locale: "tr_TR",
    images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630, alt: "Göçmen Kırtasiye Hakkında" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkımızda | Göçmen Kırtasiye",
    description: "1993'ten bu yana Bursa'nın güvenilir kırtasiye mağazası.",
  },
  alternates: { canonical: `${BASE_URL}/about` },
  robots: { index: true, follow: true },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Göçmen Kırtasiye Hakkında",
  url: `${BASE_URL}/about`,
  description: "Bursa'da 1993'ten bu yana faaliyet gösteren Göçmen Kırtasiye hakkında bilgiler",
  mainEntity: {
    "@type": "StationeryStore",
    "@id": `${BASE_URL}/#business`,
    name: "Göçmen Kırtasiye",
    foundingDate: "1993",
    url: BASE_URL,
    description:
      "Bursa Osmangazi'nde 1993'ten bu yana faaliyet gösteren Göçmen Kırtasiye; kalem, defter, boya, sanat malzemeleri ve okul gereçlerinde Türkiye geneline online satış yapmaktadır.",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 5 },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A",
      addressLocality: "Osmangazi",
      addressRegion: "Bursa",
      addressCountry: "TR",
    },
    award: "30+ Yıllık Kırtasiye Deneyimi",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      {children}
    </>
  );
}
