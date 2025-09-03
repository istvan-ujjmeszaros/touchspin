# TouchSpin v4 (Legacy) vs v5 (Modular) — Methods And Behavior

Scope
- Legacy: `src/jquery.bootstrap-touchspin.js` (monolithic jQuery plugin)
- Modern: `packages/core/src/index.js` (framework‑agnostic core), `packages/jquery-plugin/src/index.js` (wrapper), and renderers under `packages/renderers/*`

Legend
- [Legacy] — legacy plugin method or concept
- [Core] — modern core method
- [Wrapper] — jQuery wrapper forwarding
- [Renderer] — framework DOM builder (Bootstrap 3/4/5, Tailwind)

1) Initialization / Instance Lifecycle
- [Legacy] `$.fn.TouchSpin(options)`
  - Command branch: strings like `destroy|upOnce|downOnce|startUpSpin|startDownSpin|stopSpin|updateSettings|get|set`
  - Init branch:
    - Parse data attributes and native attributes (min/max/step precedence).
    - Build DOM via renderer: `_buildHtml()` → `renderer.buildInputGroup()` or `.buildAdvancedInputGroup()`.
    - Cache elements: `_initElements()` and cache up/down buttons.
    - Attach DOM listeners (buttons, input change/blur, keyboard, wheel).
    - MutationObserver for disabled/readonly and min/max/step sync.
    - Store internal API on jQuery element: `$el.data('touchspinInternal', api)`.

- [Core] `TouchSpin(inputEl, opts?)`
  - Returns public API; stores core instance on `inputEl._touchSpinCore`.
  - If options provided: destroy existing, create new, `renderer.init()`, `core.initDOMEventHandling()`.
  - If no options and instance exists: return existing API.
  - Input management (ARIA/native attr, value sanitization) is inside core.

- Key differences
  - Legacy stores instance in jQuery `.data()`; Core stores on the element (no jQuery coupling).
  - Legacy attaches DOM listeners directly in plugin; Core exposes `attachUpEvents/attachDownEvents` and renderers call them.
  - Modern has an explicit `registerTeardown` hook that the wrapper uses to clean its event bridges.

2) Value Access / Mutation
- [Legacy] `getValue()` / `setValue(v)` (internal API exposed via command strings)
  - `getValue()`: parse via `callback_before_calculation`, `parseFloat`, return numeric or NaN.
  - `setValue(v)`: clamp to min/max + step divisibility; format via `callback_after_calculation`; update input; emit change.

- [Core] `getValue()` / `setValue(v)`
  - Same responsibilities, with `_applyConstraints()` and `_forcestepdivisibility()` normalization.
  - Calls `_setDisplay()` which updates ARIA and dispatches native `change` when needed.

- Key differences
  - Core centralizes formatting and ARIA sync; legacy has scattered helpers.
  - Core applies a configurable `forcestepdivisibility` consistently; legacy matches behavior via renderer/plugins.

3) Single Step / Spinning
- [Legacy]
  - `upOnce()` / `downOnce()` — compute next value using booster logic and constraints; update display; emit boundary events at edges; stop spin at boundary.
  - `startUpSpin()` / `startDownSpin()` — set direction, emit `startspin` + directional start, delay via `stepintervaldelay`, then interval via `stepinterval` stepping; stop at boundary or on `stopSpin()`.
  - `stopSpin()` — clear timers; emit `stopupspin`/`stopdownspin` + `stopspin` when appropriate.

- [Core]
  - Same set of methods with the same event semantics; step booster logic via `_getBoostedStep()` / `_nextValue()`; boundary events emitted before display when hitting min/max; stop spin on boundary.
  - Directional start semantics: `emit('startspin')` then `emit('startupspin'|'startdownspin')`.

- Key differences
  - Core avoids attaching any DOM listeners to buttons directly; renderers attach via `core.attachUpEvents/attachDownEvents`.
  - Core stops spinning immediately at boundary and prevents starting spins from a boundary value.

4) Settings Updates / Attribute Sync
- [Legacy] `updateSettings(newsettings)`
  - Merge and sanitize; refresh prefix/postfix via renderer; realign min/max to step; update ARIA and native attributes; hide empty prefix/postfix.

- [Core] `updateSettings(opts)`
  - Sanitizes both partial and merged settings (step>0, decimals>=0, min/max null logic, delay/interval non‑negative).
  - Realigns bounds to step; notifies setting observers; resyncs native attributes (only for `type=number`).

- Key differences
  - Core provides `observeSetting` to renderers for reactive updates.
  - Sanitization runs pre‑merge (partial) and post‑merge (full) to avoid spurious observer signals.

5) ARIA + Native Attribute Handling
- [Legacy] `_initAriaAttributes()` / `_updateAriaAttributes()` and `_syncNativeAttributes()`
- [Core] `_updateAriaAttributes()` / `_syncNativeAttributes()`
  - Core updates `aria-valuenow`, `aria-valuetext` on every display change; syncs min/max/step to native attributes only when `type="number"` to preserve browser behavior.

6) Events
- [Legacy] jQuery triggers:
  - `touchspin.on.min`, `touchspin.on.max`, `touchspin.on.startspin`, `touchspin.on.stopspin`, `touchspin.on.startupspin`, `touchspin.on.startdownspin`, `touchspin.on.stopupspin`, `touchspin.on.stopdownspin`.
  - Also triggers native `change` on value changes.

- [Core]
  - Emits the same event names (via wrapper mapping) from internal `core.emit()` events.
  - Dispatches native `change` event from `_setDisplay()`.

7) jQuery Wrapper (v5 only)
- Command API parity with legacy strings; forwards to core public API.
- Bridges core events to jQuery via `evMap` subscription; cleans up on destroy via `registerTeardown`.
- Handles `.trigger('blur')` compatibility by invoking core `_checkValue(true)`.

8) Renderers
- [Legacy] Renderer is selected internally; returns jQuery elements; plugin binds events directly.
- [Modern] Each renderer class (Bootstrap3/4/5, Tailwind) builds DOM and calls `attachUpEvents/attachDownEvents`. TestIDs are added to wrapper/buttons/prefix/postfix.

Summary of Notable Behavioral Diff Fixes (observed in tests)
- Core sanitizes `step<=0`, invalid decimals, and `min/max` nulls consistently.
- Core stops spins immediately at boundary and avoids starting spins at boundary values.
- Native attribute sync limited to `type="number"` for browser parity.
- Event ordering matches legacy (min/max events before change at boundary).

