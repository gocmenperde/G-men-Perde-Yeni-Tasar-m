---
name: Preview hydration checks
description: How to distinguish stale preview-client warnings from real SSR markup mismatches
---

When a visual component is reordered or its server/client tree changes, validate the preview with a cache-busting URL or a fresh headless browser before rewriting stable SSR markup.

**Why:** A persistent preview browser can retain an older client bundle after a hot update, producing a structural hydration warning even when the fresh server HTML and current source agree.

**How to apply:** Restart the app workflow once, open a query-string variant or fresh browser session, and inspect the browser console before adding hydration suppression or client-only rendering.