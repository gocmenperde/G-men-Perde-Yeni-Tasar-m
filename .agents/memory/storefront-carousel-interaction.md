---
name: Storefront carousel interaction
description: Touch and automatic movement behavior for homepage product rails
---

Product rails on the storefront should use one continuous horizontal scroll track with repeated items for loop continuity. Do not reorder the visible cards while a drag is in progress or fake the gesture with a fixed transform offset.

**Why:** Reordering cards during touch makes the left card disappear, leaves only a partial card on the right, and makes the page feel frozen instead of physically scrollable.

**How to apply:** Keep touch scrolling native with horizontal overflow and preserve the same track for finger, arrow, and automatic movement. If looping is needed, normalize the scroll position across repeated product groups after the equivalent content is visible.