# Case Study: TouchSpin’s Behavior‑First Rewrite (LinkedIn Short)

What we walked into
- A capable but tangled v4.x jQuery plugin. Rendering, behavior, and event wiring lived together. Adding Bootstrap/Tailwind variants raised risk, not velocity.

The move we made
- Split the spinner into three parts:
  - Core: framework‑agnostic logic (math, events, ARIA, timers).
  - Wrapper: tiny jQuery bridge (commands + event re‑emission).
  - Renderers: Bootstrap/Tailwind DOM only.
- Guard behavior with Playwright end‑to‑end tests (no unit tests). Tests assert what users see, not how code is arranged.

Two contracts that changed everything
- Roles + testids: renderers tag DOM with `data-touchspin-injected` and derive `{id}-up|down|...` selectors. Tests became stable across frameworks.
- Event ordering: one invariant timeline (startspin → directional start → … → directional stop → stopspin) and `min|max` before display at boundaries.

Moments that felt like progress
- Spinning couldn’t start at a boundary anymore. Edge cases stopped being edge cases.
- Native `change` fired only for real, sanitized values. Noise disappeared from apps listening to changes.

What this unlocked
- New renderers without touching core logic.
- Cleaner teardown; fewer integration surprises.
- A clearer mental model for anyone joining the project.

Takeaway
- When a component spans frameworks, design contracts first: data roles, event order, and selectors. Then let end‑to‑end tests keep you honest while you refactor underneath.
