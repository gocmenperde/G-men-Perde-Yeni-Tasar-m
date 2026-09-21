---
name: Optional media states
description: UX rule for admin-managed media that may not have content yet
---

Admin-managed media should have a deliberate storefront state when no source has been configured. The surrounding module should remain discoverable and explain its purpose without pretending that media exists.

**Why:** A null media setting made the homepage video feature disappear entirely, which looked like a broken implementation rather than an unconfigured feature.

**How to apply:** Render a branded empty state for optional homepage media, and replace it with the real player as soon as an upload or external source is saved.