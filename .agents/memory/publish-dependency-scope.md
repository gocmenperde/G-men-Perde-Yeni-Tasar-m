---
name: Publish dependency scope
description: Replit publishing installs the monorepo workspace before running the app build
---

Replit publishing may install the entire pnpm workspace before the configured build command, so an unrelated development tool can block publishing even when the app itself does not use it.

**Why:** A Package Firewall rejection happens before the application build and appears as a generic publishing failure; filtering the later build command alone cannot prevent that initial workspace install.

**How to apply:** Keep generated production inputs checked in, remove unavailable code-generation-only dependencies from the workspace install graph, and use a filtered application build after the root install succeeds.