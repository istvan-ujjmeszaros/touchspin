Bootstrap TouchSpin — Worklog & Resume Guide

Purpose
- Persistent, human-readable state so any contributor (or the agent) can resume work without prior chat history. Use alongside `TODO_PLAN.md` (strategy) and `TODO_CHECKLIST.md` (current verifiable tasks).

Resume Block (single source of truth)
- Current checkpoint tag: LGTM-2
- Current focus: Keyboard/mousewheel consistency audit; confirm single-change emission and correct spin start/stop. Unify paths only if risk-free.
- Next manual verification: Use bridge and ESM pages to validate typing → Enter → focusout; mouse wheel; arrow keys; start/stop spin; callbacks.
- Next checkpoint: If behavior holds, tag LGTM-3, then build `dist/` and commit it (CI will verify integrity of PR contains updated `dist/`).
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
- LGTM-2: Focusout/Enter sanitation verified; modern facade stable. Docs updated to clarify CI-only integrity check.
- LGTM-1: Init/keyboard/mousewheel fixed (previous session).
- LGTM: Callback formatting verified.

When Finishing a Step
- Update the Resume Block: set the next focus, note any caveats, and the next checkpoint tag name.
- Tick items in `TODO_CHECKLIST.md` that were completed.
- If creating a checkpoint: create tag (e.g., `LGTM-3`), run `npm run build`, commit `dist/` and your changes.
