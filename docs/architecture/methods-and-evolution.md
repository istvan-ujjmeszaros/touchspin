# Methods and Evolution — v4 (In‑Between) → v5 (Modular)

This document consolidates the strongest parts of both prior analyses to explain how methods and behavior changed from the monolithic v4 plugin to the modular v5 architecture, with key context from the TRUE legacy stage where relevant. For the full three‑stage story, see `HISTORY.md`.

Scope
- Stage 2 (In‑Between): `src/jquery.bootstrap-touchspin.js` — monolithic jQuery plugin with command API and internal renderer factory.
- Stage 3 (New Modular): `packages/core/`, `packages/jquery-plugin/`, `packages/renderers/*` — framework‑agnostic core + thin wrapper + pluggable renderers.

Key goals of v5
- Decouple DOM and framework concerns from core logic.
- Make boundary semantics and event ordering explicit and testable.
- Keep behavior stable while enabling new renderers and wrappers.

Initialization and lifecycle
- v4: `$.fn.TouchSpin(optionsOrCommand)`
  - Init merges defaults + data attrs + native attrs + options; builds DOM via internal renderer; binds input/buttons/wheel; sets ARIA; sets up MutationObserver; stores internal API in `$.data('touchspinInternal')`.
  - Commands call internal API by string (e.g., `'uponce'`, `'destroy'`).
- v5: `TouchSpin(inputEl, opts?)` via wrapper or direct
  - Creates/reuses a core instance attached to `inputEl._touchSpinCore`.
  - Renderer builds markup and calls `core.attachUpEvents/attachDownEvents()`.
  - Core sets up input listeners (change capture, blur, key, wheel) and observers.
  - Wrapper only forwards commands and events; no DOM event logic inside wrapper.

Value access and mutation
- getValue: parses input, honors `replacementval`, applies `callback_before_calculation`.
- setValue: applies constraints (min/max, step divisibility), formats value (`callback_after_calculation`), updates display, and emits native change on real change.
- v5 centralizes ARIA sync and native attribute sync in core; v4 had these across helpers.

Single step and spinning
- upOnce/downOnce
  - v4: reactive boundaries (checks for equality with min/max); emits `min|max` when crossing exact boundary; stops hold on boundary.
  - v5: proactive prevention (cannot start a hold at a boundary). When a single step hits a boundary, emits `min|max` BEFORE display update; stops hold immediately.
- startUpSpin/startDownSpin/stopSpin
  - v4 and v5 share delay/interval behavior and booster logic; v5 formalizes event order: `startspin` then direction; then at stop: direction then `stopspin`.

Boosted steps
- Level increases every `boostat` steps under hold.
- Boosted step = `2^level * step`, capped by `maxboostedstep` if provided.
- v5 may align to a reasonable grid on stop after large boosts to minimize residual drift.

Settings updates and sync
- v4: merges new settings; normalizes numbers; realigns bounds when step/min/max change; refreshes prefix/postfix via renderer; syncs native attributes and ARIA.
- v5: sanitizes partial settings before merge and full settings after; notifies observers only on effective changes; realigns bounds; syncs native min/max/step only for `type="number"` inputs.

Input events and sanitization
- v4: sanitizes on blur, Enter, and container focusout; triggers native change if display changed.
- v5: intercepts native `change` in capture when the value would be sanitized; applies sanitization on blur/Enter and dispatches native change only when the final display value differs.

Event matrix and ordering
- Core emits: `min`, `max`, `startspin`, `startupspin`, `startdownspin`, `stopupspin`, `stopdownspin`, `stopspin`, `boostchange`.
- Wrapper re‑emits as jQuery: `touchspin.on.*` with same timing.
- Ordering guarantees:
  - Start: `startspin` → directional start.
  - Boundary: on exact boundary via single step, `min|max` BEFORE display update; holds stop immediately at boundary.
  - Stop: directional stop → `stopspin`.

Storage and coupling
- v4 stored internal API via jQuery `.data()` with maps/flags and remained monolithic.
- v5 attaches core instance directly to the element and decouples framework concerns into renderers; wrapper is a thin bridge only.

Renderer contract
- Renderers build/augment the DOM, add `data-touchspin-injected` roles, and derive consistent testids from `data-testid` (`{id}-wrapper|up|down|prefix|postfix`).
- Renderers call `core.attachUpEvents/attachDownEvents` after building buttons.
- Reactivity via `core.observeSetting` for prefix/postfix and styling changes. Implement `teardown()` for cleanup.

Why it matters
- Clear contracts (roles, testids, event ordering) decouple core and presentation, enabling new frameworks with minimal risk.
- Behavior is verifiable with Playwright E2E tests, which remain the only tests by design.

