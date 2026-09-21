---
name: Store navbar rendering
description: Rendering constraint for the store header in the proxied Next preview
---

The store navbar should remain a normal server-rendered import in the store layout. Do not switch it to `next/dynamic` with `ssr: false` as a hydration workaround.

**Why:** In the proxied development preview, the client-only version entered the `Lazy/LoadableComponent` error boundary even though the server returned HTTP 200 and the page compiled.

**How to apply:** Prefer making the navbar’s first render structurally stable. If hydration warnings remain, isolate the specific stateful child rather than replacing the complete header with a client-only dynamic component. The proxied preview can still report an `aria-hidden` warning for Lucide icons even when direct server HTML is clean; this warning does not block rendering.

Persisted cart and wishlist badge counts should render as zero until the client has hydrated, then reveal localStorage-backed values. This keeps the SSR and first client tree identical without hiding the complete navbar.

**Why:** Zustand persistence can restore browser-only state during hydration, changing conditional badge children next to otherwise stable icons.

**How to apply:** Keep the header server-rendered and gate only browser-persisted badge/count UI behind a small mounted flag.

The proxied preview screenshot session can retain an older client bundle and console history after a workflow restart; compare fresh server-rendered HTML and workflow logs before treating a repeated hydration warning as current.

**Why:** Preview captures may reuse the same browser context while Next recompiles the server output, so stale visual text and prior console errors can outlive the code that produced them.

**How to apply:** Use a cache-busted route plus direct HTML/HTTP checks to validate the latest SSR output, while keeping the navbar SSR-safe for genuinely fresh sessions.

Homepage carousels should use a track with live drag offset rather than changing the active item only on touch release; keep `touch-action: pan-y` so horizontal gestures can be captured without breaking vertical page scroll.

**Why:** End-only swipe feedback feels like a button interaction, while live offset gives the premium native-carousel feel the storefront needs on mobile.

**How to apply:** Update the track transform during touch movement, animate the settle, then commit the next item and reset the offset after the gesture completes.