# Premium Next.js E-Ticaret Başlangıç Projesi

Bu repo, App Router tabanlı müşteri + admin panelleri için iskelet yapı sağlar.

## Kurulum

1. `pnpm install`
2. `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun.
3. `pnpm prisma migrate dev`
4. `pnpm prisma db seed`
5. `pnpm dev`

## Dahil Edilenler

- Route grupları: `(store)` ve `(admin)`
- Prisma şema modelleri: User, Product, Category, Order, OrderItem, Cart, CartItem, Review, Address, Coupon, Brand
- API route handler iskeletleri
- Admin middleware koruması

> Not: Bu adımda bağımlılıkların tamamı henüz eklenmemiştir; geliştirme roadmap'i için bu iskelet genişletilmelidir.
