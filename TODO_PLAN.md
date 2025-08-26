# TouchSpin Modernization Plan (Revised)

Goal (revised): Keep `src/jquery.bootstrap-touchspin.js` as the single source of truth and avoid a rewrite. Expose a stable public instance API directly from the existing plugin (via jQuery command API and a small facade), while we gradually decouple internals behind that API. Maintain full backward compatibility (callable events and DOM structure). An ESM twin loader is available for module consumers.

## ✅ Phase 0: Baseline (Done)
- Visual regression tests and non‑visual tests are green.
- Build integrity workflow active; always commit `dist/` after `npm run build`.

## Phase 1: Public API + ESM Entry
- [x] Create `src/core/TouchSpinCore.js` (ESM scaffold): exports a class with methods: `init`, `destroy`, `updateSettings`, `upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `getValue`, `setValue`. No callable event triggers reside in the core.
- [x] Add `src/wrappers/jquery.js` that registers `$.fn.TouchSpin` and bridges to `TouchSpinCore` instances (scaffold; not yet wired into UMD builds).
- [ ] Preserve callable events while also supporting direct method calls through the command API/facade:
  - `touchspin.updatesettings` → `updateSettings(newOptions)`
  - `touchspin.uponce` / `downonce` → `upOnce()` / `downOnce()`
  - `touchspin.startupspin` / `startdownspin` → `startUpSpin()` / `startDownSpin()`
  - `touchspin.stopspin` → `stopSpin()`
  - `touchspin.destroy` → `destroy()`
- [x] Expose instance for direct calls via jQuery: `$(input).data('touchspin').upOnce()` (back‑compat + gradual migration) — implemented via bridge.
- [x] Update build to produce:
  - UMD jQuery builds (current filenames, unchanged) for BS3/BS4/BS5/Tailwind.
  - ESM twin loader at `src/jquery.bootstrap-touchspin.esm.js` (module entry that registers the classic plugin); separate ESM core remains optional future work.

Note: Tests currently reference `src/jquery.bootstrap-touchspin.js` as a classic script in HTML fixtures. Converting that file itself to ESM would defer execution and break inline initializers. We will introduce a new ESM entry (wrapper around the core) and migrate fixtures to `type="module"` in a later phase before flipping the source file over.

Additional progress in this phase
- [x] Added ESM twin entry `src/jquery.bootstrap-touchspin.esm.js` that registers the classic plugin when jQuery is present (no behavior change).
- [x] Created manual ESM page `__tests__/html/destroy-test-esm.html` to validate initialization/destroy/reinit/vertical flows via `type="module"`.

## Phase 2: Incremental Internals (Optional Core Later)
- [ ] Define renderer‑agnostic DOM adapter interface used by core (query, create, add/remove, events, class ops).
- [ ] Keep existing renderers but allow injection of a minimal adapter:
  - ESM core provides a native DOM adapter.
  - jQuery wrapper provides a jQuery adapter (shim) to keep behavior identical.
- [ ] Stabilize public ESM API (JSDoc + d.ts) and error semantics (sync methods, thrown errors).

## Phase 3: Keep Logic In-Place, Extract Gradually
- [ ] Keep all logic inside `src/jquery.bootstrap-touchspin.js` initially; expose stable methods (`upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `updateSettings`, `getValue`, `setValue`, `destroy`).
- [ ] Apply correctness fixes inside the current source (e.g., `setValue` honors step/decimals/min/max using existing helpers), without structural changes.
- [ ] Only extract portions to a core module when the API surface is stable and proven via pages/tests.

## Phase 4: Wrapper Bridge and Backward Compatibility
- [ ] Preserve all callable jQuery events exactly as today (no deprecation, same names/semantics) in the jQuery wrapper layer: `touchspin.updatesettings`, `touchspin.uponce`, `touchspin.downonce`, `touchspin.startupspin`, `touchspin.startdownspin`, `touchspin.stopspin`. The core does not listen for or act on these triggers directly.
- [ ] Emit DOM CustomEvents from core for modern integrations (`touchspin:init`, `:change`, `:min`, `:max`, `:destroy`, `:update`) without affecting jQuery behavior.
- [ ] Document direct method calls as an additional option (ESM/core) while keeping event triggers first‑class in the jQuery wrapper.

Additional progress in this phase
- [x] Added a lightweight jQuery bridge `src/wrappers/jquery-bridge.js` that attaches an instance facade at `$(input).data('touchspin')` and maps facade methods to current callable events (no internal refactor yet). Includes `destroy`, `upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `updateSettings`.
- [x] Created `__tests__/html/destroy-test-bridge.html` with both legacy event buttons and facade buttons to verify parity. Confirmed working in browser.
- [x] Exposed internal instance methods from the classic plugin at `$(input).data('touchspinInternal')` and updated the bridge to prefer direct method calls with event fallbacks.
  - Facade now also supports `getValue` and `setValue`, with internal implementations in the plugin and safe fallbacks.

## Phase 5: Tests and Coverage
- [x] Add a minimal ESM usage test page (using ESM twin with jQuery present): `__tests__/html/destroy-test-esm.html`.
- [ ] Keep all existing tests passing under jQuery wrapper.
- [ ] Expand tests to assert direct method calls on the instance (no event triggers).
  - [x] Manual parity check via facade on `destroy-test-bridge.html`.
  - [ ] Add automated checks later (Playwright), once method implementation backs the facade.

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
- [x] Update `build.mjs` to emit ESM outputs alongside current UMD variants.
- [x] Update integrity check to include ESM outputs.
- [x] Ensure `npm run build` is required before push (CI enforces dist integrity).

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
