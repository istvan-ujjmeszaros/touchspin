Bootstrap TouchSpin — Current Checklist

Scope: Track concrete, verifiable steps for the incremental modernization while keeping behavior and tests stable. This complements TODO_PLAN.md (higher-level strategy).

- [ ] Blur/focusout sanitation: uniform helpers
  - [ ] Confirm container `focusout.touchspin` path sanitizes via `_checkValue(true)` (uses `_forcestepdivisibility` and `_setDisplay`).
  - [ ] Ensure no duplicate change events when leaving the widget; change fires only when display value actually changes.
  - [ ] Verify Enter key (`keydown:13`) commits via `_checkValue(true)` as well.

- [ ] Keyboard/mousewheel consistency
  - [ ] Arrow up/down trigger `upOnce`/`downOnce` then start/stop spin correctly.
  - [ ] Mouse wheel while focused increments/decrements once; does not emit extra changes.

- [ ] Programmatic API sanity
  - [ ] jQuery command API: `('get'|'set'|'uponce'|'downonce'|'startupspin'|'startdownspin'|'stopspin'|'updatesettings'|'destroy')` work on an initialized input.
  - [ ] Internal method map via `data('touchspinInternal')` exposes: `getValue`, `setValue`, `upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `updateSettings`, `destroy`.
  - [ ] Bridge facade via `data('touchspin')` proxies to internal methods (fallbacks to events if missing).
  - [ ] Modern facade: `window.TouchSpin.attach(input, opts)` or `Element.prototype.TouchSpin(opts)` returns an instance with method-only API.

- [ ] Manual pages sanity-check
  - [ ] `__tests__/html/destroy-test-bridge.html`: init → interact → destroy → reinit; try legacy events and facade methods; verify callbacks (before/after calculation).
  - [ ] `__tests__/html/destroy-test-esm.html`: ESM twin flow; modern facade operations; destroy/reinit.
  - [ ] Verify ARIA updates and disabled/readonly visual cues during interactions.

- [ ] Tests and config
  - [ ] Run Playwright non-visual tests locally (`npm test`) — should pass on src/ (not dist).
  - [ ] Visual tests excluded by default (separate `visual-tests` project) — confirm config/scripts.

- [ ] Checkpoint and dist build
  - [ ] If all above is good, tag `LGTM-2`.
  - [ ] Build dist (`npm run build`).
  - [ ] Commit `dist/` before pushing (per AGENTS.md policy). CI will verify integrity (PR includes up‑to‑date `dist/`).

- [ ] Documentation nits (post-checkpoint)
  - [ ] Note the focusout/Enter-key sanitation behavior in AGENTS.md and TODO_PLAN.md (stability guarantees and where to test manually).
  - [ ] Brief usage snippet for modern facade in README (optional until publish).
