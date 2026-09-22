---
name: Curtain catalog boundary
description: Durable rules for keeping this storefront aligned with the Göçmen Perde catalog.
---

The storefront and admin catalog must read the same live database, and empty states must remain neutral or curtain-specific. Never auto-seed stationery demo categories, brands, products, or homepage copy when the catalog is empty.

**Why:** The project originally showed unrelated stationery data when the development catalog was empty, and cached taxonomy endpoints made admin deletions appear not to reach the storefront.

**How to apply:** Use live database results for categories, brands, and products; invalidate the homepage/catalog tags after admin mutations; keep public taxonomy responses uncached when immediate admin changes are required; use curtain-only fallback copy and visuals.