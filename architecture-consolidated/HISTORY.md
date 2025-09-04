# TouchSpin Architecture Evolution (Three Stages)

This document summarizes the three distinct architectural stages of Bootstrap TouchSpin, clarifies terminology, and calls out key behavioral changes. It is the canonical place for historical details; the main `README.md` in this folder focuses on the current architecture and extensibility.

## Stages at a Glance

1) TRUE Legacy (v3.x)
- File: `tmp/jquery.bootstrap-touchspin.legacy.js`
- Traits: original simple jQuery plugin; hardcoded Bootstrap markup; callable events only via `trigger()`; inclusive boundary checks (`value >= max` / `value <= min`).

2) In‑Between (v4.x)
- File: `src/jquery.bootstrap-touchspin.js`
- Traits: monolithic but more capable; added command API (`$(el).TouchSpin('uponce')` etc.) and a renderer system; strict equality boundary checks (`value === max` / `value === min`); WeakMap-like storage patterns; ARIA and MutationObserver added.

3) New Modular (v5.x)
- Location: `packages/core/`, `packages/jquery-plugin/`, `packages/renderers/*`
- Traits: framework‑agnostic core + thin jQuery wrapper + pluggable renderers; proactive boundary prevention; robust settings sanitization; consistent ARIA and native attribute sync; deterministic testids; clean teardown hooks.

Note on line counts: the modern architecture may have more lines due to JSDoc, modular separation, and better organization. Line count is not a quality metric.

## Key Evolution Themes

- API Control
  - TRUE Legacy: callable events only (`trigger('touchspin.uponce')`).
  - In‑Between: command API on the jQuery plugin (`$(el).TouchSpin('uponce')`).
  - New: direct public API object returned by the core (`api.upOnce()` etc.).

- DOM Construction
  - TRUE Legacy: hardcoded templates inside the plugin.
  - In‑Between: renderer factory within the monolith.
  - New: explicit renderer classes (Bootstrap 3/4/5, Tailwind) with clear contracts.

- Boundary Logic
  - TRUE Legacy: inclusive checks (reactive fix after computing).
  - In‑Between: exact equality checks (still reactive fix).
  - New: preventive checks — avoid starting spins at boundaries and stop immediately on reaching them; emit `min|max` before display change when a single step hits the exact bound.

- Storage and Coupling
  - TRUE Legacy: flags in jQuery data/closures.
  - In‑Between: jQuery `.data()` + internal maps; still monolithic.
  - New: instance is attached to the element (no jQuery coupling); wrapper is purely a bridge.

- Accessibility and Attributes
  - TRUE Legacy: minimal ARIA handling.
  - In‑Between: ARIA and MutationObserver introduced.
  - New: consistent `aria-valuenow`/`aria-valuetext`; native min/max/step synced only for `type="number"` inputs.

- Event Semantics
  - Across stages: directional start/stop events exist; ordering and naming become stricter over time.
  - New: stable ordering — startspin then directional start; boundary events before display at exact bounds; directional stop then stopspin.

## Migration Notes (v4 → v5)

- Event timing and names
  - `min|max` fire before display changes on exact bounds; holding stops immediately at bounds.
  - Wrapper re‑emits as `touchspin.on.*` jQuery events; prefer listening to those if you are in jQuery land.

- Settings and sanitization
  - `forcestepdivisibility` is applied consistently in display formatting; physics remain in core math.
  - Partial settings are sanitized pre‑merge; observers fire only on effective changes.

- Native attribute sync
  - min/max/step are synced to the DOM only for `type="number"`. Text inputs are left alone to avoid browser side effects.

- Data attributes and roles
  - Renderers must mark injected elements with `data-touchspin-injected` roles and testids derived from the input’s `data-testid` for reliable testing.

## Testing Strategy

- The repository intentionally uses Playwright end‑to‑end tests and no unit tests. This supports architectural evolution by validating user‑visible behavior across frameworks and renderers.

## References

- TRUE Legacy source: `tmp/jquery.bootstrap-touchspin.legacy.js`
- In‑Between source: `src/jquery.bootstrap-touchspin.js`
- Modular sources: `packages/core/`, `packages/jquery-plugin/`, `packages/renderers/*`
- Prior analyses: `architecture-claude/` (three‑stage deep dive), `architecture-openai/` (in‑between → modular details)

