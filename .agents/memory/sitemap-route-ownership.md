---
name: Sitemap route ownership
description: Why the store sitemap index and numbered sitemap routes are explicit rather than mixed with a static public file or metadata route.
---

The store must expose a runtime `/sitemap.xml` index plus numbered `/sitemap/{id}.xml` files. Next's `generateSitemaps()` does not provide the root index in this setup, and a `public/sitemap.xml` file shadows dynamic behavior.

**Why:** A stale public sitemap was served instead of the database-backed sitemap, while adding a route beside the metadata sitemap created a duplicate route and returned the wrong XML shape.

**How to apply:** Keep the root index and numbered XML responses as explicit routes, use the existing numbered partition size, and invalidate their cached data when catalog mutations occur.