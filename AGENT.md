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
- `npm test` - Run Vitest + Playwright tests (fast parallel execution)
- `npm run build` - Modern Vite build (use this, not legacy Grunt)
- `npm run check-build-integrity` - **CRITICAL**: Run before commits to verify dist sync
- `npm run dev` - Development server with hot reload

### Testing Commands
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:playwright` - Run Playwright browser tests specifically
- Run specific test: `npm test -- --grep "test name"`
- Debug test: `npm test -- --grep "test name" --headed` (shows browser)

### Legacy Commands (fallback)
- `npm run build:legacy` - Original Grunt build pipeline
- `npm run check-build-integrity:legacy` - Legacy integrity check

## Architecture

### Core Structure
- **jQuery plugin** for Bootstrap 3/4/5 input spinners with UMD pattern
- **Source**: `src/` (edit here) → **Built**: `dist/` (never edit directly)  
- **Tests**: `__tests__/` with Vitest + Playwright, helpers in `__tests__/helpers/`
- **Build**: Vite → Rollup bundling → Babel ES5 transpilation → Terser minification
- **Renderers**: `src/renderers/` - Bootstrap version-specific HTML generation

### Key Files
- `src/jquery.bootstrap-touchspin.js` - Main plugin implementation
- `src/jquery.bootstrap-touchspin.css` - Component styles
- `src/renderers/AbstractRenderer.js` - Base renderer class
- `src/renderers/Bootstrap[3|4|5]Renderer.js` - Version-specific implementations
- `__tests__/html/index-bs[3|4|5].html` - Test fixtures for different Bootstrap versions

## Current Implementation Status

### ✅ Recently Completed (ChatGPT Review Implementation)
- **Change Event Semantics**: Complete rework distinguishing user actions from programmatic updates
- **Memory Leak Prevention**: Container-scoped focusout handlers (eliminated 44 leaked handlers)
- **ARIA Accessibility**: Enhanced screen reader support with aria-valuetext and proper attribute management
- **Tab vs Enter Behavior**: Tab navigation doesn't sanitize, Enter commits and sanitizes
- **Test Suite**: 99/104 tests passing with comprehensive coverage

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
- **Vite** is the primary build system (fast, modern)
- **Rollup** (via Vite) handles library bundling with tree-shaking
- **Babel** transpiles to ES5 targeting `> 1%, last 2 versions, ie >= 9`
- **Terser** minifies with banner preservation
- **Source maps** generated for both JS and CSS files
- **Build integrity enforced** - MD5 checksums verify dist matches source

### Testing Environment
- **Vitest + Playwright** for modern, fast browser-based testing
- Tests run with **8 workers** by default (parallel execution)
- **60-second timeout** per test for stability
- **Multiple HTML fixtures** test Bootstrap 3/4/5 compatibility
- **Coverage collection** tracks code usage across tests

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
- `TODO_PLAN.md`: strategy and themes. Adjust the “Current Sprint” to reflect the immediate next focus.
- `TODO_CHECKLIST.md`: concrete, verifiable items. Tick completed items; add/adjust items as work unfolds.
- Checkpoints: for every checkpoint (e.g., `LGTM-4`, `LGTM-5`), tag in git, run `npm run build`, and commit `dist/` along with source changes (CI integrity depends on committed `dist/`).
- Tests: prefer running Playwright with the JSON reporter and write results to `reports/playwright/results.json`. Summarize failures to `reports/playwright/failures.json` to make machine‑readable triage easy.

This protocol is mandatory for handoffs and for safe, traceable increments.
