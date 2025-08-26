Bootstrap TouchSpin — Checklist (Themed, verifiable)

Scope: Track concrete, verifiable steps for modernization while preserving behavior and public API. Complements TODO_PLAN.md (strategy).

- [x] Blur/focusout sanitation: uniform helpers
  - [x] Confirm container `focusout.touchspin` path sanitizes via `_checkValue(true)` (uses `_forcestepdivisibility` and `_setDisplay`).
  - [x] Ensure no duplicate change events when leaving the widget; change fires only when display value actually changes.
  - [x] Verify Enter key (`keydown:13`) commits via `_checkValue(true)` as well.

- [x] Keyboard/mousewheel consistency
  - [x] Arrow up/down trigger `upOnce`/`downOnce` then start/stop spin correctly.
  - [x] Mouse wheel while focused increments/decrements once; does not emit extra changes.

- [x] Programmatic API sanity
  - [ ] jQuery command API: `('get'|'set'|'uponce'|'downonce'|'startupspin'|'startdownspin'|'stopspin'|'updatesettings'|'destroy')` work on an initialized input.
  - [ ] Internal method map via `data('touchspinInternal')` exposes: `getValue`, `setValue`, `upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `updateSettings`, `destroy`.
  - [ ] Bridge facade via `data('touchspin')` proxies to internal methods (fallbacks to events if missing).
  - [ ] Modern facade: `window.TouchSpin.attach(input, opts)` or `Element.prototype.TouchSpin(opts)` returns an instance with method-only API.

- [x] Manual pages sanity-check
  - [x] `__tests__/html/destroy-test-bridge.html`: init → interact → destroy → reinit; try legacy events and facade methods; verify callbacks (before/after calculation).
  - [x] `__tests__/html/destroy-test-esm.html`: ESM twin flow; modern facade operations; destroy/reinit.
  - [x] Verify ARIA updates and disabled/readonly visual cues during interactions.

- [x] Tests and config
  - [x] Run Playwright non-visual tests locally (`npm test`) — should pass on src/ (not dist).
  - [x] Visual tests excluded by default (separate `visual-tests` project) — confirm config/scripts.

- [x] Checkpoint and dist build
  - [x] If all above is good, tag `LGTM-2`.
  - [x] Build dist (`npm run build`).
  - [x] Commit `dist/` before pushing (per AGENTS.md policy). CI will verify integrity (PR includes up‑to‑date `dist/`).

- [x] Documentation nits (post-checkpoint)
  - [x] Note the focusout/Enter-key sanitation behavior in AGENTS.md and TODO_PLAN.md (stability guarantees and where to test manually).
  - [x] Brief usage snippet for modern facade in README (optional until publish).

- [x] Renderer parity and ARIA/state sync
  - [x] Verify Bootstrap3/4/5/Tailwind renderers share consistent button classes and vertical layout wiring.
  - [x] Confirm prefix/postfix hide/show logic matches across renderers and respects empty states.
  - [x] Validate disabled/readonly visual cues update alongside attribute changes.
  - [x] Ensure ARIA attributes (aria-valuetext and min/max when present) stay in sync on value and settings changes.
  - [x] Audit recorded: No inconsistencies found across BS3/4/5/Tailwind; no code changes required.

- [ ] A11y follow-up (deferred)
  - [ ] Evaluate adding role="spinbutton" + aria-valuenow consistently across renderers; validate with screen readers.

- [x] Tests follow-up (non-visual)
  - [x] Add a targeted test to assert ARIA updates on value change and on `updateSettings({ min, max })`.
  - [x] Add a quick check for vertical buttons behavior not affecting change emission semantics.

---

Theme 1 — Events + Timers
- [ ] Introduce internal `emit()`, `on()`, `offAll()` helpers; document teardown.
- [ ] Switch `_bindEvents()` to native `addEventListener` for input, buttons, container (keep jQuery `trigger` emissions).
- [ ] Normalize wheel handling (use `wheel` primarily; tolerate legacy event types if still bound).
- [ ] Verify focusout sanitation order with native listeners (defer tick still applied).
- [ ] Destroy path removes all listeners via `offAll()`.
- [ ] Validate: `events.test.ts`, `keyboardAccessibility.test.ts`, `focusout-behavior.test.ts`, `advancedFeatures.test.ts` pass.
  - [x] Input keyboard/wheel native bindings, container focusout native; button handlers remain jQuery for namespaced triggers.
  - [x] Programmatic `blur` triggers sanitation.

Theme 1.5 — Bridge + Packaging
- [ ] Document build outputs: UMD (bs3/bs4/bs5/tailwind), ESM core (`dist/esm/touchspin.js`).
- [ ] Mark `src/jquery.bootstrap-touchspin.esm.js` as dev‑only; add ESLint override or directive to silence `import.meta` error.
- [ ] Keep `src/core/TouchSpinCore.js` and `src/wrappers/jquery.js` as scaffolds; do not wire into UMD yet.
- [ ] Update README/WORKLOG to reflect packaging and future extraction plan.
- [ ] Tag `LGTM-3.1` (docs/packaging only).
  - [x] Plan/worklog updated; ESM core built; dev ESM twin documented.

Theme 2 — DOM + Attributes (core only; renderers unchanged)
- [ ] Dual handles: cache `el`, `upEl`, `downEl`, `containerEl`.
- [ ] Replace `.val/.attr/.removeAttr/.prop/.is/.addClass/.removeClass` in core with native equivalents.
- [ ] Destroy: replace `.siblings(...).remove()` and `.unwrap()` with native node ops; keep DOM structure identical.
- [ ] Keep jQuery `.data('touchspin*')` mirrored to a private WeakMap store.
- [ ] Validate: `nativeAttributeSync.test.ts`, `destroyAndReinitialize.test.ts`, `testidPropagation.test.ts` pass.
  - [x] Cached handles and native value/ARIA/attr sync in helpers; tests green.

Theme 3 — Value Pipeline + ARIA
- [ ] Confirm all paths route through `_checkValue(true)` → `_setDisplay` → `_updateAriaAttributes`.
- [ ] Ensure `change` fires only when display string changes across keyboard, wheel, buttons, programmatic set.
- [ ] ARIA effective min/max reflect step alignment on settings change.
- [ ] Validate: `aria-sync.test.ts`, `events.test.ts`, `settingsPrecedence.test.ts` pass.
  - [x] upOnce/downOnce emit change only on display string change.

Theme 4 — Facade + Command API plumbing
- [ ] Ensure `$(el).TouchSpin('...')` maps to `data('touchspinInternal')` methods.
- [ ] Keep `$(el).data('touchspin')` facade intact and in sync with internal map.
- [ ] Modern facade (`Element.prototype.TouchSpin`) returns method-only instance wired to same internals.
- [ ] Validate: `apiMethods.test.ts`, manual bridge + ESM pages.

Checkpoints
- [ ] LGTM-3 (after Theme 1): build + commit `dist/`.
- [ ] LGTM-4 (after Theme 2): build + commit `dist/`.
- [ ] LGTM-5 (after Theme 3): build + commit `dist/`.
- [ ] LGTM-6 (after Theme 4): build + commit `dist/`.
