const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 gün
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async redirects() {
    return [
      // HTTP → HTTPS (Vercel bunu zaten yapar ama yedek olarak burada da var)
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://www.gocmenkirtasiye.com.tr/:path*",
        permanent: true,
      },
      // Tek bir host kullan: non-www URL'ler ürün/kategori sayfalarıyla
      // ayrı canonical kümeleri oluşturmasın.
      {
        source: "/:path*",
        has: [{ type: "host", value: "gocmenkirtasiye.com.tr" }],
        destination: "https://www.gocmenkirtasiye.com.tr/:path*",
        permanent: true,
      },
      // Silinmiş ürün sayfaları artık next.config 301 yerine
      // middleware'de 410 Gone olarak döndürülüyor (middleware.ts).
      // 410, Google'ın sayfayı 301'den çok daha hızlı index'ten çıkarmasını sağlar.
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap/:id.xml",
        destination: "/sitemap/:id",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control",    value: "on" },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      // Ürün detayları herkese açık ve session bağımsızdır. Detay HTML'i ve
      // metadata'sı edge'de tutulabilir; görseller uygulama origin'inden
      // proxy'lenmediği için bu kural ürün görseli trafiği oluşturmaz.
      {
        source: "/products/:slug",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/products",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/kategori/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=604800, stale-while-revalidate=86400",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=604800, stale-while-revalidate=86400",
          },
        ],
      },
      // Public catalog and SEO pages — serve crawler traffic from the edge
      // instead of sending every request back to the Next.js origin.
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/marka/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/kirtasiye/:sehir*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/barkod/:barcode*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/search",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      // Admin and customer-session pages must never be replayed from a CDN.
      // The middleware protects access; these headers protect the rendered
      // response and browser cache as a separate boundary.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/admin-giris",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/checkout/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/orders/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/cart",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/wishlist/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/payment/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      // /api/products cache başlıkları başarılı GET yanıtında route'un içinde
      // set edilir. Burada genel bir kural kullanmamak önemlidir: aksi halde
      // route'un no-store hata ve mutation yanıtları public cache'e taşınabilir.
      // Kategori ve marka API'leri — 5 dakika CDN cache
      {
        source: "/api/categories",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" },
          { key: "CDN-Cache-Control", value: "public, s-maxage=900, stale-while-revalidate=3600" },
          { key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=900, stale-while-revalidate=3600" },
        ],
      },
      {
        source: "/api/brands",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" },
          { key: "CDN-Cache-Control", value: "public, s-maxage=900, stale-while-revalidate=3600" },
          { key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=900, stale-while-revalidate=3600" },
        ],
      },
      {
        source: "/api/settings",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" },
          { key: "CDN-Cache-Control", value: "public, s-maxage=900, stale-while-revalidate=3600" },
          { key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=900, stale-while-revalidate=3600" },
        ],
      },
      {
        source: "/api/feed/google",
        headers: [
          { key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/sitemap/:path*",
        headers: [
          { key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      // Admin ve auth API'leri — asla cache'lenmesin
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/auth/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/orders/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/checkout/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/account/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/login/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/register/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
      // Statik dosyalar — 1 yıl immutable cache
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Public immutable assets — do not send browser cacheable files back to
      // the origin after their first edge fetch.
      {
        source: "/:path*\\.(css|js|mjs|cjs|map|png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2|ttf|otf|txt|html)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Manifest ve PWA dosyaları
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
      // OG görselleri — kısa cache (dinamik oluşturuluyor)
      {
        source: "/api/og",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
          { key: "CDN-Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
