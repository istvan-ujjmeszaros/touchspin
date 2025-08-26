# De‑jQuery Strategy (Single Source of Truth; No‑Rewrite)

Context and guardrails
- Single source: keep `src/jquery.bootstrap-touchspin.js` as truth. No rewrite.
- Preserve public API: jQuery plugin, callable events, command API, DOM structure, and CSS hooks remain identical.
- Modern facade remains: `Element.prototype.TouchSpin` and `window.TouchSpin.attach` backed by the same internals.
- Emit `change` only when display text actually changes; keep step alignment, booster timing, and clamping semantics; keep ARIA logic (valuetext formatting; effective step‑aligned min/max).

## Themes and Phases

1) Events + Timers
- Objective: Replace internal jQuery event binding with native listeners and a small internal event helper while preserving jQuery custom event emissions and timing.
- Changes:
  - Introduce internal helpers: `on(el,type,fn,opts)`, `offAll()` tracked list; `emit(name, detail)` dispatches both `jQuery.trigger(name, ...)` and a bubbling `CustomEvent(name)` on the input for non‑jQuery consumers.
  - Convert internal bindings in `_bindEvents()` from `originalinput.on(...)`, `elements.up/down.on(...)`, `container.on(...)` to native `addEventListener` on `input`, `up`, `down`, and `container` elements.
  - Keep emission sites as is but behind `emit(...)`: `touchspin.on.*`, command events, and change emission.
  - Centralize spin control: keep `_startSpin`, `_clearSpinTimers`, `stopSpin()` intact; no timing semantics change.
- jQuery APIs to replace: `.on/.off` on input/buttons/container; handler namespaces; `mousewheel/DOMMouseScroll/wheel` multi‑event binding.
- How (behind boundaries): Only touch `_bindEvents()` and `stopSpin()` teardown; do not change method surfaces (`upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `updateSettings`, `getValue`, `setValue`, `destroy`).
- Risks: wheel delta normalization, key repeat parity, focusout target semantics, handler removal on destroy, duplicate emission if both jQuery and native handlers run; event order of `startupspin` vs `startspin`.
- Validation:
  - Non‑visual: `events.test.ts`, `keyboardAccessibility.test.ts`, `advancedFeatures.test.ts` (spin behavior), `customEvents.test.ts` (jQuery listeners still OK), `focusout-behavior.test.ts`.
 - Manual: `__tests__/html/destroy-test-bridge.html` and `destroy-test-esm.html` for spin start/stop, keyboard, wheel.
- Exit criteria/checkpoint: All tests pass; manual parity good; tag `LGTM-3`, then `npm run build` and commit `dist/`.

1.5) Bridge + Packaging (no behavior change)
- Objective: Establish packaging and bridging that enable multiple distributables (UMD jQuery, ESM core, future ESM jQuery wrapper) without changing runtime behavior.
- Changes:
  - Keep `src/jquery.bootstrap-touchspin.js` as truth; continue shipping versioned UMD builds (BS3/4/5/Tailwind).
  - Keep modern facade available (`window.TouchSpin.attach` and `Element.prototype.TouchSpin`).
  - Clarify `src/jquery.bootstrap-touchspin.esm.js` is a dev‑only twin loader used by manual ESM page; exclude/override in ESLint, or add a file override directive to avoid lint noise.
  - Maintain `src/core/TouchSpinCore.js` as an extraction target. Do not wire yet; build as `dist/esm/touchspin.js` (experimental) for wrapper spikes and early adopters.
  - Keep `src/wrappers/jquery.js` (scaffold) to demonstrate event→method bridging when core becomes authoritative. Keep out of UMD pipeline for now.
- Risks: Confusion about which ESM to consume; lint warnings on `import.meta`; accidental duplication of APIs.
- Validation: No tests change; document outputs and dev usage in README/WORKLOG.
- Exit criteria/checkpoint: Docs updated; tag `LGTM-3.1` (docs/packaging only).

2) DOM + Attributes
- Objective: Replace internal jQuery DOM/attr/value/class usage with native APIs, keeping renderer jQuery‑based for now.
- Changes:
  - Add dual handles: `const el = originalinput[0]`, `const upEl = elements.up[0]`, `const downEl = elements.down[0]`, `const containerEl = container[0]`.
  - Replace internal reads/writes: `.val()` → `el.value`; `.attr/removeAttr` → `setAttribute/removeAttribute`; `.prop('disabled')` → `el.disabled`; `.is(':disabled,[readonly]')` → `el.disabled || el.readOnly`; `.addClass/removeClass/hasClass` → `classList` in core; keep renderer code intact.
  - Replace sibling removal on destroy: use `parentElement.querySelectorAll('[data-touchspin-injected]')` and remove nodes; unwrap with `parentElement.replaceWith(el)` for injected wrapper path.
  - Keep jQuery data mirroring for public contract; introduce a private `WeakMap<Element, Instance>` as the core store; keep `$(el).data('touchspin')` and `data('touchspinInternal')` in sync.
- jQuery APIs to replace: `.val`, `.attr`, `.removeAttr`, `.prop`, `.addClass/removeClass/hasClass`, `.siblings`, `.unwrap`, `.parent`, `.find` (in core only), `.is` checks; `$.extend` → `Object.assign`.
- How: Limit changes to core helpers (`_setDisplay`, `_initAriaAttributes`, `_updateAriaAttributes`, `_syncNativeAttributes`, `_syncSettingsFromNativeAttributes`, `_destroy`, `_buildHtml` value write) and state helpers; do not change renderers.
- Risks: attribute precedence with native number inputs, unwrap edge cases, `data-testid` propagation, classList parity with renderer expectations.
- Validation:
  - Non‑visual: `nativeAttributeSync.test.ts`, `testidPropagation.test.ts`, `rendererErrors.test.ts`, `destroyAndReinitialize.test.ts`.
  - Manual: bridge page destroy/reinit; visually confirm wrappers persist/remove correctly.
- Exit criteria/checkpoint: All tests green; tag `LGTM-4`, then build/commit `dist/`.

3) Value Pipeline + ARIA
- Objective: Ensure all paths route through `_nextValue` → `_forcestepdivisibility` → `_alignToStep` (for bounds alignment) → `_checkValue(true)` → `_setDisplay` → `_updateAriaAttributes`; emit `change` only on display change.
- Changes:
  - Keep `_setDisplay` as the single write point; ensure `setValue`, `upOnce`, `downOnce`, focusout/Enter, wheel and button paths all use it and rely on the same `change` emission rule.
  - Ensure ARIA effective bounds reflect step‑aligned min/max whenever `step|min|max` change (already implemented); keep `aria-valuetext` equal to formatted display string.
- jQuery APIs to replace: `$.extend` in `_updateSettings` and `_syncSettingsFromNativeAttributes`; `.val`, `.attr/removeAttr` usages already covered by Theme 2.
- Risks: double‑change on sanitize, precision with decimals and large steps, booster rounding.
- Validation:
  - Non‑visual: `aria-sync.test.ts`, `events.test.ts` change counting, `settingsPrecedence.test.ts`, `targetedCoverage.test.ts` decimals/min/max.
  - Manual: free‑form typing → Tab; Enter to commit; verify a single change, correct formatting.
- Exit criteria/checkpoint: No change count regressions; aria snapshots match expectations; tag `LGTM-5`, then build/commit `dist/`.

4) Facade + Command API plumbing
- Objective: Keep all surfaces stable and backed by one internal instance; ensure jQuery command API and modern facade are thin veneers.
- Changes:
  - Keep `$(el).TouchSpin('get'|'set'|...)` mapping to `data('touchspinInternal')` methods; ensure mirror stays consistent if WeakMap is introduced.
  - Maintain `$(el).data('touchspin')` facade for legacy direct calls; keep modern `Element.prototype.TouchSpin` returning the same method map.
- jQuery APIs to replace: `.data` reads/writes can mirror native store; keep `.trigger` for public events.
- Risks: drift between mirrors, destroy cleanup ordering.
- Validation: `apiMethods.test.ts`, `destroyAndReinitialize.test.ts`, bridge pages.
- Exit criteria/checkpoint: Surfaces unchanged; tag `LGTM-6`, then build/commit `dist/`.

Deferred (post‑migration)
- Renderer de‑jQuery: convert renderers to native while preserving generated markup; separate task with visual tests.
- Advanced a11y: revisit role/valuenow policies and screen‑reader audits.

## Backlog by Area (exact replacements)

- Events: `.on/.off/.trigger` → `addEventListener/removeEventListener` (internal) + `CustomEvent` via `emit()`; keep `jQuery.trigger(...)` for compatibility. Targets and sites:
  - Input: keydown/keyup, wheel, custom `touchspin.*` bindings in `_bindEvents()` and `_bindEventsInterface()` (src/jquery.bootstrap-touchspin.js: 832–1069)
  - Buttons: `mousedown/mouseup/mouseout`, `touchstart/touchend/touchleave/touchcancel/touchmove` (lines ~887–1010)
  - Container: `focusout` handling (lines ~867–880)
  - Teardown: replace `originalinput.off(...)` and `container.off('.touchspin')` with `offAll()` (lines ~616–623)

- DOM: `.val`, `.attr/removeAttr`, `.prop`, `.addClass/removeClass/hasClass`, `.siblings`, `.unwrap`, `.parent`, `.find`, `.is` in core only:
  - Value writes: `_setDisplay`, `_setInitval`, `_checkValue`, `setValue` helper (lines ~393–466, 1129–1183)
  - ARIA: `_initAriaAttributes`, `_updateAriaAttributes` (lines ~752–810)
  - Native sync: `_syncNativeAttributes`, `_syncSettingsFromNativeAttributes` (lines ~1192–1294)
  - Destroy: injected siblings removal and unwrap (lines ~610–643)

- Data/attrs: `$.extend` → `Object.assign` in `_initSettings`, `_updateSettings`, `_syncSettingsFromNativeAttributes`; `.data('touchspin*')` mirrored to WeakMap store.

- Value pipeline: keep `_nextValue`, `_forcestepdivisibility`, `_alignToStep`, `_checkValue`, `_setDisplay` as single route; confirm all callers use them (already mostly true).

## Minimal Test Additions

- If adding `emit()` dual‑dispatch: add one non‑visual test asserting a native `CustomEvent('touchspin.on.startspin')` is received on the input in addition to jQuery listeners. Skip if not implementing DOM events yet.
- Otherwise, no new tests initially; rely on existing coverage for change counts, ARIA sync, and spin timing.

## Rollback Plan

- Tag at every theme exit: `LGTM-3` (Events+Timers), `LGTM-4` (DOM+Attrs), `LGTM-5` (Value+ARIA), `LGTM-6` (Facade plumbing).
- At each tag: run `npm run build`, commit updated `dist/`, push tag. CI verifies build integrity against committed `dist/`.
- Revert on regression: `git reset --hard <last-good-tag>` (or `git revert` the theme PR); rebuild to keep `dist/` consistent with sources.

## Current Sprint (resume here)
- Focus next: Theme 1 — prepare `emit()/on()/offAll()` helpers and migrate `_bindEvents` to native listeners while keeping all jQuery `trigger(...)` emissions untouched.
- After migration, verify `events.test.ts`, `keyboardAccessibility.test.ts`, `focusout-behavior.test.ts`, `customEvents.test.ts` locally. If green, tag `LGTM-3`, build, and commit `dist/`.

Notes
- Tests load from `src/` (not `dist/`). Do not rebuild on every change; only at checkpoints or before pushing.
- CI-only: do not run `npm run check-build-integrity` locally.
