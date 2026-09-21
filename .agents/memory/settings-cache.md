---
name: Settings Cache Fix
description: Why getCachedSettings was revalidated to 5s and handleSave was patched
---

The `getCachedSettings` in `lib/settings.ts` used `unstable_cache` with `revalidate: 60`.
In production (Vercel), the `revalidateTag("site-settings-global")` was being called correctly in the PUT route,
but the 60-second floor meant stale data could persist.

**Why:** Reduced to `revalidate: 5` so settings changes apply within 5 seconds max.
`handleSave` in settings-client.tsx was not checking response status — always showed "Kaydedildi!" even on 401/500 errors.

**How to apply:** Keep revalidate at 5 or lower. If settings still don't apply in production,
check that `getServerSession(authOptions)` works (NEXTAUTH_URL + NEXTAUTH_SECRET must be set in Vercel env vars).
