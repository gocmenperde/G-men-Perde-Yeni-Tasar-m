# Environment Setup (Prisma + Next.js)

Bu projede Prisma, veritabanına bağlanmak için `DATABASE_URL` değişkenine ihtiyaç duyar.
`prisma.user.findUnique()` sırasında aldığınız hata, uygulamanın çalıştığı ortamda bu değişkenin **tanımlı olmadığını** gösterir.

## 1) Lokal geliştirme

1. Kök dizinde `.env.example` dosyasını kopyalayın:

```bash
cp .env.example .env.local
```

2. `.env.local` içindeki `DATABASE_URL` değerini kendi Postgres bağlantınızla değiştirin.

Örnek:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
```

3. Prisma istemcisini yeniden üretin:

```bash
pnpm prisma generate
```

4. Gerekirse migration çalıştırın:

```bash
pnpm prisma migrate dev
```

5. Uygulamayı başlatın:

```bash
pnpm dev
```

## 2) Vercel / Production

`DATABASE_URL` ve `DIRECT_URL` değişkenlerini deployment platformunda tanımlayın:

- Vercel Dashboard → Project → **Settings** → **Environment Variables**
- Key: `DATABASE_URL`
- Value: production Postgres connection string
- Environment: Production (gerekirse Preview/Development da ekleyin)
- Key: `DIRECT_URL`
- Value: direct/session Postgres connection string
- Environment: Production (gerekirse Preview/Development da ekleyin)

> Önemli: Vercel'e değişken eklendikten sonra deployment'ı yeniden alın.



### Ürün Veri Asistanı

Ürün Veri Asistanı ayrı bir API Server veya arka plan worker kullanmaz. Kaynak kontrolü mağazanın Next.js serverless route'u üzerinden yapılır; önizleme sonucu imzalı ve kısa süreli token ile taşınır.

Vercel ortamında mağazanın mevcut kimlik doğrulama sırrı tanımlı olmalıdır:

- `NEXTAUTH_SECRET` (tercih edilen) veya `AUTH_SECRET`

Bu değer olmadan yönetici oturumu ve ürün önizleme token'ı üretilemez. `PRODUCT_SEARCH_BACKEND_URL` ve `SEARCH_PROXY_SECRET` artık bu akış için gerekli değildir.


### PAYTR değişkenleri

PAYTR entegrasyonu için aşağıdaki değişkenleri hem lokal (`.env.local`) hem de Vercel ortamına ekleyin:

- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_OK_URL` (opsiyonel)
- `PAYTR_FAIL_URL` (opsiyonel)
- `PAYTR_TEST_MODE` (`1` veya `true` test modu için)

## 3) Hızlı doğrulama

Aşağıdaki komutlar ortam değişkeninin gerçekten yüklendiğini doğrulamak için kullanılabilir:

```bash
node -e "console.log(!!process.env.DATABASE_URL)"
```

`true` dönmeli.

Ayrıca Prisma bağlantı testi:

```bash
pnpm prisma db pull
```

Bağlantı string'i doğruysa şema okunur; yanlışsa bağlantı hatası alırsınız.

## 4) Sık yapılan hatalar

- `.env.local` dosyasını repo altına değil farklı klasöre koymak.
- `DATABASE_URL` adını yanlış yazmak (örn: `DATABASE-URL`).
- Bağlantı string'inde özel karakterleri encode etmemek.
- Platformda env değişkeni ekleyip redeploy yapmayı unutmak.

## 5) Bu repodaki ilgili dosyalar

- Prisma datasource: `prisma/schema.prisma`
- Runtime kontrolü: `lib/env.ts`
- Register API hata dönüşü: `app/api/auth/register/route.ts`
