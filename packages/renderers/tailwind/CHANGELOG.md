# @touchspin/renderer-tailwind

## 5.0.1-alpha.4

### Patch Changes

- docs: refresh CDN guidance and browser ESM examples

## 5.0.1-alpha.3

### Patch Changes

- Updated dependencies
  - @touchspin/core@5.0.1-alpha.2

## 5.0.1-alpha.2

### Patch Changes

- Updated dependencies [2103452]
  - @touchspin/core@5.0.1-alpha.1

## 5.0.1-alpha.1

### Patch Changes

- fix: replace workspace:\* with 5.0.1-alpha.0 in renderer dependencies

  Published renderer packages contained invalid workspace:\* references for @touchspin/core dependency, preventing external consumers from installing them. This fixes the dependency to reference the published version 5.0.1-alpha.0 instead.

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
  - @touchspin/core@5.0.1-alpha.0
