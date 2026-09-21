---
name: Fluid CPU and crawler caching
description: How crawler traffic can consume Vercel Fluid Active CPU in the storefront
---

Public SEO and feed endpoints must either be statically generated or return explicit shared-cache headers. Do not force dynamic rendering for robots or sitemap metadata routes when their output is safe to share.

**Why:** Vercel Fluid Active CPU measures execution during requests, not whether a human is viewing the site. Crawlers can repeatedly hit robots, sitemap, feed, OG, and dynamic catalog routes; a dynamic SEO route that misses the CDN on every request turns that background traffic into CPU usage.

**How to apply:** When investigating unexplained Vercel CPU, compare invocations and cache headers by route. Check `x-vercel-cache` and `cache-control` on robots, sitemap, feed, OG, and public catalog APIs before changing client-side timers. Reject unbounded sitemap IDs and pagination values before database queries.