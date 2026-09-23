---
name: Neon runtime selection
description: Replit's provisioned database can be empty while the imported storefront catalog lives in Neon.
---

For the imported Göçmen Perde storefront, prefer `NEON_DATABASE_URL` for runtime Prisma queries when it is present, and keep `DIRECT_URL` for direct Prisma schema operations.

**Why:** The workspace-managed `DATABASE_URL` pointed to an empty `heliumdb`, while the provided Neon URLs pointed to the populated catalog database.

**How to apply:** When preview logs report missing `Category` or `SiteSettings` tables, compare table existence on the configured URLs before running migrations or seeding; do not seed the empty workspace database.