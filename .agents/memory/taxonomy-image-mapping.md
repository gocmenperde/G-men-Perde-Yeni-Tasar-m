---
name: Taxonomy image mapping
description: Rule for keeping category and brand visual fallbacks aligned with the live catalog
---

Taxonomy visual maps must use the live seed/database slugs as their primary keys; demo aliases can silently select an unrelated image while the page still appears healthy.

**Why:** The storefront can render without errors even when a visual mapping points at an old taxonomy vocabulary, making the mismatch visible only as an irrelevant category or brand image.

**How to apply:** When taxonomy names or slugs change, update the curated image map and the category bar, category grid, and brand slider together, then test each public source through the image proxy.