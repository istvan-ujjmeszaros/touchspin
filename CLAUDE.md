# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bootstrap TouchSpin is a jQuery plugin that provides a mobile and touch-friendly input spinner component for Bootstrap 3 & 4. It's a number input control with increment/decrement buttons and various configuration options for styling and behavior.

## Build System & Development Commands

The project uses **Grunt** as its build system:

- `npm run build` or `grunt default` - Full build pipeline: JSHint → concat → Babel → uglify → cssmin → update license
- `npm run check-build-integrity` or `grunt check-build-integrity` - Verifies dist folder is properly rebuilt (required before commits)
- `npm test` - Run Jest tests with Puppeteer (runs in band for stability)
- `grunt clean` - Clean the dist folder

## Architecture

### Source Structure
- **`src/`** - Source files (never edit `dist/` directly)
  - `jquery.bootstrap-touchspin.js` - Main jQuery plugin implementation 
  - `jquery.bootstrap-touchspin.css` - Component styles

### Build Output
- **`dist/`** - Generated files (concatenated, transpiled, minified versions)
  - Built files include version banner and are transpiled via Babel

### Testing
- **`__tests__/`** - Jest + Puppeteer integration tests
  - `basicOperations.test.ts` - Core functionality tests
  - `events.test.ts` - Event handling tests
  - `helpers/` - Test utilities and setup
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
- The build process includes JSHint linting, so code must pass linting before successful build

### Testing Environment  
- Uses Jest with Puppeteer for browser-based testing
- Test timeout set to 50 seconds for stability
- Multiple HTML fixtures test Bootstrap 3/4 compatibility and RTL support
- Tests run in band (`--runInBand`) to avoid race conditions

### Code Standards
- Follows jQuery Core Style Guide
- JSHint configuration in `.jshintrc`
- ES6+ code is transpiled via Babel for compatibility