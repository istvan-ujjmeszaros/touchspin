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
- [ ] A2: From `TouchSpinCore.migrated.js`, remove UMD/AMD and jQuery plugin registration. Export a Core class/function.
- [ ] A3: Define a renderer interface compatible with current renderers (init/build/enhance/elements). Document in code.
- [ ] A4: Move value pipeline and state intact: `_nextValue`, `_forcestepdivisibility`, `_alignToStep`, `_checkValue`, `_setDisplay`, ARIA/attribute sync.
- [ ] A5: Replace residual jQuery usages in core with native APIs (renderers remain jQuery‑based for now).
- [ ] A6: Provide a minimal internal emitter that wrappers can bridge to jQuery events.
- [ ] A7: Build ESM for core (dist/esm) and export public API with method parity (`upOnce`, `downOnce`, `startUpSpin`, `stopSpin`, `updateSettings`, `getValue`, `setValue`, `destroy`).
- [ ] A8: Smoke test core via a tiny harness; wire temporary adapter so current UMD plugin can delegate for verification.

Phase B — Extract Renderers (packages/renderers)
- [ ] B1: Create packages:
  - [ ] `@touchspin/renderer-bootstrap5`
  - [ ] `@touchspin/renderer-bootstrap4`
  - [ ] `@touchspin/renderer-bootstrap3`
  - [ ] `@touchspin/renderer-tailwind`
- [ ] B2: Move `src/renderers/*` code into packages, preserving markup/classes and behavior.
- [ ] B3: Expose a consistent factory or named export; document `getFrameworkId()`.
- [ ] B4: Update the build to consume renderer packages when producing UMD variants.

Phase C — jQuery Plugin Wrapper (packages/jquery-plugin)
- [ ] C1: Implement `@touchspin/jquery-plugin` that registers `$.fn.TouchSpin`, delegating to the core.
- [ ] C2: Preserve Command API and callable event emissions (map core events to `$(...).trigger(...)`).
- [ ] C3: Keep modern facade appended (or re-home into this wrapper) without behavior change.
- [ ] C4: Update build pipeline to bundle wrapper + selected renderer into UMD outputs.
- [ ] C5: Verify all non-visual tests pass; ensure manual pages remain unchanged.

Phase D — Framework Wrappers (optional deliverables after core split)
- [ ] D1: Web Component (`@touchspin/webcomponent`): custom element; attributes map to options; emit DOM `CustomEvent`s.
- [ ] D2: React (`@touchspin/react`): functional component; props map to options; effects manage lifecycle; expose ref methods.
- [ ] D3: Angular (`@touchspin/angular`): component/directive; Inputs/Outputs; module packaging.
- [ ] D4: Examples and usage snippets for each wrapper.

Phase E — Workspaces, CI, Build, Release
- [ ] E1: Enable npm workspaces in root `package.json`; wire scripts for per‑package builds.
- [ ] E2: Refactor `build.mjs` or add per‑package builds (Vite/Rollup) for core + wrappers.
- [ ] E3: Extend `check-build-integrity.mjs` for new aliases/package outputs.
- [ ] E4: Versioning and publishing strategy (scoped packages), dry‑run publish, access tokens.
- [ ] E5: GitHub Actions: matrix build/test/publish per package.

Phase F — Docs and Migration
- [ ] F1: Package READMEs with install/usage/migration notes.
- [ ] F2: Main README update with new names and packages; migration guide from jQuery plugin → wrappers.
- [ ] F3: Website/docs updates; examples for each renderer and wrapper.

Acceptance & Rollout
- [ ] Tests green at each phase; manual pages parity.
- [ ] Keep legacy filenames as aliases until a major release can drop them.
- [ ] Beta release of `@touchspin/core` + jQuery wrapper before flipping default consumption.
