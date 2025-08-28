# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bootstrap TouchSpin is a jQuery plugin that provides a mobile and touch-friendly input spinner component for Bootstrap 3 & 4. It's a number input control with increment/decrement buttons and various configuration options for styling and behavior.

## Build System & Development Commands

The project uses **Rollup** as its build system:

### Primary Build Commands (Rollup-based)
- `npm run build` - Rollup build: Rollup → Babel transpilation → Terser minification → CSS processing
- `npm run check-build-integrity` - Verifies dist folder is properly rebuilt (required before commits)
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

### Source Structure
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

### Plugin Architecture
- UMD pattern supporting AMD, CommonJS, and global jQuery
- jQuery plugin extending `$.fn.TouchSpin`
- Maintains internal spinner ID counter (`_currentSpinnerId`)
- Extensive configuration options for styling, behavior, and validation

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
