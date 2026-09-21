---
name: Jina proxy requests
description: Constraints for using r.jina.ai as a source-page and search-page fallback
---

When fetching r.jina.ai, do not forward the browser User-Agent used for supplier pages. Jina can return 403 for that header even when the same URL works with a plain request. Proxy authentication must stay in request headers rather than query parameters.

**Why:** The source sites require browser-like headers, while Jina treats those headers as a separate access pattern; query-string secrets can also be exposed through request logs and URLs.

**How to apply:** Use a minimal `Accept: text/plain` request for Jina, retain browser headers only for direct supplier requests, and send `SEARCH_PROXY_SECRET` as `x-search-proxy-secret` or Bearer authentication. Jina search markdown starts with navigation/breadcrumb lines, so filter those before treating text as product description.