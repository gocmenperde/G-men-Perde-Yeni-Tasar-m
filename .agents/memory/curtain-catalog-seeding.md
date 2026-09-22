---
name: Curtain catalog seeding
description: Safe one-time seeding approach for the new Göçmen Perde Vercel database
---

The new storefront database contains legacy tables that must remain untouched. Seed the catalog with idempotent upserts from the repository's curtain source JSON, then restore the normal Vercel build command; do not leave database mutation in every deployment.

**Why:** The imported database was non-empty with unrelated legacy data, while the new Prisma catalog tables were empty. Schema push could propose destructive drops, and the large stationery export was the wrong storefront catalog.

**How to apply:** Use the existing catalog source files and an idempotent import script for one-time recovery. Verify products, categories, brand, settings, and public routes on the current Vercel production URL before removing the temporary build step.