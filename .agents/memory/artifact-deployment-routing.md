---
name: Artifact deployment routing
description: Replit publishing behavior when a project contains registered artifacts
---

When Replit publishes a project with a registered runnable artifact, the deployment may start that artifact directly and route the public URL to its port instead of executing the root `.replit` multi-process command. A root website can therefore return the API artifact's response (including 404) even when the root run script is correct.

**Why:** The deployment runtime reported artifact mode and exposed only the registered API port; the configured Store-plus-API launcher was not used.

**How to apply:** For a Replit-hosted proxy, verify the artifact endpoint directly. Do not infer that the root URL is the Store unless the deployment logs show the Store process or the Store is registered as a published artifact.