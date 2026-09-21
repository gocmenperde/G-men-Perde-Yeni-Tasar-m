---
name: External Vercel production
description: How to verify the storefront when its custom domain is hosted outside Replit
---

The storefront's custom domain is served by an external Vercel deployment. Replit's deployment metadata can report no active deployment and no logs even while the live custom domain is healthy.

**Why:** Production debugging must not stop at the Replit deployment pane when the live response exposes Vercel and Cloudflare headers.

**How to apply:** Verify the canonical custom domain directly with HTTP requests and screenshots, inspect `x-vercel-cache`, `x-vercel-id`, and Cloudflare status headers, and treat missing Replit deployment logs as unavailable external logs rather than proof the site is down.

Vercel environment variables are not automatically available to the Replit preview process. A local preview can therefore connect to an injected empty/runtime database even while the external Vercel deployment is correctly connected to Supabase.

**Why:** The storefront's Vercel project had both production database variables configured, while the Replit process lacked them and reported missing catalog tables.

**How to apply:** Diagnose the live custom domain and the Replit preview as separate environments; never use a local missing-table error as proof that the Vercel/Supabase production connection is broken.