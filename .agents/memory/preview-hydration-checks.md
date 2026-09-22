---
name: Preview hydration checks
description: How to distinguish stale preview-client warnings from real SSR markup mismatches
---

When a visual component is reordered or its server/client tree changes, validate the preview with a cache-busting URL or a fresh headless browser before rewriting stable SSR markup. If the persistent preview still shows the old client text, compare the fresh HTML and served route chunk directly.

**Why:** A persistent preview browser can retain an older client bundle after a hot update, producing a structural hydration warning or stale text even when the fresh server HTML and current route chunk agree.

**How to apply:** Restart the app workflow once, open a query-string variant or fresh browser session, inspect the browser console, and use curl plus the route chunk to separate browser cache from an actual SSR/client mismatch before adding hydration suppression or client-only rendering.