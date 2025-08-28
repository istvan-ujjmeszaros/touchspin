# AGENT.md - Bootstrap TouchSpin Development Guide

## Environment Setup

Based on the CI workflow, set up your development environment:

```bash
# 1. Clone and setup
git clone <repository-url>
cd bootstrap-touchspin-new

# 2. Install Node.js 18+ (required)
# Use nvm, fnm, or download from nodejs.org

# 3. Install dependencies
npm ci

# 4. Install Playwright browsers (required for tests)
npx playwright install --with-deps chromium

# 5. Verify build integrity (critical before any commits)
npm run check-build-integrity

# 6. Run tests to verify setup
npm test
```

## Build/Test Commands

### Primary Commands
- `npm test` - Run Playwright tests (browser-based)
- `npm run build` - Rollup build (UMD per renderer + ESM core)
- `npm run check-build-integrity` - Used by a GitHub workflow, no need to run it manually
- `npm run dev` - Local static server for manual pages/tests (no HMR)

### Testing Commands
- `npm run test:headed` - Run tests with visible browser
- `npm run test:ui` - Run tests with Playwright UI
- `npm run test:playwright` - Run Playwright browser tests specifically
- `npm run test:json` - Run tests with JSON reporter to `reports/json/last.json`
- `npm run test:json:tailwind` - Tailwind-only tests to `reports/json/tailwind.json`
- `npm run test:debug` - Open Playwright Inspector (step-by-step) for any tests (pass patterns after `--`)
- `npm run test:debug:tailwind` - Inspector for Tailwind tests only
- JSON report: `npm run test:json` (saves to `reports/json/last.json`)
- Tailwind JSON: `npm run test:json:tailwind`

#### Debug failures with JSON output
To capture machine-readable results and a quick failure summary:

```
# All tests → JSON
npm run test:json

# Specific test file → JSON
npm run test:json -- __tests__/file.test.ts

# Tailwind renderer only
npm run test:json:tailwind

# The JSON report is written to reports/json/*.json and parsed for a summary.
```

#### Step-by-step debugging
- Inspector: `npm run test:debug -- __tests__/some.test.ts` (or run with `PWDEBUG=1`). You can pause, step, and view locators.
- Pause anywhere: add `await page.pause()` inside a test to break into the Inspector at that line.

Tip (Windows/PowerShell): use `$env:PWDEBUG=1; npx playwright test` to set env vars; on Bash/WSL use `PWDEBUG=1 npx playwright test`.

### Legacy Commands (fallback)
- `npm run build:legacy` - Original Grunt build pipeline
- `npm run check-build-integrity:legacy` - Legacy integrity check

## Architecture

### Core Structure
- **jQuery plugin** for Bootstrap 3/4/5 input spinners with UMD pattern
- **Source**: `src/` (edit here) → **Built**: `dist/` (never edit directly)  
- **Tests**: `__tests__/` with Playwright, helpers in `__tests__/helpers/`
- **Build**: Rollup bundling → Babel ES5 transpilation → Terser minification
- **Renderers**: `src/renderers/` - Bootstrap version-specific HTML generation

### Key Files
- **`src/jquery.bootstrap-touchspin.js`** - ⭐ **BEHAVIORAL SOURCE OF TRUTH** - Original plugin that all modern packages must replicate exactly
- `src/jquery.bootstrap-touchspin.css` - Component styles
- `src/renderers/AbstractRenderer.js` - Base renderer class
- `src/renderers/Bootstrap[3|4|5]Renderer.js` - Version-specific implementations
- `__tests__/html/index-bs[3|4|5].html` - Test fixtures for different Bootstrap versions

**Critical**: The modernization goal is to extract the exact logic from `src/jquery.bootstrap-touchspin.js` into modular packages (`packages/core/`, `packages/jquery-plugin/`, etc.) while preserving identical behavior. Always reference the original source when implementing new features or fixing issues.

## Current Implementation Status

### ✅ Recently Completed (ChatGPT Review Implementation)
- **Change Event Semantics**: Complete rework distinguishing user actions from programmatic updates
- **Memory Leak Prevention**: Container-scoped focusout handlers (eliminated 44 leaked handlers)
- **ARIA Accessibility**: Enhanced screen reader support with aria-valuetext and proper attribute management
- **Tab vs Enter Behavior**: Tab navigation doesn't sanitize, Enter commits and sanitizes
- **Test Suite**: 241/242 tests passing with comprehensive coverage

### 🚨 **CRITICAL STATUS CLARIFICATION**
**The 241/242 passing tests are testing the ORIGINAL `src/jquery.bootstrap-touchspin.js` file, NOT the modernized packages.**

**Current Reality:**
- ✅ Original plugin (`src/`) is stable and well-tested (241/242 tests pass)
- 🚧 Modern packages (`packages/`) are in development with only manual smoke testing
- ❌ **C5b is incomplete** - modernized packages need full test suite integration
- 🎯 **Major work remains** to migrate test fixtures to use modern packages

### Change Event Behavior (New Implementation)
**Fire change events for**:
- Button spins (up/down clicks)
- Mouse wheel interactions (when focused)
- Enter key press (sanitizes and fires change)
- Focusout from external actions (leaving widget completely)

**Do NOT fire change for**:
- `touchspin.updatesettings` calls (programmatic updates)
- Tab key press (Tab navigation only, no sanitization)
- Internal ARIA updates
- MutationObserver syncs

## Code Style & Patterns

### General Guidelines
- Follow jQuery Core Style Guide and existing patterns
- TypeScript for tests, ES6+ in source (transpiled to ES5 for compatibility)
- Use existing libraries - check package.json before adding dependencies
- **Never edit dist/**, always run integrity check before commits
- **No comments** unless explicitly requested by user

### Types & JSDoc
- Enable `@ts-check` at the top of new/edited JS files when practical.
- Add JSDoc type definitions for public APIs, options objects, renderer interfaces, and non-trivial helpers. Keep them concise and accurate.
- Prefer `@typedef` blocks for shared shapes (e.g., `TouchSpinOptions`, renderer interfaces) and `@returns`/`@param` on functions and methods.
- Avoid noisy prose comments; focus on type information and brief intent. Update JSDoc alongside code changes.
 - Core package uses TypeScript for static checking via `checkJs` (see `packages/core/tsconfig.json`). We remain JavaScript-first during Phase A–C to avoid build churn; revisit full `.ts` migration once the core stabilizes.

### Test Patterns
- Import: `import touchspinHelpers from './helpers/touchspinHelpers'` (default export)
- Async/await for Playwright test helpers
- Use `await expect.poll()` for async assertions with timing
- Clear events log before tests: `await page.evaluate(() => { document.getElementById('events_log').textContent = ''; });`
- Set values without change events: `$input.val('value')` not `fillWithValue()`

### Container Focusout Architecture
```javascript
// New pattern - container scoped with deferred execution
container.on('focusout.touchspin', function (e) {
  var next = e.relatedTarget;
  if (!leavingWidget(next)) return;
  
  setTimeout(function () {
    var ae = document.activeElement;
    if (leavingWidget(ae)) {
      stopSpin();
      _checkValue(true); // mayTriggerChange = true
    }
  }, 0);
});
```

## Critical Development Notes

### Build System
- **Rollup** is the primary build system
- **Babel** transpiles to ES5 targeting `> 1%, last 2 versions, ie >= 9`
- **Terser** minifies with banner preservation
- **Source maps** generated for both JS and CSS files
- **Build integrity enforced** - MD5 checksums verify dist matches source

- ### Testing Environment
- **Playwright** for modern, fast browser-based testing
- **60-second timeout** per test for stability
- **Multiple HTML fixtures** test Bootstrap 3/4/5 compatibility
- **Coverage collection** tracks code usage across tests
 
🚨 **CRITICAL**: Existing Playwright tests (241/242) and Bootstrap HTML fixtures exercise the ORIGINAL jQuery plugin in `src/`, NOT the modernized packages. 

The modernized packages (`packages/core`, `packages/jquery-plugin`, etc.) currently have only:
- Manual smoke testing via `__tests__/html-package/` pages
- A few wrapper-specific tests (`wrapper*.test.ts`)

**MAJOR WORK REMAINING**: Migrate the full 241-test suite to also test modernized packages to ensure complete behavioral parity before the modernized version can be considered production-ready.

### Manual Pages & Harnesses
- Legacy plugin demos (original source)
  - Bootstrap demos: `__tests__/html/index-bs3.html`, `index-bs4.html`, `index-bs5.html` (do not modify)
- New wrapper/core harnesses (separate folder to avoid mixing with legacy)
  - Core smoke: `__tests__/html-package/core-smoke.html` (ESM core only; no jQuery)
  - Imports `createPublicApi` + `CORE_EVENTS` from `packages/core/src/index.js`.
  - Buttons: `upOnce`, `downOnce`, `startUpSpin`, `startDownSpin`, `stopSpin`, `getValue`, `setValue`, `updateSettings`.
  - Logs `CORE_EVENTS` and native `change` for clarity.
- jQuery wrapper smoke: `__tests__/html-package/jquery-plugin-smoke.html` (new core-backed wrapper; no renderer)
  - Installs wrapper from `packages/jquery-plugin/src/index.js`.
  - Mirrors legacy command API and logs `touchspin.on.*` (parsed from jQuery namespaces) and `change`.
- Tailwind renderer + Core: `__tests__/html-package/tailwind-renderer-core.html`
  - Uses Tailwind renderer to build UI, then wires to core API (no jQuery plugin).
  - Logs `CORE_EVENTS` and native `change`. Includes Disabled/Readonly toggles.
- Tailwind renderer + jQuery wrapper: `__tests__/html-package/tailwind-renderer-jquery.html`
  - Uses Tailwind renderer UI with the new core-backed jQuery wrapper.
  - Logs `touchspin.on.*` (parsed namespaces) and native `change`. Includes Disabled/Readonly toggles.

Note: The Bootstrap demo pages (`__tests__/html/index-bs3.html`, `index-bs4.html`, `index-bs5.html`) use the original plugin from `src/jquery.bootstrap-touchspin.js`. Do not modify these pages while extracting core/wrapper; they serve as the behavioral source-of-truth demos.

### Memory Management
- **No document-level event handlers** (all container-scoped)
- **Proper cleanup** on `touchspin.destroy` removes all listeners
- **MutationObserver** handles attribute changes without global listeners
- **Event namespacing** uses `.touchspin` for easy cleanup

## Common Issues & Solutions

### Test Issues
- **"Protocol error"** → Fixed with proper page lifecycle in Playwright
- **Flaky change events** → Use `expect.poll()` for timing-dependent assertions
- **Event contamination** → Clear events log before tests
- **Value setting issues** → Use `$input.val()` directly, not `fillWithValue()`

### Build Issues
- **File lock errors** → Stop and manually remove locked files, don't retry
- **Dist mismatch** → Always run `npm run check-build-integrity` before commits
- **ES5 compatibility** → Babel handles transpilation automatically

### Runtime Issues
- **Tab vs Enter confusion** → Tab navigates only, Enter commits/sanitizes
- **Double change events** → Check for `mayTriggerChange` parameter usage
- **ARIA issues** → Don't force aria-valuenow=0 on empty inputs

## Development Workflow

1. **Before coding**: Run `npm run check-build-integrity`
2. **Make changes**: Edit files in `src/` only, never `dist/`
3. **Test changes**: Run `npm test` (or specific tests)
4. **Build verification**: Run `npm run check-build-integrity`
5. **Commit**: Git commit with proper message
6. **Push**: Git push to feature branch

### File Organization
- **Temporary files**: Use `tmp/` folder (gitignored) for debugging
- **Never commit**: Temporary debug files, dist modifications, or test artifacts
- **Source of truth**: `src/` directory and test files only

## Performance & Compatibility

### Browser Support
- **ES5 compatibility** via Babel transpilation
- **Bootstrap 3, 4, 5** support via renderer system
- **Modern browsers** + IE9+ support
- **Touch-friendly** mobile spinner controls

### Performance Features
- **Fast builds** with Vite (HMR in development)
- **Optimized bundles** with Rollup tree-shaking
- **Efficient event handling** with container scoping
- **Parallel testing** with 8 workers (can be tuned)

---

**Last Updated**: Based on comprehensive ChatGPT review implementation achieving 99/104 tests passing with modern change event semantics, memory leak prevention, and enhanced accessibility.
## Progress & Resume Protocol (Agent discipline)

Always keep these files up to date so any new session can resume without prior chat history:

- `WORKLOG.md` (Resume Block): single source of truth for current checkpoint tag, current focus, completed summary, next checkpoint. Update this after each meaningful step and at every checkpoint.
- `TODO_HIGHLEVEL.md`: strategy and themes. Adjust the “Current Sprint” to reflect the immediate next focus.
- `TODO_CHECKLIST.md`: concrete, verifiable items. Maintain checkboxes after each small step — update `[ ]/[~]/[x]` immediately as work progresses; do not batch these updates. Add/adjust items as work unfolds.
- Checkpoints: for every checkpoint (e.g., `LGTM-4`, `LGTM-5`), tag in git, run `npm run build`, and commit `dist/` along with source changes (CI integrity depends on committed `dist/`).
- Tests: prefer running Playwright with the JSON reporter and write results to `reports/playwright/results.json`. Summarize failures to `reports/playwright/failures.json` to make machine‑readable triage easy.

This protocol is mandatory for handoffs and for safe, traceable increments.
