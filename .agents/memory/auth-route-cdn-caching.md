---
name: Auth route CDN caching
description: CDN cache rules that protect NextAuth cookies and user-specific redirects
---

Private authentication and account routes must send `private, no-store` headers
to both the browser and the CDN. Cloudflare “Cache Everything” rules can cache
an unauthenticated `/account` redirect to `/login` and keep serving it after a
user has logged in.

**Why:** The live custom domain previously returned a cached 307 redirect with
`cf-cache-status: HIT` and a long `age`, so valid sessions never reached the
account page.

**How to apply:** Bypass or purge Cloudflare cache for `/api/auth/*`,
`/account*`, `/login*`, `/register*`, `/checkout*`, `/orders*`, and `/admin*`.
Keep the production `NEXTAUTH_URL` aligned with the final canonical host.