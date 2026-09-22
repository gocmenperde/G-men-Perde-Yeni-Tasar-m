# Göçmen Kırtasiye — Online Mağaza

Bursa Osmangazi'de 1993'ten bu yana faaliyet gösteren Göçmen Kırtasiye'nin e-ticaret sitesi.  
GitHub'da geliştirme yapılır, Vercel üzerinden deploy edilir — Replit sadece geliştirme ortamı olarak kullanılır.

## Deployment

- **GitHub → Vercel** otomatik deploy (main branch)
- Vercel env değişkenleri Vercel dashboard'da yönetilir
- Üretimde uygulama sorguları için `DATABASE_URL`, Prisma doğrudan şema/migration işlemleri için `DIRECT_URL` tanımlı olmalıdır
- `vercel.json` build komutunu ve output dizinini tanımlar

## Replit'te Çalıştırma (geliştirme)

- Workflow: **Start application** → `PORT=5000 pnpm --filter @workspace/store run dev`
- URL: `http://localhost:5000`

## Stack

- **Frontend/Backend**: Next.js 14 App Router (`artifacts/store/`)
- **DB**: PostgreSQL + Prisma ORM (Neon / Supabase)
- **Auth**: NextAuth.js v4 (Credentials + Google)
- **State**: Zustand (sepet, favoriler)
- **UI**: Tailwind CSS + Framer Motion + Lucide React
- **Forms**: React Hook Form + Zod
- **Email**: Nodemailer / EmailJS
- **Ödeme**: Stripe

## Where things live

- `artifacts/store/` — Next.js uygulaması (tek deploy edilebilir paket)
- `artifacts/store/app/(store)/` — Müşteri yüzü sayfalar
- `artifacts/store/app/(admin)/` — Admin paneli
- `artifacts/store/app/api/` — API route'ları
- `artifacts/store/components/store/` — Mağaza bileşenleri
- `artifacts/store/components/shared/` — Providers
- `artifacts/store/prisma/schema.prisma` — Veritabanı şeması
- `artifacts/store/lib/seo-keywords.ts` — SEO anahtar kelimeler ve JSON-LD verileri

## Architecture decisions

- Next.js App Router — Server Components + Client Components ayrımı
- JWT session stratejisi (performans için, database session yerine)
- Prisma Decimal tipler client component'a geçmeden `serializeProduct/serializeOrder` ile düzleştirilir
- JSON-LD structured data inline `<script type="application/ld+json">` tag ile head'e eklenir (SEO için Script component değil)
- Zustand ile client-side sepet ve favori yönetimi (localStorage kalıcılığı)
- ISR/data cache: ürün detayları 24 saat, ana sayfa ve ayarlar admin invalidation'ına kadar; etkileşimli ürün listesi request-time çalışır

## Trafik ve Fast Origin Transfer politikası

- Ürün/kategori/marka/ayar API'leri Vercel CDN'de kısa süreli `s-maxage` ve `stale-while-revalidate` ile cache'lenir.
- `/products` etkileşimli liste HTML/RSC yanıtı `private, no-store` kalır; ürün detayları ve SEO sayfaları edge cache kullanır. Böylece filtreli liste verisi CDN'de yanlışlıkla tekrar oynatılmaz.
- Auth middleware yalnızca admin, hesap, checkout ve sipariş rotalarında çalışır; public katalog isteklerinde gereksiz Edge invocation oluşturmaz.
- Arama/sepet önerilerinde `includeTotal=false` kullanılır; küçük öneri listeleri için pahalı katalog `count` sorgusu çalıştırılmaz.
- Public katalog, feed, OG ve sitemap yanıtlarında `Vercel-CDN-Cache-Control` açıkça tanımlıdır; cache politikası `artifacts/store/next.config.js` ve ilgili route yanıtlarında tek yerde tutulur. Vercel manifestleri yalnızca build/deploy ayarlarını içerir.
- Admin, kullanıcı, sepet/favori, adres, ödeme, upload ve iletişim uçları `private, no-store` olarak kalır.
- Katalog görselleri uygulama origin'inden proxy'lenmez; tedarikçi/CDN URL'lerinden doğrudan yüklenir.
- Veritabanındaki `data:`, `blob:` ve aşırı uzun görsel değerleri server/client payload'ına serialize edilmez; ürün, banner, kategori, marka, feed ve sitemap yanıtları yalnızca doğrudan erişilebilir URL taşır.
- Yeni deploy sonrası Vercel yanıtlarında `x-vercel-cache: HIT`/`STALE` görülmesi beklenir; `MISS` yalnızca ilk edge isteğinde normaldir.

## SEO Yapılandırması

- Sitemap: `/sitemap/[id].xml` — dinamik, ürün + kategori + şehir sayfaları
- robots.txt: otomatik oluşturulan, admin/cart/api yollarını bloklar
- JSON-LD: WebSite, Organization, LocalBusiness, Product, BreadcrumbList
- Google Search Console doğrulaması: `google5a5b2a90acddec72` (metadata verification)
- Open Graph + Twitter Card + product:* meta etiketleri

## Gotchas

- `next.config.js` kullanılmalı (Next.js 14 `.mjs` üst düzey yapılandırmayı farklı işler)
- Prisma Decimal nesneleri Client Component'a direkt geçilemez; `lib/serialize.ts` kullanılmalı
- Env değişkenleri Vercel'de tanımlı; Replit'te `.env.local` dosyası yoksa bazı DB bağlantıları çalışmaz

## User preferences

- Kullanıcı Türkçe iletişim kurmaktadır
- GitHub + Vercel deploy akışı korunmalı, değiştirilmemeli
- Tasarım: amber/gold marka rengi (#B8973E), Inter font, dark mode destekli
