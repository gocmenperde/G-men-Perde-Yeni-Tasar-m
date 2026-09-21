---
name: Dev/build cache collision
description: A workflow quirk when Next production builds and the development server share the same .next directory
---

When validating a Next app that uses the same `.next` directory for development and production output, restart the development workflow after running a production build.

**Why:** The production build can replace or remove development chunk files while the dev server is still serving the old manifest. Preview may then show unstyled HTML, MIME errors, or missing-module errors even though the source and build are valid.

**How to apply:** Run the production build first, then restart the app workflow once before taking the final screenshot or inspecting browser logs.