---
name: Banner product selection
description: Banner-specific product choices are persisted inside SiteSettings popularSetsJson to avoid a Banner schema migration
---

## Rule
Keep banner product selections in the `bannerProductIds` map inside the existing homepage settings JSON rather than adding Banner columns.

**Why:** The storefront already persists homepage configuration there, and this avoids an additive database schema change for a small editorial relationship.

**How to apply:** Read and merge the map whenever banners are loaded or saved; preserve it when the homepage settings editor serializes its sections.