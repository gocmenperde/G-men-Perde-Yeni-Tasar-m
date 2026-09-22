---
name: Mobile form focus
description: React component identity rules for stable mobile inputs in the storefront
---

Interactive input components must be declared at module scope rather than inside a parent component's render function. Pass their values and handlers as props so a parent state update does not replace the component type.

**Why:** React treats a nested component function as a new component type on every parent render. Controlled inputs can then remount on each keystroke, losing focus and producing especially confusing keyboard or touch-through behavior in iOS Safari.

**How to apply:** When a mobile form updates parent state, keep the field component identity stable and support locale decimal input explicitly with `inputMode="decimal"` plus controlled normalization for comma and period values.