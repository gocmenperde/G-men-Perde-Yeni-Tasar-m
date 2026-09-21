---
name: Running app location
description: The live app is artifacts/store (port 5000), not the root app/ directory
---

The actual running Next.js app is at `artifacts/store/`, served on port 5000 via `next dev -p $PORT`.

The root `app/` directory is boilerplate/secondary and is NOT the running store.

**Why:** The project was set up as a pnpm monorepo with the store as an artifact. All edits must target `artifacts/store/`.

**How to apply:** Any component, page, or config edit should be in `artifacts/store/`. When checking logs, look for the `Start application` workflow running `artifacts/store` dev server.
