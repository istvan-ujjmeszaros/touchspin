# Case Study: A Behavior‑First Rewrite of Bootstrap TouchSpin (Long Form)

The problem behind the code
TouchSpin v4.x worked—but it asked every change to cross too many boundaries. Rendering lived next to math; event wiring lived inside the same closure as state. Supporting Bootstrap 3/4/5 and Tailwind turned simple requests into careful surgery.

Our constraints (by design)
- Preserve behavior end‑to‑end. No silent breakage for apps already listening to events.
- Keep tests fully end‑to‑end with Playwright. Assert outcomes, not internals.
- Avoid framework coupling inside core; push all presentation into renderers.

Principles that shaped the rewrite
- Separate concerns with explicit contracts.
- Make edge‑case rules first‑class (boundaries, event order, change emission).
- Prefer data attributes and element‑attached instances over ad‑hoc selectors and global state.

What changed architecturally
- Core: one place for state, math, constraints, timers, ARIA, and native attribute sync. Public API returns an object you can call directly.
- jQuery wrapper: a slim adapter that forwards commands and re‑emits core events. No DOM event logic.
- Renderers: framework‑specific DOM only, marked with roles (`data-touchspin-injected`) and deterministic testids derived from the input.

Invariants that made the system predictable
- Start/stop timeline: `startspin` → directional start → … → directional stop → `stopspin`.
- Boundary ordering: hitting exact min/max emits `min|max` before updating display; holding stops immediately at bounds.
- Change discipline: intercept native `change` in capture if sanitation would change the value; emit a final `change` only when the sanitized display differs.

The two biggest unlocks
1) Renderer contract (roles + testids). Tests stopped caring about DOM shape differences across frameworks; renderers became easy to review.
2) Element‑attached instances. No jQuery data coupling in core; wrappers and frameworks integrate without leaking assumptions.

Debugging stories (the short versions)
- The spinner that wouldn’t stop: a hold at max should end with `max` then `stopupspin` → `stopspin`. Capturing this in a sequence diagram made the fix straightforward.
- The noisy change listener: inputs were dispatching `change` mid‑typing. Moving sanitation to blur/Enter and intercepting change in capture removed the noise without losing user feedback.

Why end‑to‑end tests worked for a rewrite
- They reflect user reality: a rendered page, real buttons, real inputs, real events.
- They allow internals to evolve freely as long as observable behavior stays correct.
- Deterministic testids (`{id}-up|down|...`) kept assertions stable across renderers.

What this enables now
- Add a new renderer without touching core.
- Wrap the core in other frameworks by forwarding a small set of commands and events.
- Reason about tricky flows using a small set of documented invariants.

If you’re planning a similar refactor
- Write contracts first (roles, event ordering, selectors). Then make the system prove them on every run.
- Intercept or gate noisy events at the boundary; let the final value speak for itself.
- Keep history in a separate place; keep your main README focused on how to extend the system today.
