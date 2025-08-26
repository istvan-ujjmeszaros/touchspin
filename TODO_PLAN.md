# TouchSpin Modernization Plan (Revised)

Goal: Split the plugin into a framework‑agnostic ESM core and a thin jQuery wrapper. Keep full backward compatibility via the wrapper (including callable events), while enabling direct method calls in the core and future wrappers (React/Vue/Angular/Web Components). Then progressively remove jQuery usage from the core internals.

## ✅ Phase 0: Baseline (Done)
- Visual regression tests and non‑visual tests are green.
- Build integrity workflow active; always commit `dist/` after `npm run build`.

## Phase 1: Build Outputs Split (Core ESM + jQuery Wrapper)
- [x] Create `src/core/TouchSpinCore.js` (ESM scaffold): exports a class with methods: `init`, `destroy`, `updateSettings`, `upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `getValue`, `setValue`. No callable event triggers reside in the core.
- [x] Add `src/wrappers/jquery.js` that registers `$.fn.TouchSpin` and bridges to `TouchSpinCore` instances (scaffold; not yet wired into UMD builds).
- [ ] Preserve callable events in the jQuery wrapper only by mapping triggers to core methods:
  - `touchspin.updatesettings` → `updateSettings(newOptions)`
  - `touchspin.uponce` / `downonce` → `upOnce()` / `downOnce()`
  - `touchspin.startupspin` / `startdownspin` → `startUpSpin()` / `startDownSpin()`
  - `touchspin.stopspin` → `stopSpin()`
- [ ] Expose instance for direct calls via jQuery: `$(input).data('touchspin').upOnce()` (back‑compat + gradual migration).
- [x] Update build to produce:
  - UMD jQuery builds (current filenames, unchanged) for BS3/BS4/BS5/Tailwind.
  - ESM core bundle at `dist/esm/touchspin.js` for modern consumers.

Note: Tests currently reference `src/jquery.bootstrap-touchspin.js` as a classic script in HTML fixtures. Converting that file itself to ESM would defer execution and break inline initializers. We will introduce a new ESM entry (wrapper around the core) and migrate fixtures to `type="module"` in a later phase before flipping the source file over.

## Phase 2: Core API and Adapter Design
- [ ] Define renderer‑agnostic DOM adapter interface used by core (query, create, add/remove, events, class ops).
- [ ] Keep existing renderers but allow injection of a minimal adapter:
  - ESM core provides a native DOM adapter.
  - jQuery wrapper provides a jQuery adapter (shim) to keep behavior identical.
- [ ] Stabilize public ESM API (JSDoc + d.ts) and error semantics (sync methods, thrown errors).

## Phase 3: Incremental De‑jQuery in Core
- [ ] Move plugin logic from `src/jquery.bootstrap-touchspin.js` into `TouchSpinCore` and replace jQuery usage with native DOM via the adapter.
- [ ] Keep renderers working by using adapter operations only (no `$` inside core).
- [ ] Maintain data‑attributes and current DOM structure so visual tests remain stable.

## Phase 4: Wrapper Bridge and Backward Compatibility
- [ ] Preserve all callable jQuery events exactly as today (no deprecation, same names/semantics) in the jQuery wrapper layer: `touchspin.updatesettings`, `touchspin.uponce`, `touchspin.downonce`, `touchspin.startupspin`, `touchspin.startdownspin`, `touchspin.stopspin`. The core does not listen for or act on these triggers directly.
- [ ] Emit DOM CustomEvents from core for modern integrations (`touchspin:init`, `:change`, `:min`, `:max`, `:destroy`, `:update`) without affecting jQuery behavior.
- [ ] Document direct method calls as an additional option (ESM/core) while keeping event triggers first‑class in the jQuery wrapper.

## Phase 5: Tests and Coverage
- [ ] Add a minimal ESM usage test page (no jQuery) and parallel Playwright tests.
- [ ] Keep all existing tests passing under jQuery wrapper.
- [ ] Expand tests to assert direct method calls on the instance (no event triggers).

### 5.1 Incremental Bridging Workflow (One event/method at a time)
- Order: `uponce` → `downonce` → `stopspin` → `startupspin` → `startdownspin` → `updatesettings`.
- For each item:
  1) Implement wrapper bridge: translate jQuery trigger to the new instance method (no change in event name/args).
  2) Add instance facade on the element (e.g., `$(input).data('touchspin')`) exposing the method.
  3) Initially, the method may call through to the existing behavior (e.g., simulate button click or re‑trigger event) to avoid large refactors.
  4) Run tests: `npm test` (non‑visual) → if green, run `npm run test:visual` and update snapshots if needed.
  5) Refactor the internal logic behind that method to use core/adapter (no jQuery) while keeping DOM and events stable.
  6) Build and commit dist: `npm run build` and commit updated `dist/`.

Done criteria per event
- All existing tests pass unchanged (no jQuery API changes).
- New direct method is available via the instance facade and behaves identically.
- No HTML structure changes (visual diffs clean or acknowledged). 

## Phase 6: Build/Repo Tasks
- [ ] Update `build.mjs` to emit ESM outputs alongside current UMD variants.
- [ ] Update integrity check to include ESM outputs.
- [ ] Ensure `npm run build` is required before push (CI enforces dist integrity).

## Phase 7: Docs and Migration
- [ ] New “Core (ESM) API” docs with examples:
  - Import + instantiate, direct methods, events, cleanup.
  - Renderer selection and usage.
- [ ] jQuery wrapper docs (legacy + deprecation notes; mapping table events → methods).
- [ ] Migration guide: “From events to methods”, “From jQuery to ESM”.

## Future (Optional Wrappers)
- [ ] Publish thin wrappers for React/Vue/Angular/Web Components that delegate to the core and expose idiomatic bindings (props/events/refs).

## Success Criteria
- Core ships as ESM with no hard jQuery dependency.
- jQuery wrapper preserves existing API and callable events (with deprecation guidance).
- All current tests pass; new ESM tests added; visuals unchanged.
- Build produces both UMD (jQuery) and ESM (core) and CI integrity checks include both.
