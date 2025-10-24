# @touchspin/jquery

## 5.0.1

### Patch Changes

- a62e7b0: Generate minified release assets without source maps
  - Added `build:umd-release-*` scripts that generate minified UMD bundles
  - Updated `create-release-assets.mjs` to build and include only minified assets
  - Removed source map files from release assets (broken references after renaming)
  - Updated release notes to clarify assets are minified
  - Release consumers get production-ready files without source map issues

- 0233d2c: **Features:**
  - Added backward compatibility support for `$.fn.touchspin` (lowercase) in addition to `$.fn.TouchSpin` (uppercase)
  - Both method names now work identically for initializing TouchSpin on jQuery elements
- 5148aa4: **Improvements:**
  - Enhanced type safety with proper TypeScript interfaces
  - Fixed biome linting warnings (reduced from 396 to 217)
  - Improved developer experience with better error handling
  - Enhanced code maintainability

  **Infrastructure:**
  - Updated release workflow to enable GitHub releases for alpha versions
  - Improved artifact generation to upload specific UMD builds instead of entire dist directories
  - Enhanced release process for better user experience

- d2e57e2: Add cancelable events and speed change events, fix release assets

  ### Features
  - Add cancelable change events (`change:start`, `change:end`) that can be prevented by calling `event.preventDefault()`
  - Add speed change events (`speedchange`) that fire when the spin speed changes between normal/fast modes
  - Add `cancelable` option to enable/disable cancelable events (default: false)

  ### Documentation
  - Update event matrix documentation with comprehensive event reference
  - Add examples of new cancelable and speed change events in README and package docs
  - Document event payloads, timing, and cancelable event usage patterns

  ### Bug Fixes
  - Fix release assets script to include all packages and provide proper naming
  - Previously only jQuery adapter assets were included in releases
  - Now includes standalone ESM bundles, web component UMD bundles, and CSS stylesheets
  - Renamed assets with consistent, unique naming scheme for better CDN compatibility
  - Added comprehensive release notes explaining each asset type

- a1aaf48: docs: refresh CDN guidance and browser ESM examples
- b05a05c: TouchSpin v5.0.0 Alpha Release

  This is the first alpha release of TouchSpin v5, featuring a completely rewritten architecture:

  **New Features:**
  - Modular renderer system (Bootstrap 3/4/5, Tailwind, Vanilla CSS)
  - Standalone, jQuery, and Web Component adapters
  - Full TypeScript support with complete type definitions
  - Comprehensive test coverage (1000+ tests)
  - Modern ESM and UMD builds
  - Enhanced accessibility (ARIA compliance)

  **Breaking Changes:**
  - Complete API redesign from v4.x
  - New package structure with scoped @touchspin/\* packages
  - Renamed main package from `bootstrap-touchspin` to `@touchspin/core`

  **Alpha Notice:**
  This is an alpha release for early testing. API may change before stable release.

- Updated dependencies [5148aa4]
- Updated dependencies [d2e57e2]
- Updated dependencies [0791283]
- Updated dependencies [a1aaf48]
- Updated dependencies [b05a05c]
  - @touchspin/standalone@5.0.1

## 5.0.1-alpha.10

### Patch Changes

- @touchspin/standalone@5.0.1-alpha.9

## 5.0.1-alpha.9

### Patch Changes

- **Features:**
  - Added backward compatibility support for `$.fn.touchspin` (lowercase) in addition to `$.fn.TouchSpin` (uppercase)
  - Both method names now work identically for initializing TouchSpin on jQuery elements
- Updated dependencies [0791283]
  - @touchspin/standalone@5.0.1-alpha.8

## 5.0.1-alpha.8

### Patch Changes

- a62e7b0: Generate minified release assets without source maps
  - Added `build:umd-release-*` scripts that generate minified UMD bundles
  - Updated `create-release-assets.mjs` to build and include only minified assets
  - Removed source map files from release assets (broken references after renaming)
  - Updated release notes to clarify assets are minified
  - Release consumers get production-ready files without source map issues

## 5.0.1-alpha.7

### Patch Changes

- Fix release assets script to include all packages and provide proper naming
  - Previously only jQuery adapter assets were included in releases
  - Now includes standalone ESM bundles, web component UMD bundles, and CSS stylesheets
  - Renamed assets with consistent, unique naming scheme for better CDN compatibility
  - Added comprehensive release notes explaining each asset type

- Updated dependencies
  - @touchspin/standalone@5.0.1-alpha.7

## 5.0.1-alpha.6

### Patch Changes

- 5148aa4: **Improvements:**
  - Enhanced type safety with proper TypeScript interfaces
  - Fixed biome linting warnings (reduced from 396 to 217)
  - Improved developer experience with better error handling
  - Enhanced code maintainability

  **Infrastructure:**
  - Updated release workflow to enable GitHub releases for alpha versions
  - Improved artifact generation to upload specific UMD builds instead of entire dist directories
  - Enhanced release process for better user experience

- Updated dependencies [5148aa4]
  - @touchspin/standalone@5.0.1-alpha.6

## 5.0.1-alpha.5

### Patch Changes

- docs: refresh CDN guidance and browser ESM examples
- Updated dependencies
  - @touchspin/standalone@5.0.1-alpha.5

## 5.0.1-alpha.4

### Patch Changes

- @touchspin/standalone@5.0.1-alpha.4

## 5.0.1-alpha.3

### Patch Changes

- @touchspin/standalone@5.0.1-alpha.3

## 5.0.1-alpha.2

### Patch Changes

- @touchspin/standalone@5.0.1-alpha.2

## 5.0.1-alpha.1

### Patch Changes

- @touchspin/standalone@5.0.1-alpha.1

## 5.0.1-alpha.0

### Patch Changes

- TouchSpin v5.0.0 Alpha Release

  This is the first alpha release of TouchSpin v5, featuring a completely rewritten architecture:

  **New Features:**
  - Modular renderer system (Bootstrap 3/4/5, Tailwind, Vanilla CSS)
  - React adapter with per-renderer subpath exports
  - Standalone, jQuery, and Web Component adapters
  - Full TypeScript support with complete type definitions
  - Comprehensive test coverage (1000+ tests)
  - Modern ESM and UMD builds
  - Enhanced accessibility (ARIA compliance)

  **Breaking Changes:**
  - Complete API redesign from v4.x
  - New package structure with scoped @touchspin/\* packages
  - Renamed main package from `bootstrap-touchspin` to `@touchspin/core`

  **Alpha Notice:**
  This is an alpha release for early testing. API may change before stable release.

- Updated dependencies
  - @touchspin/standalone@5.0.1-alpha.0
