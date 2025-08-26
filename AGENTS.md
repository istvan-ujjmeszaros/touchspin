# Repository Guidelines

## Project Structure & Module Organization

- `src/`: Core plugin and styles
  - `jquery.bootstrap-touchspin.js`: jQuery plugin logic (UMD, script mode)
  - `jquery.bootstrap-touchspin.css`: Base styles
  - `renderers/`: Adapters for UI stacks (`Bootstrap3/4/5Renderer.js`, `TailwindRenderer.js`, `RendererFactory.js`)
- `__tests__/`: Playwright tests and fixtures
  - `html/`: Minimal pages used by tests
  - `visual/`: Visual regression tests + snapshots
- `dist/`: Built artifacts (do not edit)
- `build.mjs`, `check-build-integrity.mjs`: Build and verification scripts

## Build, Test, and Development Commands

- Setup: `corepack enable && npm ci` and `npx playwright install --with-deps chromium`
- Build: `npm run build` (writes to `dist/`)
- Dev: `npm run dev` (serve) | Preview: `npm run preview`
- Lint: `npm run lint` (ESLint over `src/` + scripts)
- Tests (non-visual): `npm test` | headed: `npm run test:headed` | UI: `npm run test:ui` | report: `npm run test:report`
- Coverage: `npm run test:coverage` | open report: `npm run coverage:open`
- Visual: `npm run test:visual` | update: `npm run test:visual:update` | UI: `npm run test:visual:ui` | headed: `npm run test:visual:headed` | report: `npm run test:visual:report`

Note: Playwright tests load source files from `src/` directly (not `dist/`), except select visual pages that intentionally exercise built variants. Building is not required to run the non-visual suite. During local iteration, do NOT rebuild `dist/` after every change; only rebuild at phase checkpoints or right before publishing/pushing. Always commit `dist/` before push (CI integrity checks rely on it). Do not run `npm run check-build-integrity` locally — it is CI‑only and used to verify that the PR includes up‑to‑date `dist/` files.
Tests automatically start their own local server; you do not need to run a server manually to execute `npm test`.

## Usage: APIs

- jQuery (legacy, full back-compat):
  - Initialize: `$("#input").TouchSpin({ min: 0, max: 100 })`
  - Callable events: `trigger('touchspin.uponce')`, `('...downonce')`, `('...startupspin')`, `('...startdownspin')`, `('...stopspin')`, `('...updatesettings', [opts])`, `('...destroy')`
  - Command API: `$("#input").TouchSpin('get') | ('set', 42) | ('uponce') | ('updatesettings', { step: 10 })`
  - Facade: `$("#input").data('touchspin')` exposes methods (`upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `updateSettings`, `getValue`, `setValue`, `destroy`).

- Modern facade (no jQuery in user code, uses internals under the hood):
  - Attach: `const inst = window.TouchSpin.attach(inputEl, opts)`
  - Element convenience: `const inst = document.querySelector('#input').TouchSpin(opts)`
  - Methods: `inst.upOnce()`, `inst.downOnce()`, `inst.startUpSpin()`, `inst.startDownSpin()`, `inst.stopSpin()`, `inst.updateSettings(opts)`, `inst.getValue()`, `inst.setValue(v)`, `inst.destroy()`

## Manual Pages

- Bridge page: `__tests__/html/destroy-test-bridge.html`
  - Buttons for legacy callable events and the jQuery facade methods side by side.

- ESM page: `__tests__/html/destroy-test-esm.html`
  - Loads renderers + plugin via ESM twin and exercises init/destroy/reinit.
  - Includes a “Modern API” section that uses `Element.prototype.TouchSpin` without writing jQuery.
  - Open manual pages using your IDE/editor’s built‑in server (e.g., PhpStorm) or any preferred local server. No manual use of `scripts/serve.mjs` is required.

## Behavior Notes

- Focusout/Enter sanitation: Leaving the widget (container `focusout.touchspin`) or pressing Enter commits and sanitizes via `_checkValue(true)`, which applies `_forcestepdivisibility`, clamps to min/max, updates display through `_setDisplay`, and emits a single `change` only if the display value actually changes.
- Where to verify: Use both manual pages to test typing arbitrary values, tabbing out, and pressing Enter. Confirm that spinners stop, values sanitize once, and no duplicate `change` events fire.

Accessibility specifics
- `aria-valuetext` reflects the formatted display string, including formatting from `callback_after_calculation` (e.g., currency symbols and thousand separators).
- ARIA min/max reflect the effective, step‑aligned bounds when alignment applies. This can differ from raw `min`/`max` if the current `step` enforces alignment. Tests assert against these effective values.

## Coding Style & Naming Conventions

- Indentation: 2 spaces; LF; UTF‑8 (`.editorconfig`)
- Quotes: single; trim trailing spaces; final newline
- Plugin code allows legacy jQuery style (`var`, function scoping); build scripts prefer modern JS
- Filenames: renderers end with `Renderer.js`; tests end with `.test.ts`
- Lint config: `eslint.config.mjs` (flat config; browser + Node globals)

## Testing Guidelines

- Framework: Playwright; tests in `__tests__/` (TypeScript)
- Visual snapshots: `__tests__/visual/*-snapshots/`; update intentionally with `test:visual:update`
- Add HTML fixtures under `__tests__/html/` for new scenarios
- Keep tests deterministic and focused; include renderer coverage when relevant

## Commit & Pull Request Guidelines

- Use Conventional-style commits where possible (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`) with clear scope
- PRs include: description, linked issue (if any), tests, visual diffs/screenshots for UI changes, and renderer impact notes (BS3/4/5/Tailwind)
- Run `npm run lint` and `npm test` locally before opening a PR

## Notes

- Active working branch: `openai/refactor`
- Always run `npm run build` before pushing, and commit the updated `dist/` outputs. A CI workflow verifies build integrity against the committed `dist/`.
- Do not edit `dist/` directly; all changes originate in `src/` and are built.
- When adding a renderer, follow `src/renderers/RendererFactory.js` and include focused tests plus an HTML fixture.

## Fast Resume

- Start by reading `WORKLOG.md` (Resume Block) to see the current checkpoint and next focus.
- Use `TODO_CHECKLIST.md` to execute the concrete verification steps.
- High-level rationale and multi-phase plan live in `TODO_PLAN.md`.
- CI-only reminder: The integrity check script is not for local use; CI ensures that PRs include up-to-date `dist/` files.
