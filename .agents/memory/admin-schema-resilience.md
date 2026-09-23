---
name: Admin schema resilience
description: Admin dashboard and Premium controls must survive partial legacy production schemas without false catalog setup warnings.
---

The admin dashboard should treat orders, analytics, Premium counts, and settings as independently optional reads. A single legacy-schema failure must not crash the route or label a valid catalog as empty; only zero catalog counts should suggest seeding.

**Why:** The external production database can contain the live catalog while older migrations leave optional tables or columns unavailable. The storefront still works, but all-or-nothing admin Server Components fail and threshold-based brand counts create false alarms.

**How to apply:** Wrap admin page reads with per-query fallbacks, keep catalog-empty checks at zero rather than arbitrary minimums, and repair additive Premium settings columns only when the save path detects a missing-column error.