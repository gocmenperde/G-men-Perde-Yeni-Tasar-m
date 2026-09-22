---
name: Supabase MCP versus runtime connection
description: The connected Supabase MCP can inspect and migrate a project, but Prisma still needs a database URL in the app environment.
---

The Supabase MCP connection is an agent-side database tool, not a runtime Prisma connection. The deployed app must still receive the Supabase PostgreSQL URL through `SUPABASE_DATABASE_URL` or `DATABASE_URL`.

**Why:** MCP access successfully verified and migrated the database, but it does not inject database credentials into Vercel or the Next.js process.

**How to apply:** Keep explicit `SUPABASE_DATABASE_URL` support in the Prisma client and verify the Vercel environment before removing any legacy catalog fallback. If the Replit preview boots but reports missing catalog tables, do not run a destructive schema push during feature work; verify the UI/code locally and run data cleanup only against the configured catalog database.