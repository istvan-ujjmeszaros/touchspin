# I Refactored a jQuery Spinner Without Breaking Apps (Here’s How)

I inherited a jQuery spinner that worked well for users but was difficult to evolve. Rendering, behavior, and event wiring lived side by side. Every time I added a Bootstrap or Tailwind variant, I held my breath.

I wanted to move fast without shipping surprises. So I rewrote the architecture around behavior, not files:

I split the component into three pieces. A framework‑agnostic core now owns value math, timing, ARIA, and events. A tiny jQuery wrapper forwards commands and re‑emits those events. Renderers focus on DOM only (Bootstrap 3/4/5, Tailwind), and call into the core to attach behavior.

I kept tests strictly end‑to‑end with Playwright. No unit tests by design. The goal was to protect what users see and do, while letting internals change freely.

Two decisions made the biggest difference:

First, I defined a renderer contract. Renderers label injected elements with simple data roles and derive predictable test ids (`{id}-up`, `{id}-down`, etc.). That gave me stable selectors across frameworks and removed the temptation to target layout.

Second, I wrote down event order and boundary rules as invariants. A spin starts with `startspin`, then a directional start; hitting an exact min/max fires `min|max` before the display changes; a spin ends with a directional stop and then `stopspin`. Once this timeline was consistent, debugging got easier and edge cases stopped being edge cases.

The result is calm. I can add a renderer without touching core logic. Apps listening to `change` no longer receive noisy intermediate values because I gate native `change` until sanitation completes. Teardown is straightforward. New contributors can read the contracts and immediately understand where things belong.

If you’re staring at a similar refactor: write the contracts first (roles, selectors, event order). Guard the experience with end‑to‑end tests. Then change the internals with confidence.
