---
name: Workflow restart port race
description: Environment-specific behavior when restarting the store workflow after dependency or Prisma changes
---

After a workflow restart that includes dependency installation or Prisma generation, the previous Next dev process can briefly remain alive and keep port 5000 occupied. The workflow may report a failed start even though the old server still answers requests.

**Why:** A restart attempt produced EADDRINUSE and the preview loaded stale or incomplete assets until the orphaned process was stopped.

**How to apply:** Check the active listener and recent workflow log before retrying. If the workflow failed but an old Next process owns port 5000, stop that process once, then restart the managed workflow.