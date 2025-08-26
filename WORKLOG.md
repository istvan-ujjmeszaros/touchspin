Bootstrap TouchSpin — Worklog & Resume Guide

Purpose
- Persistent, human-readable state so any contributor (or the agent) can resume work without prior chat history. Use alongside `TODO_PLAN.md` (strategy) and `TODO_CHECKLIST.md` (current verifiable tasks).

Resume Block (single source of truth)
- Current checkpoint tag: LGTM-4
- Current focus: Theme 3 — Value Pipeline + ARIA. Confirm all paths route through `_checkValue(true)` + `_setDisplay` and emit `change` only when display changes. Finish any remaining core DOM/attr native conversions (Theme 2 wrap‑up).
- Completed verification summary: Theme 1 (Events+Timers) done; Theme 1.5 (Bridge + Packaging) docs added; Theme 2 (core DOM+attrs) partially migrated with native `value/ARIA/attr` helpers and cached handles; Theme 3 emission rule unified for `upOnce/downOnce`. Non‑visual tests green; dist updated at each checkpoint.
- Next manual verification: Bridge + ESM pages — keyboard, wheel, hold spin, focusout sanitation; confirm single change emission and ARIA sync.
- Next checkpoint: Tag LGTM-5 (Value Pipeline + ARIA confirmed), then `npm run build` and commit `dist/`.
- CI note: Do not run `npm run check-build-integrity` locally. CI runs it to ensure PRs include up-to-date `dist/`.

Quick Commands
- Tests (non-visual): `npm test` (spawns its own test web server; no manual server needed)
- Build at checkpoint: `npm run build` (then commit `dist/`)
- Visual tests (optional): `npm run test:visual` (separate Playwright project)

Manual Pages
- Bridge: `__tests__/html/destroy-test-bridge.html`
- ESM: `__tests__/html/destroy-test-esm.html`
  Open these via your editor's built-in server (e.g., PhpStorm) or your preferred local server. Do not run `scripts/serve.mjs` manually.

Verification Targets
- Focusout/Enter sanitation: One sanitize on widget exit or Enter; uses `_checkValue(true)` → `_forcestepdivisibility` + bounds + `_setDisplay`; emits a single `change` only if display actually changes.
- Keyboard: Arrow up/down perform `upOnce`/`downOnce` and spin start/stop correctly.
- Mouse wheel: While focused, increments/decrements once per notch; no extra changes.
- Programmatic control: jQuery command API, internal map (`data('touchspinInternal')`), jQuery facade (`data('touchspin')`), and modern facade (`Element.prototype.TouchSpin`) all behave consistently.
- Destroy/Reinit: Works for default, vertical, and input-group reuse scenarios; callbacks fire in expected order.

Recent Checkpoints (most recent first)
- LGTM-4: Core DOM/attrs partial migration; unified change emission for up/down; tests green; dist updated.
- LGTM-2: Focusout/Enter sanitation verified; modern facade stable. Docs updated to clarify CI-only integrity check.
- LGTM-1: Init/keyboard/mousewheel fixed (previous session).
- LGTM: Callback formatting verified.

When Finishing a Step
- Update the Resume Block: set the next focus, note any caveats, and the next checkpoint tag name.
- Tick items in `TODO_CHECKLIST.md` that were completed and adjust `TODO_PLAN.md` as needed.
- If creating a checkpoint: create tag (e.g., `LGTM-5`), run `npm run build`, commit `dist/` and your changes.
