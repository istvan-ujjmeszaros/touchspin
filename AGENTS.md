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
- Build: `npm run build` (writes to `dist/`) | Integrity: `npm run check-build-integrity`
- Dev: `npm run dev` (serve) | Preview: `npm run preview`
- Lint: `npm run lint` (ESLint over `src/` + scripts)
- Tests (non-visual): `npm test` | headed: `npm run test:headed` | UI: `npm run test:ui` | report: `npm run test:report`
- Coverage: `npm run test:coverage` | open report: `npm run coverage:open`
- Visual: `npm run test:visual` | update: `npm run test:visual:update` | UI: `npm run test:visual:ui` | headed: `npm run test:visual:headed` | report: `npm run test:visual:report`

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
- Do not edit `dist/` directly; all changes originate in `src/` and are built
- When adding a renderer, follow `src/renderers/RendererFactory.js` and include focused tests plus an HTML fixture
