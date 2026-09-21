---
name: Large media uploads
description: The production upload path for large video files must bypass serverless request body limits
---

Large videos must be uploaded directly from the browser to the configured media provider. The application server should authorize the admin action and return only a short-lived upload signature; it must not receive the video bytes.

**Why:** Production serverless proxies can reject multipart requests around a few megabytes with HTTP 413 before the application route runs, even when the route advertises a much larger file limit.

**How to apply:** Keep the signing endpoint authenticated and never expose the provider secret. Use the provider's browser upload endpoint for video while retaining the server route for small image uploads or other files. Prefer XMLHttpRequest over fetch for large FormData uploads when iOS Safari is a supported client.