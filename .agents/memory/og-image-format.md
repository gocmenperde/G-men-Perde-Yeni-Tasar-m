---
name: OG image format
description: The canonical OG image is og-image.svg (not .jpg); all metadata references updated
---

The site's Open Graph image is `public/og-image.svg` (1200×630, branded SVG).

All metadata in `app/layout.tsx`, `lib/seo-keywords.ts`, and all page/layout files reference `/og-image.svg` — not `/og-image.jpg`.

**Why:** There was no og-image.jpg file in public/. An SVG was created with the brand design (dark bg, gold accents, GÖÇMEN KIRTASİYE branding, Bursa·EST.1993). All 10+ references across the codebase were updated from .jpg to .svg.

**How to apply:** If adding new pages with OG metadata, always use `/og-image.svg` as the fallback image URL.
