# Case Study: Refactoring Bootstrap TouchSpin into a Modular, Behavior‑Driven Architecture

Context
The v4.x “in‑between” TouchSpin was a capable but monolithic jQuery plugin. It bundled rendering, input handling, event orchestration, and state management into one file. Adding frameworks (Bootstrap 3/4/5, Tailwind) and evolving behavior meant threading changes through tightly coupled code.

Goals
- Separate concerns without changing user‑visible behavior.
- Support multiple frameworks via pluggable renderers.
- Make event timing and boundary behavior explicit and testable.
- Keep tests end‑to‑end (Playwright) to validate outcomes, not internals.

Architecture
- Core (framework‑agnostic): Implements state, math, constraints, timers, ARIA, native attribute sync, and event emission. Exposes a public API and `observeSetting` for reactive updates.
- jQuery wrapper (bridge only): Installs `$.fn.TouchSpin`, forwards commands, re‑emits core events as jQuery events, and registers teardown. Holds no DOM event logic.
- Renderers (presentation): Build DOM for each framework, assign `data-touchspin-injected` roles and deterministic testids, and call `core.attachUpEvents/attachDownEvents`. Handle teardown cleanly.

Behavioral Guarantees
- Proactive boundary prevention: Holding cannot begin at min/max; single steps at a boundary do nothing. When a step hits the exact bound, `min|max` fire before the display change and the hold stops.
- Sanitization gates `change`: Native `change` is intercepted in the capture phase to suppress intermediate values. Blur/Enter sanitation emits a final native `change` only when the display truly changes.
- Boosted stepping: `2^⌊spincount/boostat⌋ * step` with optional `maxboostedstep` capping and grid alignment.
- Native sync scoped: min/max/step synced only when `type="number"` to avoid browser side effects on text inputs.

Contracts That Unlocked Velocity
- Data roles: renderers mark wrapper/buttons/prefix/postfix so core targets elements without CSS selectors.
- TestIDs: given `data-testid="qty"` on the input, TouchSpin derives `qty-wrapper`, `qty-up`, `qty-down`, etc., enabling robust end‑to‑end selectors.
- Event matrix: one‑to‑one mapping from core to jQuery events (e.g., `min → touchspin.on.min`), with documented ordering.

Testing Strategy (Intentionally E2E Only)
Unit tests lock in implementation details and slow down architectural rewrites. We chose Playwright exclusively:
- Tests exercise initialization, stepping/holding, boundary cases, and teardown across renderers.
- The `npm run inspect` utility auto‑starts the dev server and reports console, page, and network errors plus TouchSpin init status.
- Deterministic testids remove flakiness stemming from DOM traversal differences between frameworks.

Key Challenges and Solutions
- Mixed concerns in v4.x: We extracted DOM responsibilities into renderers and attached button events through `core.attachUpEvents/attachDownEvents`.
- Boundary semantics drifted across historical versions: We documented, stabilized, and tested the modern rules (preventive checks and ordering of `min|max`).
- Native attributes vs. display logic: We limited attribute sync to `type="number"` and kept display formatting consistent with `forcestepdivisibility` modes.

Outcomes
- Faster framework support and safer iterations: core logic remains unchanged across renderers.
- Cleaner teardown and fewer leaks: renderers remove injected nodes; the wrapper unregisters its bridges; the core clears timers and observers.
- Developer onboarding improved: clear contracts, diagrams, and behavior‑first tests.

Lessons Learned
- Behavior‑driven tests empower refactors: measure what users see, not how it’s built.
- Contracts are architecture: data roles, event ordering, and testid derivation reduce coupling and ambiguity.
- Don’t optimize for line counts: documentation and modularity are durable advantages.

