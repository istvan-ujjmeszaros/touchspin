# HTML File Usage Documentation

This document tracks HTML file usage across Playwright tests and provides package ownership information for future test organization.

## Test File to Package Mapping

### CORE PACKAGE TESTS (`packages/core/`)
Tests that primarily test core TouchSpin functionality, direct API, lifecycle management:

**Core API & Lifecycle:**
- `coreLifecycle.test.ts` → `html-package/core-smoke-simple.html`
- `modernCore.test.ts` → `html-package/core-smoke.html`
- `basicOperations.test.ts` → `html/index-bs4.html`

**Core Features:**
- `advancedFeatures.test.ts` → `html/index-bs4.html`
- `apiMethods.test.ts` → `html/index-bs4.html`
- `customEvents.test.ts` → `html/index-bs4.html`
- `callbackTests.test.ts` → `html/index-bs4.html`
- `events.test.ts` → `html/index-bs4.html`
- `keyboardAccessibility.test.ts` → `html/index-bs4.html`
- `nativeAttributeSync.test.ts` → `html/index-bs4.html`
- `browserNativeSpinners.test.ts` → `html/native-spinner-test.html` ✅ **FIXED**
- `focusout-behavior.test.ts` → `html/index-bs4.html`
- `destroyAndReinitialize.test.ts` → `html/destroy-test.html`
- `doubleInitAndNonInput.test.ts` → `html/index-bs4.html`
- `edgeCasesAndErrors.test.ts` → `html/index-bs4.html`

**Settings & Configuration:**
- `settingsPrecedence.test.ts` → Multiple settings HTML files:
  - `html/settings-precedence-user-text.html`
  - `html/settings-precedence-renderer-defaults.html`
  - `html/settings-precedence-numerical.html`
  - `html/settings-precedence-data-attributes.html`
- `uncoveredConfigurations.test.ts` → `html/index-bs4.html`
- `targetedCoverage.test.ts` → `html/index-bs4.html`, `html/index-test-renderer.html`

### JQUERY PLUGIN TESTS (`packages/jquery-plugin/`)
Tests that specifically test the jQuery wrapper functionality:

**jQuery Plugin Lifecycle:**
- `jqueryPluginLifecycle.test.ts` → `html-package/jquery-plugin-smoke.html`
- `jqueryEventCleanup.test.ts` → `html-package/jquery-plugin-smoke.html`
- `crossApiLifecycle.test.ts` → `html-package/jquery-plugin-smoke.html`

**jQuery-specific Features:**
- `wrapperAttributeSync.test.ts` → `html-package/tailwind-renderer-jquery.html`
- `wrapperKeyboardWheel.test.ts` → `html-package/tailwind-renderer-jquery.html`
- `wrapperRendererUpdates.test.ts` → `html-package/tailwind-renderer-jquery.html`
- `spinBoundariesWrapper.test.ts` → `html-package/tailwind-renderer-jquery.html`
- `wrapperBootstrapMarkup.test.ts` → Bootstrap wrapper files:
  - `html-package/index-bs3-wrapper.html`
  - `html-package/index-bs4-wrapper.html`
  - `html-package/index-bs5-wrapper.html`
- `wrapperAdvancedExistingGroup.test.ts` → Dynamic URL pattern
- `wrapperAdvancedTailwindContainer.test.ts` → `html-package/tailwind-renderer-jquery.html`

### RENDERER PACKAGE TESTS (`packages/renderers/`)

**Bootstrap Renderers:**
- `renderers.test.ts` → Bootstrap version files:
  - `html/index-bs3.html`
  - `html/index-bs4.html`
  - `html/index-bs5.html`
- `bs5-renderer-injection.test.ts` → Modern renderer files:
  - `html-package/bs5-renderer-raw.html`
  - `html-package/bs5-renderer-jquery.html`
- `rendererErrors.test.ts` → `html/index-bs4.html`
- `verticalButtons.test.ts` → `html/index-bs4.html`
- `rtlSupport.test.ts` → RTL files:
  - `html/rtl-bs3.html`
  - `html/rtl-bs4.html`
  - `html/rtl-bs5.html`

**Tailwind Renderer:**
- `tailwindRenderer.test.ts` → `html/index-tailwind.html`
- `visual/tailwind-visual.test.ts` → `visual/tailwind-visual.html`

### INTEGRATION/BUILD TESTS (Cross-package)
Tests that verify integration across multiple packages:

**Build & Integration:**
- `buildValidation.test.ts` → Build files (keep as-is - test UMD builds):
  - `html/build-bs3-umd.html`
  - `html/build-bs4-umd.html`
  - `html/build-bs5-umd.html`
  - `html/build-tailwind.html`
- `abCompare.test.ts` → `html-package/ab-compare.html` ✅ **FIXED**
- `abParitySequences.test.ts` → `html-package/ab-compare.html` ✅ **FIXED**
- `investigate-real-behavior.test.ts` → `html/index-bs4.html`
- `testidPropagation.test.ts` → Uses localhost URL
- `aria-sync.test.ts` → Multiple files:
  - `html/destroy-test-bridge.html`
  - `html/index-bs5.html`

## HTML File Status

### ✅ Active Files (Used by Tests)

#### `/html/` Directory:
- `index-bs3.html` - Bootstrap 3 renderer tests
- `index-bs4.html` - Bootstrap 4 renderer tests + many core tests
- `index-bs5.html` - Bootstrap 5 renderer tests
- `index-tailwind.html` - Tailwind renderer tests
- `native-spinner-test.html` - Browser native spinner tests ✅ **FIXED**
- `destroy-test.html` - Destroy/reinitialize tests
- `destroy-test-bridge.html` - ARIA sync tests
- `rtl-bs3.html`, `rtl-bs4.html`, `rtl-bs5.html` - RTL support tests
- `build-bs3-umd.html`, `build-bs4-umd.html`, `build-bs5-umd.html`, `build-tailwind.html` - Build validation
- `settings-precedence-*.html` (4 files) - Settings precedence tests
- `index-test-renderer.html` - Targeted coverage tests

#### `/html-package/` Directory:
- `core-smoke-simple.html` - Core lifecycle tests
- `core-smoke.html` - Modern core tests
- `jquery-plugin-smoke.html` - jQuery plugin tests
- `ab-compare.html` - A/B comparison tests ✅ **FIXED**
- `bs5-renderer-raw.html`, `bs5-renderer-jquery.html` - BS5 renderer injection tests
- `index-bs3-wrapper.html`, `index-bs4-wrapper.html`, `index-bs5-wrapper.html` - Bootstrap wrapper tests
- `tailwind-renderer-jquery.html` - Tailwind jQuery wrapper tests

#### `/visual/` Directory:
- `tailwind-visual.html` - Tailwind visual tests

### 🔄 Potentially Stale Files (Not Directly Referenced)

These files might be useful for manual testing - **DO NOT DELETE**:

#### `/html/` Directory:
- `destroy-test-esm.html` - ESM version of destroy test (manual testing)
- `index-bs3-vertical.html` - Vertical buttons for BS3 (manual testing)
- `index-bs4-modern.html` - Legacy dual test helper (manual testing)
- `index-vertical.html` - Generic vertical buttons test (manual testing)
- `testid-propagation-test.html` - Test ID propagation (manual testing)

#### `/html-package/` Directory:
- `core-api-simple.html` - Simplified core API (manual testing)
- `jquery-wrapper-simple.html` - Simplified jQuery wrapper (manual testing)
- `tailwind-renderer-core.html` - Core Tailwind renderer (manual testing)

## Recommended File Organization for Manual Testing

Create a new directory for stale files that might be useful for manual testing:

```
__tests__/
├── manual/           # New directory for manual testing files
│   ├── destroy-test-esm.html
│   ├── index-bs3-vertical.html
│   ├── index-bs4-modern.html
│   ├── index-vertical.html
│   ├── testid-propagation-test.html
│   ├── core-api-simple.html
│   ├── jquery-wrapper-simple.html
│   └── tailwind-renderer-core.html
├── html/             # Active test files
├── html-package/     # Active package-specific test files
└── visual/           # Visual test files
```

## Architecture Updates Applied

### ✅ Files Updated for Modern Architecture:
1. **`html/native-spinner-test.html`** - Updated to use modern imports:
   - Changed from old renderer imports to modern ES modules
   - Updated all TouchSpin initializations to include `renderer: Bootstrap4Renderer`

2. **`html-package/ab-compare.html`** - Updated to use modern imports:
   - Removed old renderer factory pattern
   - Added modern Bootstrap5Renderer import
   - Updated wrapper initialization to use `renderer: Bootstrap5Renderer`

### ✅ Files That Don't Need Updates:
- Build validation files (`build-*.html`) - These correctly test UMD builds
- Files already using modern architecture (most files in `html/` and `html-package/`)

## Test Execution Notes

After HTML fixes are applied:
1. Run `browserNativeSpinners.test.ts` to verify native-spinner-test.html works
2. Run `abCompare.test.ts` and `abParitySequences.test.ts` to verify ab-compare.html works
3. All other tests should continue working as their HTML files were already updated

## Future Package Organization

When ready to move tests to package-specific directories:

```
packages/
├── core/
│   └── __tests__/
│       ├── lifecycle/
│       ├── features/
│       └── configuration/
├── jquery-plugin/
│   └── __tests__/
│       ├── lifecycle/
│       └── wrapper-features/
└── renderers/
    └── __tests__/
        ├── bootstrap/
        ├── tailwind/
        └── visual/
```

This organization will enable focused testing strategies for each component while maintaining clear separation of concerns.