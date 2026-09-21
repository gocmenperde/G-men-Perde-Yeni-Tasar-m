import type { Metadata } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "İletişim | Göçmen Kırtasiye — Bursa Osmangazi",
  description:
    "Göçmen Kırtasiye ile iletişime geçin. Bursa Osmangazi merkez mağazamız: Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A. Tel: 0546 285 18 26. Pazartesi–Cumartesi 09:00–18:00.",
  keywords: [
    "göçmen kırtasiye iletişim",
    "göçmen kırtasiye adres",
    "göçmen kırtasiye telefon",
    "bursa kırtasiye iletişim",
    "bursa osmangazi kırtasiye",
    "kırtasiye mağazası bursa",
    "bursa kırtasiye adres",
  ],
  openGraph: {
    title: "İletişim | Göçmen Kırtasiye",
    description:
      "Göçmen Kırtasiye ile iletişime geçin. Bursa Osmangazi merkez mağaza, telefon ve e-posta.",
    url: `${BASE_URL}/contact`,
    siteName: "Göçmen Kırtasiye",
    locale: "tr_TR",
    images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630, alt: "Göçmen Kırtasiye İletişim" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "İletişim | Göçmen Kırtasiye",
    description: "Bursa Osmangazi kırtasiye mağazamız ile iletişime geçin.",
  },
  alternates: { canonical: `${BASE_URL}/contact` },
  robots: { index: true, follow: true },
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Göçmen Kırtasiye İletişim",
  url: `${BASE_URL}/contact`,
  description: "Göçmen Kırtasiye iletişim bilgileri ve müşteri hizmetleri",
  mainEntity: {
    "@type": "StationeryStore",
    "@id": `${BASE_URL}/#business`,
    name: "Göçmen Kırtasiye",
    telephone: "+905462851826",
    email: "muhammedemint76@gmail.com",
    url: BASE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bağlarbaşı Mah. Mümin Gençoğlu Cad. 1. Sarıgül Sok. No:3/A",
      addressLocality: "Osmangazi",
      addressRegion: "Bursa",
      postalCode: "16000",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "40.1885",
      longitude: "29.0610",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+905462851826",
        contactType: "customer service",
        availableLanguage: "Turkish",
        areaServed: "TR",
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "18:00",
        },
      },
    ],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      {children}
    </>
  );
}
