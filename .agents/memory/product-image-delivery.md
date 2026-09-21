---
name: Product image delivery
description: Durable rule for supplier-hosted product and category imagery in the storefront
---

Customer-facing supplier/CDN imagery should be requested directly from its original URL. Next's image optimizer and the application's legacy image proxy are disabled for this surface.

**Why:** Routing image bytes through the application origin was identified as a source of excessive Vercel Fast Origin Transfer and can duplicate traffic already served by Cloudinary or another supplier CDN.

**How to apply:** Use the shared image source helper to validate HTTP(S) candidates, keep the full candidate list for fallback handling, and render an explicit loading/error state. Do not reintroduce `/api/image-proxy` or `/_next/image` for catalog images unless the bandwidth policy is deliberately revisited.

The same boundary must be enforced before server serialization. Rejecting a `data:` URL only in the client image component is too late because React Flight/RSC has already embedded the bytes in the HTML response. When changing image payloads, bump the related data-cache key so an old cached read model cannot keep returning embedded bytes.