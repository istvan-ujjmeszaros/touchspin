Bootstrap TouchSpin — Implementation Checklist (Package Split Roadmap)

Scope: Actionable steps to implement the multi‑package split while preserving backward compatibility. Complements `TODO_HIGHLEVEL.md` (goals).

Maintenance: Keep these checkboxes accurate after each small step — update `[ ]` (pending), `[~]` (in progress), `[x]` (done) immediately as progress is made. Do not batch updates.

Phase 0 — Baseline and Naming (no behavior change)
- [x] Emit preview alias filenames in dist: `touchspin.jquery.bs{3,4,5}.js`, `touchspin.jquery.tailwind.js`.
- [x] Add ESM alias `dist/esm/touchspin-core.js`.
- [x] Document wrapper control via `APPEND_WRAPPERS` and new filenames in README.
- [x] Snapshot current plugin to `packages/core/src/TouchSpinCore.migrated.js` for iterative cleanup.

Phase A — Extract Core (packages/core)
- [x] A1: Create `@touchspin/core` structure:
  - [x] `packages/core/package.json` with exports, `type: module`, `sideEffects: false`.
  - [x] `packages/core/src/index.js` exporting the public Core API.
- [x] A2: From `TouchSpinCore.migrated.js`, remove UMD/AMD and jQuery plugin registration. Export a Core class/function.
- [x] A3: Define a renderer interface compatible with current renderers (init/build/enhance/elements). Document in code.
 - [x] A3.1: Enable TS static checking for core (add `packages/core/tsconfig.json` with `checkJs`/`allowJs`, no emit).
- [x] A4: Move value pipeline and state intact: `_nextValue`, `_forcestepdivisibility`, `_alignToStep`, `_checkValue`, `_setDisplay`, ARIA/attribute sync.
- [x] A5: Replace residual jQuery usages in core with native APIs (renderers remain jQuery‑based for now).
- [x] A6: Provide a minimal internal emitter that wrappers can bridge to jQuery events.
- [x] A7: Build ESM for core (dist/esm) and export public API with method parity (`upOnce`, `downOnce`, `startUpSpin`, `stopSpin`, `updateSettings`, `getValue`, `setValue`, `destroy`).
- [x] A8: Smoke test core via a tiny harness; wire temporary adapter so current UMD plugin can delegate for verification.

Phase B — Extract Renderers (packages/renderers)
- [x] B1: Create packages:
  - [x] `@touchspin/renderer-bootstrap5`
  - [x] `@touchspin/renderer-bootstrap4`
  - [x] `@touchspin/renderer-bootstrap3`
  - [x] `@touchspin/renderer-tailwind`
 - [x] B2: Move `src/renderers/*` code into packages, preserving markup/classes and behavior.
  - [x] B2.1: Bootstrap 5 renderer migrated (transitional copy).
  - [x] B2.2: Bootstrap 4 renderer migrated.
  - [x] B2.3: Bootstrap 3 renderer migrated.
  - [x] B2.4: Tailwind renderer migrated.
- [x] B3: Expose a consistent factory or named export; document `getFrameworkId()`.
 - [x] B4: Update the build to consume renderer packages when producing UMD variants.

Phase C — jQuery Plugin Wrapper (packages/jquery-plugin)
- [x] C1: Implement `@touchspin/jquery-plugin` that registers `$.fn.TouchSpin`, delegating to the core (via migrated initializer).
- [x] C2: Preserve Command API and callable event emissions (leverages migrated initializer triggering semantics).
- [x] C3: Keep modern facade appended (build default still appends `modern-facade`).
- [x] C4: Update build pipeline to bundle wrapper + selected renderer into UMD outputs (guarded by `USE_JQUERY_WRAPPER=true`).
 - [x] C5: Verification
   - [x] C5a: Manual pages parity verified (core + jQuery smoke pages)
   - [x] C5b: All non-visual tests pass across builds (TDD Complete: 10/10 tests passing)
     - [x] C5c: Core modernization implementation completed
    - [x] C5c.1: Core DOM event handling implementation (data attribute targeting)
    - [x] C5c.2: jQuery wrapper callable event forwarding only (no DOM logic)  
    - [x] C5c.3: Renderer data attribute requirements (data-touchspin-injected)
    - [x] C5c.4: Element-attached architecture (TouchSpin() stores instances on DOM elements)
    - [x] C5c.5: Simplified lifecycle management (destroy() removes instance from element)
    - [x] C5c.6: Clean test files created (core-smoke-simple.html, jquery-wrapper-simple.html)
  - [ ] C5d: Full existing test suite (242 tests) passes against modern packages

Parity Audit — Match Core/Wrapper to Source (src/jquery.bootstrap-touchspin.js)

Note: The original `src/jquery.bootstrap-touchspin.js` is the behavioral source of truth. All current and upcoming implementations must mirror its semantics unless an intentional deviation is documented and justified.

- [x] P0: Add policy note to PRs: link to src lines when porting behavior.

- Initialization & Destroy
- [x] P1: Init parity: event order, ARIA init, initial display, renderer defaults.
- [x] P2: Destroy parity: timers cleared, DOM restored, data/events removed.

- Method Parity (Core behaviors)
- [x] P3: upOnce — clamp, min/max events, change event, boundary auto-stop.
- [x] P4: downOnce — clamp, min/max events, change event, boundary auto-stop.
- [x] P5: startUpSpin — immediate step, delay/interval, spincount, event order.
- [x] P6: startDownSpin — immediate step, delay/interval, spincount, event order.
- [x] P7: stopSpin — stopup/stopdown then stopspin, reset state.
- [x] P8: updateSettings — align min/max to step, ARIA sync, display sanitize.
- [x] P9: getValue/setValue — callbacks pre/post, disabled/readonly guards, change event.
- [x] P10: Value pipeline — forcestepdivisibility (round/floor/ceil/none), alignToStep, decimals.
- [x] P11: Booster — boostat growth, maxboostedstep clamp + grid alignment.
- [x] P12: Boundary — auto-stop on reaching min/max during spin.

- Modern Architecture Event Handling
- [x] P13: Core DOM event targeting — attach listeners via data-touchspin-injected attributes only.
- [x] P14: Renderer data attributes — all renderers add required data-touchspin-injected markup.
- [x] P15: jQuery wrapper isolation — forwards only callable events, no DOM event logic.
- [x] P16: Data attribute strategy — no class name dependencies for event targeting.

- Legacy Wrapper Interaction Parity  
- [x] P17: Hold-to-spin — mousedown/touchstart once+start; mouseup/touchend/mouseleave stop.
- [x] P18: Keyboard — ArrowUp/Down once+auto; Enter sanitizes; stop on keyup.
- [x] P19: Mousewheel — single step on focus; change event only.
- [x] P20: Attribute sync — observe disabled/readonly/min/max/step; stop spin and update settings; default step=1 if removed.
- [x] P21: Callable events — touchspin.uponce/downonce/startupspin/startdownspin/stopspin map correctly.
- [x] P22: Renderer updates — prefix/postfix text and classes update on settings changes.

- Verification
- [x] P23: A/B harness — scripted sequences comparing src vs wrapper/core for values and event order.
  - [x] P23a: Manual A/B compare page added (`__tests__/html-package/ab-compare.html`).
  - [x] P23b: Automated A/B parity tests (`abCompare.test.ts`, `abParitySequences.test.ts`).
- [x] P24: Extend Playwright — tests for start/stop sequencing, keyboard, wheel, attribute sync.

TestIDs — Advanced Container Behavior
- [~] TID1: Preserve existing wrapper `data-testid` on advanced containers during init
- [ ] TID2: If wrapper lacks `data-testid` and input has one, set wrapper to `<input-testid>-wrapper`

Phase D — Framework Wrappers (optional deliverables after core split)
- [ ] D1: Web Component (`@touchspin/webcomponent`): custom element; attributes map to options; emit DOM `CustomEvent`s.
- [ ] D2: React (`@touchspin/react`): functional component; props map to options; effects manage lifecycle; expose ref methods.
- [ ] D3: Angular (`@touchspin/angular`): component/directive; Inputs/Outputs; module packaging.
- [ ] D4: Examples and usage snippets for each wrapper.

Phase E — Workspaces, CI, Build, Release
- [x] E1: Enable npm workspaces in root `package.json`; wire scripts for per‑package builds.
- [x] E2: Replace Vite with Rollup in `build.mjs` (use Rollup JS API for UMD + ESM builds; keep Babel/Terser/CSS steps).
- [~] E3: Update `build.mjs` to integrate modern packages (build system should work for both original and modern approaches). `check-build-integrity.mjs` will automatically work once build.mjs is updated since it just runs the same build process.
- [ ] E4: Versioning and publishing strategy (scoped packages), dry‑run publish, access tokens.
- [ ] E5: GitHub Actions: matrix build/test/publish per package.
- [x] E6: Remove Vite dependencies and scripts (`dev`/`preview`), delete `vite.config.js`.
- [x] E7: Update docs (README/CHANGELOG/AGENT.md/CLAUDE.md) to describe Rollup‑based build and remove Vite references.

Phase F — Docs and Migration
- [ ] F1: Package READMEs with install/usage/migration notes.
- [ ] F2: Main README update with new names and packages; migration guide from jQuery plugin → wrappers.
- [ ] F3: Website/docs updates; examples for each renderer and wrapper.

Acceptance & Rollout
- [ ] Tests green at each phase
- [x] Manual pages parity verified (core, jQuery, Tailwind renderer)
- [ ] Keep legacy filenames as aliases until a major release can drop them.
- [ ] Beta release of `@touchspin/core` + jQuery wrapper before flipping default consumption.
