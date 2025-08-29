# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bootstrap TouchSpin is a jQuery plugin that provides a mobile and touch-friendly input spinner component for Bootstrap 3 & 4. It's a number input control with increment/decrement buttons and various configuration options for styling and behavior.

## Build System & Development Commands

The project uses **Rollup** as its build system:

### Primary Build Commands (Rollup-based)
- `npm run build` - Rollup build: Rollup → Babel transpilation → Terser minification → CSS processing
- `npm run check-build-integrity` - Used by a GitHub workflow, no need to run it manually
- `npm run dev` - Local static server for manual pages/tests (no HMR)

### Legacy Build Commands (Grunt-based)
- `npm run build:legacy` or `grunt default` - Original Grunt build pipeline
- `npm run check-build-integrity:legacy` or `grunt check-build-integrity` - Legacy integrity check
- `grunt clean` - Clean the dist folder

### Testing (Playwright + Coverage)
- `npm test` - Run Playwright tests (browser-based tests)
- `npm run test:coverage` - Run tests with automatic coverage report generation
- `npm run coverage:open` - Open HTML coverage reports in browser
- `npm run test:headed` - Run tests with visible browser
- `npm run test:ui` - Run tests with Playwright UI

## Architecture

### Modern Architecture (Multi-Package)
- **`packages/core/`** - Framework-agnostic core logic with element-attached instances
- **`packages/jquery-plugin/`** - jQuery wrapper that bridges to core (callable events only)
- **`packages/renderers/`** - Framework-specific DOM rendering (Bootstrap 3/4/5, Tailwind)

### Core Architecture (Element-Attached)
The modern core uses an **element-attached architecture**:
- `TouchSpin(inputElement, options)` - Creates/updates instance attached to DOM element
- `getTouchSpin(inputElement)` - Retrieves existing instance from element  
- `destroy()` - Removes instance from element and cleans up DOM/events
- No separate API instances - the core attaches directly to input elements
- State is tracked by instance existence on element, no separate `_initialized` flags

### Legacy Architecture
- **`src/`** - Source files (never edit `dist/` directly)
  - `jquery.bootstrap-touchspin.js` - Main jQuery plugin implementation 
  - `jquery.bootstrap-touchspin.css` - Component styles

### Build Output
- **`dist/`** - Generated files (transpiled, minified versions with source maps)
  - Built files include version banner and are transpiled via Babel for ES5 compatibility
  - Both normal and minified versions (.min.js/.min.css) are generated
  - Source maps (.map files) included for debugging

### Testing
- **`__tests__/`** - Playwright browser tests with NYC/Istanbul coverage
  - `basicOperations.test.ts` - Core functionality tests
  - `events.test.ts` - Event handling tests
  - `browserNativeSpinners.test.ts` - Native spinner synchronization tests
  - `renderers.test.ts` - Bootstrap version compatibility tests
  - `advancedFeatures.test.ts` - Advanced functionality tests
  - `apiMethods.test.ts` - API method tests
  - `rtlSupport.test.ts` - Right-to-left language support tests
  - `verticalButtons.test.ts` - Vertical button layout tests
  - `helpers/` - Test utilities and Playwright setup
  - `html/` - Test HTML fixtures for different Bootstrap versions

## Key Development Notes

### Modern Plugin Architecture (✅ IMPLEMENTED)

#### Element-Attached Core Architecture
- **TouchSpin() function** creates/updates instances attached directly to DOM elements  
- **getTouchSpin() function** retrieves existing instances from elements
- **No separate API instances** - core attaches to input elements using `_touchSpinCore` property
- **Clean lifecycle management** - destroy() removes instance from element and cleans up everything
- **Simplified state tracking** - instance existence on element = active, no `_initialized` flags

#### Core Event Handling (✅ IMPLEMENTED)
- **Core handles ALL DOM events** (up/down buttons, input events, etc.) via data attributes
- Core attaches event listeners to elements with `data-touchspin-injected` attributes
- Event targeting uses **data attributes only** - NO class name dependencies
- Required data attributes: `data-touchspin-injected="up"`, `data-touchspin-injected="down"`, `data-touchspin-injected="wrapper"`
- Events handled: mousedown/mouseup on buttons, input/change/keydown/keyup/wheel on input element

#### jQuery Wrapper Responsibilities (✅ IMPLEMENTED)  
- **Only forwards callable events to core API** - contains NO DOM event logic
- Uses `getTouchSpin()` to retrieve core instances instead of jQuery data storage
- Simplified destroy logic - core `destroy()` handles everything including element cleanup
- Callable events forwarded:
  - `touchspin.updatesettings` → `core.updateSettings()`
  - `touchspin.uponce` → `core.upOnce()`
  - `touchspin.downonce` → `core.downOnce()`
  - `touchspin.startupspin` → `core.startUpSpin()`
  - `touchspin.startdownspin` → `core.startDownSpin()`
  - `touchspin.stopspin` → `core.stopSpin()`

#### Renderer Requirements (✅ IMPLEMENTED)
- **Must add data attributes to markup** for core event targeting
- All renderer implementations include `data-touchspin-injected` attributes with role values
- AbstractRenderer moved to core package for consistency across all renderers
- Renderers handle presentation only - NO event logic

#### Modern Initialization (✅ IMPLEMENTED)
- Direct core: `TouchSpin(inputElement, options)` 
- Via jQuery: `$input.TouchSpin(options)`
- Both approaches use element-attached instances

### Legacy Plugin Architecture
- UMD pattern supporting AMD, CommonJS, and global jQuery
- jQuery plugin extending `$.fn.TouchSpin`
- Maintains internal spinner ID counter (`_currentSpinnerId`)
- Configuration options for styling, behavior, and validation

### Build Requirements
- **Critical**: Always run `npm run check-build-integrity` before committing - this ensures dist files are properly synchronized with source changes
- Source changes must be made in `src/`, never in `dist/`
- The Rollup build process includes ES5 transpilation via Babel for broad browser compatibility
- Build outputs are deterministic and checked for integrity via MD5 checksums
- **Source Maps**: All `.map` files in `dist/` must be committed to git (use `git add -f dist/*.map` if needed to override global gitignore rules)
- Legacy Grunt build available as fallback (`build:legacy` commands)

### Testing Environment  
- Uses **Vitest + Playwright** for browser-based testing
- Test timeout set to 60 seconds for stability
- Multiple HTML fixtures test Bootstrap 3/4/5 compatibility and RTL support
- Tests run sequentially by default to match previous behavior (can be parallelized)
- Playwright automatically manages web server and browser instances
- **Coverage System**: Uses NYC/Istanbul for coverage reporting with LCOV and HTML formats
- **IDE Integration**: LCOV reports generated at `reports/coverage/lcov.info` for PHPStorm
- **Visual Reports**: HTML coverage reports at `reports/coverage/html/index.html`
- Demo HTML files in `demo/` folder work directly from the local file system with `file://` protocol

### Clean Test Files (Modern Architecture Testing)
- **`__tests__/html-package/core-smoke-simple.html`** - Direct core API testing with TouchSpin() function
- **`__tests__/html-package/jquery-wrapper-simple.html`** - jQuery wrapper testing with comprehensive callable event coverage
- **Clean, minimal code** - no debug logging or complex initialization logic
- **Comprehensive API coverage** - tests all Command API and Callable Event methods
- **Element-attached validation** - demonstrates proper instance lifecycle management

### Code Standards
- Follows jQuery Core Style Guide
- JSHint configuration in `.jshintrc` (used by legacy Grunt build)
- ES6+ code is transpiled via Babel for ES5 compatibility
- Development workflow uses a static server (`scripts/serve.mjs`) for local testing

### Refactoring Guidelines
- **IMPORTANT**: When refactoring involves renaming classes, methods, or files, ALWAYS ask the user to decide on the new name instead of choosing it yourself
- Present 3-5 naming options with clear rationale for each
- Wait for user approval before proceeding with any renames
- This ensures naming consistency with project conventions and user preferences

### Modern Build System Details
- **Rollup** for library bundling with tree-shaking
- **Babel** for ES5 transpilation targeting `> 1%, last 2 versions, ie >= 9`
- **Terser** for JavaScript minification with banner preservation
- **CleanCSS** for CSS minification
- **Source maps** generated for both JS and CSS files

### Temporary Files Policy
- **Never commit temporary/debug files to the repository**
- Create temporary files for testing/debugging in a `tmp/` folder in the project root
- The `tmp/` folder should be gitignored to prevent accidental commits
- Examples of temporary files that should go in `tmp/`:
  - Test HTML files (e.g., `test-debug.html`, `test-renderer.html`, `test-working.html`)
  - Test analysis files (e.g., `test-results-analysis.json`, `test-output.log`)
  - Debug scripts or quick prototype files
  - Any files used for temporary development or debugging purposes
- Always clean up temporary files when debugging is complete

### Documentation Language Guidelines
- **Avoid self-promotional language** in README and documentation files
- **Use factual, neutral tone** instead of marketing language
- **Prohibited terms**: "comprehensive", "extensive", "perfect", "optimal", "amazing", "excellent", "superior", "cutting-edge"
- **Avoid superlatives**: Don't use "best", "fastest", "most advanced", etc.
- **Be precise**: Use "designed for" instead of "optimized for", "supports" instead of "expertly handles"
- **No emotional appeals**: Avoid "Made with ❤️" or similar promotional footers
- **Technical accuracy**: Ensure descriptions accurately reflect functionality (e.g., events are programmatic, not user interactions)
- **Professional tone**: Documentation should inform, not convince or impress
