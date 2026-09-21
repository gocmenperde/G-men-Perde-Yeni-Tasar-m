import type { Metadata } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Hakkımızda | Göçmen Perde — 1993'ten Bu Yana Bursa'nın Güvenilir Perdecisi",
  description:
    "Göçmen Perde, 1993 yılında Bursa Osmangazi'nde kurulmuş perde mağazasıdır. 30 yılı aşkın deneyimimizle özel ölçü, dikim ve montaj hizmeti veriyoruz.",
  keywords: [
    "göçmen perde hakkında",
    "göçmen perde tarihçe",
    "bursa perde mağazası",
    "1993 perde bursa",
    "osmangazi perdeci",
    "güvenilir perde mağazası",
    "özel ölçü perde",
  ],
  openGraph: {
    title: "Hakkımızda | Göçmen Perde",
    description:
      "1993'ten bu yana Bursa Osmangazi'nde hizmet veren Göçmen Perde. 30+ yıllık deneyimle özel ölçü, dikim ve montaj.",
    url: `${BASE_URL}/about`,
    siteName: "Göçmen Perde",
    locale: "tr_TR",
    images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630, alt: "Göçmen Perde Hakkında" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkımızda | Göçmen Perde",
    description: "1993'ten bu yana Bursa'nın güvenilir perde mağazası.",
  },
  alternates: { canonical: `${BASE_URL}/about` },
  robots: { index: true, follow: true },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Göçmen Perde Hakkında",
  url: `${BASE_URL}/about`,
  description: "Bursa'da 1993'ten bu yana faaliyet gösteren Göçmen Perde hakkında bilgiler",
  mainEntity: {
    "@type": "HomeGoodsStore",
    "@id": `${BASE_URL}/#business`,
    name: "Göçmen Perde",
    foundingDate: "1993",
    url: BASE_URL,
    description:
      "Bursa Osmangazi'nde 1993'ten bu yana faaliyet gösteren Göçmen Perde; tül, fon, zebra, stor ve plise perdelerde özel ölçü, dikim ve montaj hizmeti sunmaktadır.",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 5 },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A",
      addressLocality: "Osmangazi",
      addressRegion: "Bursa",
      addressCountry: "TR",
    },
    award: "30+ Yıllık Perde Deneyimi",
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
