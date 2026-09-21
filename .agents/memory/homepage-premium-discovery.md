---
name: Premium homepage discovery
description: Design constraint for premium editorial modules on the storefront homepage
---

Premium discovery areas should guide shoppers into live catalog categories rather than depend on hand-picked product records or invented inventory. Use concise intent cards and trust/experience messaging around the primary product showcases.

**Why:** Catalog coverage and taxonomy can change between environments; category-derived links stay useful and avoid empty or misleading premium modules.

**How to apply:** Resolve intent cards against current category slugs with a safe `/products` fallback, and keep the main product showcases as the source of product-specific content.