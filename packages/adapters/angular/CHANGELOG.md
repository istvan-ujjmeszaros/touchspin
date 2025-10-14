# @touchspin/angular

## 5.1.0-alpha.1

### Minor Changes

- e3fa1d4: feat(angular): add Angular adapter with ControlValueAccessor support

  Implements a comprehensive Angular 17+ adapter with:
  - Standalone component architecture (no NgModule required)
  - ControlValueAccessor for Template-driven and Reactive Forms integration
  - Per-renderer subpaths (bootstrap3, bootstrap4, bootstrap5, tailwind, vanilla)
  - Imperative API (focus, blur, increment, decrement, getValue, setValue, getCore)
  - SSR-safe with isPlatformBrowser guards for Angular Universal
  - Full TypeScript types with TouchSpinInputs, TouchSpinOutputs, TouchSpinHandle interfaces
  - Angular lifecycle hooks (ngAfterViewInit, ngOnChanges, ngOnDestroy)
  - Hidden native input for form submission
  - Comprehensive README with usage examples

  The adapter follows the same pattern as @touchspin/react with per-renderer components that extend a base TouchSpinComponent and inject their specific renderer.

### Patch Changes

- Updated dependencies
  - @touchspin/renderer-bootstrap3@5.0.1-alpha.1
  - @touchspin/renderer-bootstrap4@5.0.1-alpha.1
  - @touchspin/renderer-bootstrap5@5.0.1-alpha.1
  - @touchspin/renderer-tailwind@5.0.1-alpha.1
  - @touchspin/renderer-vanilla@5.0.1-alpha.1
  - @touchspin/core@5.0.1-alpha.0

## 5.0.1-alpha.0

### Patch Changes

- Updated dependencies
  - @touchspin/core@5.0.1-alpha.0
