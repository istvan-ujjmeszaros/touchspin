# Case Study: From Monolith to Modular — Refactoring Bootstrap TouchSpin

Problem
- The v4.x plugin was a single, monolithic jQuery implementation mixing rendering, logic, and event wiring. Supporting multiple frameworks (Bootstrap 3/4/5, Tailwind) and evolving behavior without regressions had become risky.

Approach
- Split responsibilities into a framework‑agnostic core, a minimal jQuery wrapper, and framework‑specific renderers.
- Preserve public behavior with end‑to‑end Playwright tests only (no unit tests), enabling aggressive internal refactors.
- Establish renderer and event contracts: data roles, deterministic testids, and strict event ordering at boundaries.
- Harden settings: sanitize before/after merges, sync native attributes only for `type="number"`, and gate native `change` to prevent intermediate values from leaking.

Highlights
- Proactive boundary prevention: spin cannot start at min/max; single steps at a boundary are no‑ops; boundary events fire before display changes when applicable.
- Deterministic testing: predictable `data-testid` derivations across renderers eliminate fragile selectors.
- Extensibility: renderers build DOM and call `core.attachUpEvents/attachDownEvents`; the wrapper only bridges commands and events.

Results
- Faster iteration on framework support (Bootstrap 3/4/5, Tailwind) with zero changes to core logic.
- Reduced coupling and clearer ownership of responsibilities; simpler teardown paths.
- Safer updates: Playwright tests validate real browser behavior rather than implementation details.

Takeaways
- Behavior‑first tests make architectural rewrites feasible.
- Clear contracts (data roles, testids, events) enable independent evolution of core and renderers.
- Avoid line‑count comparisons; documentation and separation create healthier code over time.

