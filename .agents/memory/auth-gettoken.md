---
name: Auth fix — getToken vs getServerSession
description: Why and how to use getToken instead of getServerSession for API routes in this Next.js app
---

## Rule
Use `getToken({ req, secret })` from `next-auth/jwt` instead of `getServerSession(authOptions)` in ALL API route handlers.

**Why:** When `NEXTAUTH_URL` in `.env.local` doesn't match the production domain (e.g. it points to an old `pike.replit.dev` URL while the site runs on `gocmenkirtasiye.com.tr`), `getServerSession` silently returns `null` → every admin/user API call gets 401 → nothing saves. `getToken` reads the JWT cookie directly, is URL-independent, and never fails due to domain mismatch.

**How to apply:**
- Admin-only routes → `import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin"`
- User-session routes → `import { getUserFromToken } from "@/lib/get-user-token"`
- Both helpers are in `artifacts/store/lib/`
- Dev environment always returns `true` for admin (no auth in dev)
- tsconfig target must be `ES2018` or higher for regex `/s` flag in trendyol route

## Secret fallback

The deployment may expose the shared auth secret as `SESSION_SECRET` rather than
`NEXTAUTH_SECRET`. Auth configuration, middleware, API token readers, and server
cookie decoding must use the same fallback chain and include `SESSION_SECRET`.

**Why:** If NextAuth signs or verifies with different secret availability across
development and deployment, the login request can appear successful while the
session endpoint returns an empty object and the navbar stays on “Giriş Yap”.

**How to apply:** Keep `NEXTAUTH_SECRET` first for compatibility, then
`AUTH_SECRET`, `SESSION_SECRET`, and `SECRET` in every auth reader.
