---
name: Vercel origin quota boundaries
description: Cache and middleware boundaries that reduce origin transfer without replaying private or failed responses
---

Public catalogue APIs should set their success cache headers in the route handler, while error and mutation responses must explicitly return private no-store headers. Avoid broad config rules that can overwrite those boundaries.

**Why:** A global cache rule for `/api/products` turned a temporary database error into a public cache candidate and also covered mutation subroutes. Route-local headers preserve the intended success/error split.

**How to apply:** Keep auth middleware limited to protected paths, keep interactive `/products` HTML/RSC private, cache stable detail/SEO responses at the edge, and use an explicit opt-out such as `includeTotal=false` for small autocomplete/recommendation reads.