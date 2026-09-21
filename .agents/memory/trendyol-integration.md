---
name: Trendyol Integration
description: How the Trendyol product import works; seller ID and API endpoints
---

Seller store: https://www.trendyol.com/magaza/gocmen-perde-kirtasiye-m-1249327
Seller ID: 1249327

API route: `app/api/admin/trendyol/route.ts`
- GET: fetches products from Trendyol public API (infinite-scroll endpoint), falls back to HTML scraping
- POST: imports selected products to DB (upserts category + brand, creates product)

**Why:** No official Trendyol API for third-party sellers. Uses reverse-engineered public search endpoint.
Primary: `https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?pId=1249327&st=3&sst=0&os=1&pi={page}&sk=1`
Fallback: HTML scrape of store page, looking for `window.__SEARCH_APP_INITIAL_STATE__`

**How to apply:** If Trendyol changes their API, update the URL in `fetchFromApi`. If both fail, user sees clear error.
