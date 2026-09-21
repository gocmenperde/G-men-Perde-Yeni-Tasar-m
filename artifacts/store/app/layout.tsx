import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { getCachedSettings } from "@/lib/settings";
import { generateKeywords, WEBSITE_JSONLD, LOCAL_BUSINESS_JSONLD, ORGANIZATION_JSONLD } from "@/lib/seo-keywords";

// Keep the shell cached indefinitely. Admin mutations invalidate affected
// storefront paths/tags explicitly instead of triggering timed ISR writes.
export const revalidate = false;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  const faviconUrl = settings?.faviconUrl ?? null;
  const siteName = settings?.siteName ?? "Göçmen Kırtasiye";

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: `${siteName} | Bursa'nın Perde Uzmanı`,
      template: `%s | ${siteName}`,
    },
    description:
      "Göçmen Perde — Bursa Osmangazi'nde 1993'ten beri tül, fon, zebra, stor ve plise perde modelleri. Ücretsiz ölçü, profesyonel dikim ve montaj hizmeti.",
    keywords: generateKeywords(),
    authors: [{ name: siteName, url: BASE_URL }, { name: "Emin", url: "mailto:nurse.emin016@gmail.com" }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [{ url: faviconUrl ?? "/icon.svg" }],
      apple: [{ url: faviconUrl ?? "/icon.svg" }],
      shortcut: [{ url: faviconUrl ?? "/icon.svg" }],
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: BASE_URL,
      siteName,
       title: `${siteName} | Bursa'nın Perde Uzmanı`,
      description:
        "Bursa'da 1993'ten beri tül, fon, zebra, stor ve plise perdelerde güvenilir adresiniz.",
      images: [
        {
          url: `${BASE_URL}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: `${siteName} — Bursa'nın Perde Uzmanı`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
       title: `${siteName} | Bursa'nın Perde Uzmanı`,
      description:
        "Bursa'da 1993'ten beri perde ve ücretsiz ölçü hizmetinde güvenilir adresiniz.",
      images: [`${BASE_URL}/og-image.svg`],
    },
    alternates: { canonical: BASE_URL },
    verification: { google: "google5a5b2a90acddec72" },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
    },
    other: {
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#B8973E",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#B8973E" />
        <meta name="msapplication-navbutton-color" content="#B8973E" />

        {/* CDN preconnects for customer-facing media */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* JSON-LD structured data — inlined in <head> so crawlers see it immediately */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[var(--cream)] text-[var(--ink)] transition-colors duration-300`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
