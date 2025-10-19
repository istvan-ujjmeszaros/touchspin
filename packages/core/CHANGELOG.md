# @touchspin/core

## 5.0.1-alpha.4

### Patch Changes

- Fix release assets script to include all packages and provide proper naming
  - Previously only jQuery adapter assets were included in releases
  - Now includes standalone ESM bundles, web component UMD bundles, and CSS stylesheets
  - Renamed assets with consistent, unique naming scheme for better CDN compatibility
  - Added comprehensive release notes explaining each asset type

## 5.0.1-alpha.3

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

## 5.0.1-alpha.2

### Patch Changes

- Fix: Programmatic `setValue` now triggers a `change` event to ensure framework compatibility. This aligns the behavior with the original jQuery plugin and user expectations, fixing integrations with frameworks like Angular, React, and Vue.

## 5.0.1-alpha.1

### Patch Changes

- 2103452: Align core version with other packages

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
