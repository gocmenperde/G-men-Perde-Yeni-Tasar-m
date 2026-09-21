---
name: Preview proxy forwarding
description: How to distinguish a healthy local port from a broken proxied preview domain
---

The store workflow can be healthy on port 5000 while the `$REPLIT_DEV_DOMAIN` proxy returns 502 for both pages and API routes. Verify with the workflow logs and a local port request before changing application code.

**Why:** A restart showed Next ready on port 5000 and local API requests returned 200, while the proxied domain alone returned 502; more application edits would not fix that forwarding layer.

**How to apply:** Treat this as a preview/platform forwarding issue, keep the application bound to the configured port, and report the verified local health if the proxy remains unavailable.