---
name: Vercel CDN cache policy
description: Durable caching boundary for the storefront's public and private traffic
---

Public catalog APIs and stable SEO pages may declare `Vercel-CDN-Cache-Control` explicitly with a bounded `s-maxage` and stale-while-revalidate window. Interactive product listing HTML/RSC responses must remain `private, no-store`, as must user, admin, payment, upload, and mutation responses.

**Why:** The deployment uses both Vercel and downstream CDN headers, and caching a product listing's Next.js RSC response for days can replay stale flight data during client-side navigation and show the storefront error boundary on mobile.

**How to apply:** Keep the root deployment manifest and the store's Next configuration aligned. Recheck both config layers whenever a public API route's freshness window changes, and verify production `x-vercel-cache` behavior after deployment. Do not apply public CDN caching to `/products` HTML or RSC routes.