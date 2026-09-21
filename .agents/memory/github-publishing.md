---
name: GitHub publishing
description: How to publish repository changes when the shell Git remote cannot authenticate
---

When the GitHub connector is authorized and added, repository changes can be sent through GitHub's authenticated API even when shell Git operations reject HTTPS credentials.

**Why:** Replit's connected GitHub authorization is available to the connector proxy but is not necessarily installed as a shell Git credential helper.

**How to apply:** Resolve and bind the exact GitHub connection, then use the SDK/connector proxy for repository reads or writes. If remote-tracking refs are already present locally, `git reset --hard origin/main` plus explicit upstream setup can finish the local alignment without a network fetch; a later shell fetch still needs Git credentials. For a full history sync, reconstruct only from verified GitHub objects rather than creating synthetic commits. Never request or expose a personal access token in chat.