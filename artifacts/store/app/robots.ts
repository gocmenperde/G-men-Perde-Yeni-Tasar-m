import { MetadataRoute } from "next";

// robots.txt sadece sitemap index'ini gösterir. İndeks, ürün sitemap parçalarını
// kendi içinde listeler; burada DB'ye gidip her parçayı tekrar üretmeye gerek yok.
export const revalidate = false;
export const dynamic = "force-static";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gocmenkirtasiye.com.tr"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Admin ve auth — trailing slash olmadan da blokla
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/orders",
          "/orders/",
          "/checkout",
          "/checkout/",
          // Kullanıcı UI sayfaları — index'lenmemeli
          "/cart",
          "/login",
          "/register",
          "/wishlist",
          "/wishlist/",
          "/payment/",
           // Arama sayfaları SEO için kullanılmıyor; filtreli ürün URL'lerinde
           // noindex + canonical kullanılır. Query URL'lerini robots ile
           // engellemek, Google'ın redirect/canonical sinyalini görememesine
           // ve "engellendiği halde dizinde" raporuna yol açabilir.
          "/search",
          // API ve teknik rotalar
          "/api/",
          "/_next/",
        ],
      },
      {
        // Bilinen maliyetli AI/SEO tarayıcıları Google arama indeksini
        // etkilemeden durdurulur. Uymayan botlar için WAF/rate limit gerekir.
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Google-Extended",
          "CCBot",
          "Bytespider",
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "PetalBot",
          "Amazonbot",
          "PerplexityBot",
          "DataForSeoBot",
        ],
        disallow: "/",
      },
      {
        // Googlebot için aynı kurallar + Shopping feed'e izin ver
        userAgent: "Googlebot",
        allow: ["/", "/api/feed/"],
        disallow: [
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/orders",
          "/orders/",
          "/checkout",
          "/checkout/",
          "/cart",
          "/login",
          "/register",
          "/wishlist",
          "/wishlist/",
          "/payment/",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}