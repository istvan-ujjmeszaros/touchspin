# TouchSpin Modernization Plan (No‑Rewrite)

Goal
- Keep `src/jquery.bootstrap-touchspin.js` as the single source of truth. Do NOT rewrite from scratch.
- Expose a clean, modern API from the existing implementation while preserving 100% backward compatibility via jQuery (including callable events and DOM structure).
- Provide a module-friendly entry so modern consumers can use the plugin without writing jQuery code, while internals still lean on jQuery during migration.

Principles
- One source of truth; small, targeted changes; no behavior regressions.
- Add new API surfaces on top; change internals only behind those APIs.
- Migrate away from jQuery gradually, method by method, after API proves stable.

## ✅ Phase 0: Baseline
- Tests green; build integrity check enabled. Always commit `dist/` after `npm run build`.

## ✅ Phase 1: Public API + ESM Entry
- Stable methods surfaced from the existing plugin (backed by current logic):
  - `upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `updateSettings`, `getValue`, `setValue`, `destroy`.
- jQuery command API passthrough: `$(el).TouchSpin('get'|'set'|'uponce'|'downonce'|'startupspin'|'startdownspin'|'stopspin'|'updatesettings'|'destroy')`.
- Internal API map at `$(el).data('touchspinInternal')` for wrappers/facades.
- ESM twin loader `src/jquery.bootstrap-touchspin.esm.js` registers the classic plugin in module contexts (no behavior change).
- Optional modern facade (non-breaking): `window.TouchSpin.attach(input, opts)` and/or `Element.prototype.TouchSpin(opts)` returning a method-only instance.

## ✅ Phase 2: Bridge + Manual Parity Pages
- jQuery bridge facade (`src/wrappers/jquery-bridge.js`) attaches `$(el).data('touchspin')` and prefers direct internal calls (falls back to legacy events).
- Manual pages for quick verification:
  - `__tests__/html/destroy-test-bridge.html`: legacy callable events + facade buttons verified in browser.
  - `__tests__/html/destroy-test-esm.html`: ESM twin loader exercising init/destroy/reinit/vertical flows.

## Phase 3: Incremental De‑jQuery (inside current file)
- Keep external API and DOM unchanged; modify internals behind stable methods.
- Migrate one area at a time, replacing jQuery usage with native DOM where low risk:
  - Value pipeline: `getValue`/`setValue` (step/decimals/min/max) — implemented for `setValue`.
  - Single-step ops: `upOnce`/`downOnce`.
  - Spin timers and state: `startUpSpin`/`startDownSpin`/`stopSpin`.
  - ARIA updates and attribute sync.
- After each change: verify with bridge page; optionally run non-visual tests; keep visuals unchanged.

## Phase 4: jQuery Back‑Compat and Facade
- Preserve callable events: `touchspin.uponce`, `touchspin.downonce`, `touchspin.startupspin`, `touchspin.startdownspin`, `touchspin.stopspin`, `touchspin.updatesettings`, `touchspin.destroy`.
- Maintain `$(el).TouchSpin(...)` API and `$(el).data('touchspin')` facade for direct method calls in jQuery land.
- Command API remains supported for parity and convenience.

## Phase 5: Tests and Coverage
- Keep existing tests green; run visual tests on demand and update snapshots intentionally.
- Extend manual pages as we migrate internals; add targeted Playwright tests only where they increase confidence.

## Phase 6: Build/Repo Tasks
- Continue emitting UMD builds; keep integrity checks and commit `dist/`.
- ESM twin loader remains the module entry while internals depend on jQuery; later, flip to a jQuery‑free modern build after internals are decoupled.

## Phase 7: Docs and Migration
- Document modern usage (attach/facade) vs. legacy jQuery plugin.
- Provide mapping for callable events → methods and command API examples.
- Migration guide: “Using methods instead of events”, “Gradual de‑jQuery under the hood”.

## Future (Optional Extraction)
- When internals are sufficiently decoupled, extract a small jQuery‑free core and let the jQuery plugin become a thin wrapper. Keep the public API identical so consumers aren’t impacted.

## Success Criteria
- One source of truth (`src/jquery.bootstrap-touchspin.js`), no rewrite.
- Modern API available without writing jQuery; legacy jQuery path fully backward compatible.
- Behavior, DOM, and callable events preserved; pages and tests continue to pass.
- Build integrity enforced; `dist/` committed before push.

---

Current Sprint (Resume Here)
- See `WORKLOG.md` for the current checkpoint and the immediate next focus. Use `TODO_CHECKLIST.md` to verify each concrete step.
- CI note: Integrity check (`npm run check-build-integrity`) is CI-only and should not be run locally. Ensure you commit `dist/` after `npm run build` when creating a checkpoint or before push.
