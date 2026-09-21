---
name: Homepage configuration
description: Durable decisions for configuring the storefront homepage from admin settings
---

The homepage configuration is a versioned, ordered section list stored in the existing `SiteSettings.popularSetsJson` field rather than a new table. This includes brand/editorial strips as well as product rails. The parser must continue accepting the older visibility-only JSON shape.

**Why:** Keeping the configuration in the existing settings record avoids a schema migration while allowing every homepage section, including new brand storytelling, to be enabled, ordered, renamed, and given selected products.

**How to apply:** When adding a homepage section, update the shared defaults/parser and the storefront renderer together. Automatic product sources remain the fallback; selected product IDs override ordering when present. Book bestseller data must remain scoped to the live `kitap` category.