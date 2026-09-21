---
name: Dependency install firewall
description: A workspace package-firewall failure can prevent installing the store's dependencies and starting its workflow.
---

When the store workflow cannot start because `package-firewall.replit.internal` returns 403 for a public package tarball, treat it as an environment verification block rather than an application runtime failure.

**Why:** The workflow can install hundreds of packages successfully and then fail before the app starts, so a missing `node_modules` binary can look like a code regression.

**How to apply:** Check the workflow log for `ERR_PNPM_FETCH_403` and the specific tarball before changing application code or retrying the same build repeatedly.