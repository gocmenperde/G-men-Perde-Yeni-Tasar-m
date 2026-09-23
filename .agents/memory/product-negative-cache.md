---
name: Product negative-cache recovery
description: Prevent stale missing-product cache entries from making newly imported catalog items unavailable to crawlers.
---

The storefront must not trust a cached null or inactive product lookup when the same catalog is already exposing that product in feeds. On a cached miss, recheck the live catalog before rendering not-found.

**Why:** Product imports can happen after a crawler or visitor cached a missing result. CDN and framework caching can then serve a successful HTTP response whose body is a not-found page, causing Merchant Center to mark the product unavailable.

**How to apply:** Keep public feeds and storefront slug lookups on the same catalog source, and make cached misses self-heal with a direct lookup. After publishing, request a previously affected product and refresh Merchant Center diagnostics.