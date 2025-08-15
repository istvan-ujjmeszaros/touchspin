# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bootstrap TouchSpin is a jQuery plugin that provides a mobile and touch-friendly input spinner component for Bootstrap 3 & 4. It's a number input control with increment/decrement buttons and various configuration options for styling and behavior.

## Build System & Development Commands

The project uses **Vite** as its modern build system (with Grunt legacy support):

### Primary Build Commands (Vite-based)
- `npm run build` - Modern Vite build: Vite → Babel transpilation → Terser minification → CSS processing
- `npm run check-build-integrity` - Verifies dist folder is properly rebuilt (required before commits)
- `npm run dev` - Development server with hot reload
- `npm run preview` - Preview built files locally

### Legacy Build Commands (Grunt-based)
- `npm run build:legacy` or `grunt default` - Original Grunt build pipeline
- `npm run check-build-integrity:legacy` or `grunt check-build-integrity` - Legacy integrity check
- `grunt clean` - Clean the dist folder

### Testing (Vitest + Playwright)
- `npm test` - Run Vitest tests (fast, parallel execution)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:playwright` - Run Playwright browser tests specifically

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
- **`__tests__/`** - Vitest + Playwright integration tests
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
- The Vite build process includes ES5 transpilation via Babel for broad browser compatibility
- Build outputs are deterministic and checked for integrity via MD5 checksums
- Legacy Grunt build available as fallback (`build:legacy` commands)

### Testing Environment  
- Uses **Vitest + Playwright** for modern, fast browser-based testing
- Test timeout set to 60 seconds for stability
- Multiple HTML fixtures test Bootstrap 3/4/5 compatibility and RTL support
- Tests run sequentially by default to match previous behavior (can be parallelized)
- Playwright automatically manages web server and browser instances
- **IMPORTANT**: Use `npm test` for Vitest or `npm run test:playwright` for Playwright-specific tests
- Demo HTML files in `demo/` folder work directly from the local file system with `file://` protocol

### Code Standards
- Follows jQuery Core Style Guide
- JSHint configuration in `.jshintrc` (used by legacy Grunt build)
- ES6+ code is transpiled via Babel for ES5 compatibility
- Modern development workflow with Vite provides fast builds and hot reload

### Refactoring Guidelines
- **IMPORTANT**: When refactoring involves renaming classes, methods, or files, ALWAYS ask the user to decide on the new name instead of choosing it yourself
- Present 3-5 naming options with clear rationale for each
- Wait for user approval before proceeding with any renames
- This ensures naming consistency with project conventions and user preferences

### Modern Build System Details
- **Vite** for fast development and optimized production builds
- **Rollup** (via Vite) for efficient library bundling with tree-shaking
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
  - Debug scripts or quick prototype files
  - Any files used for temporary development or debugging purposes
- Always clean up temporary files when debugging is complete