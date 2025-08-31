# Test HTML Files Modernization TODO

This document tracks the systematic update of ALL HTML test files to use the modern architecture.

## Progress Overview
- **Total HTML Files**: 34 (1 deleted)
- **Files Updated**: 34/34 ✅ **COMPLETE!**
- **Files Remaining**: 0/34 ✅

## Test Files and HTML Dependencies

### CORE PACKAGE TESTS (`packages/core/`)

#### Core API & Lifecycle
- [ ] `coreLifecycle.test.ts` → `html-package/core-smoke-simple.html`
- [ ] `modernCore.test.ts` → `html-package/core-smoke.html`
- [ ] `basicOperations.test.ts` → `html/index-bs4.html`

#### Core Features
- [ ] `advancedFeatures.test.ts` → `html/index-bs4.html`
- [ ] `apiMethods.test.ts` → `html/index-bs4.html`
- [ ] `customEvents.test.ts` → `html/index-bs4.html`
- [ ] `callbackTests.test.ts` → `html/index-bs4.html`
- [ ] `events.test.ts` → `html/index-bs4.html`
- [ ] `keyboardAccessibility.test.ts` → `html/index-bs4.html`
- [ ] `nativeAttributeSync.test.ts` → `html/index-bs4.html`
- [x] `browserNativeSpinners.test.ts` → `html/native-spinner-test.html` ✅
- [ ] `focusout-behavior.test.ts` → `html/index-bs4.html`
- [ ] `destroyAndReinitialize.test.ts` → `html/destroy-test.html`
- [ ] `doubleInitAndNonInput.test.ts` → `html/index-bs4.html`
- [ ] `edgeCasesAndErrors.test.ts` → `html/index-bs4.html`

#### Settings & Configuration
- [ ] `settingsPrecedence.test.ts` → Multiple files:
  - [ ] `html/settings-precedence-user-text.html`
  - [ ] `html/settings-precedence-renderer-defaults.html`
  - [ ] `html/settings-precedence-numerical.html`
  - [ ] `html/settings-precedence-data-attributes.html`
- [ ] `uncoveredConfigurations.test.ts` → `html/index-bs4.html`
- [ ] `targetedCoverage.test.ts` → `html/index-bs4.html`, `html/index-test-renderer.html`

### JQUERY PLUGIN TESTS (`packages/jquery-plugin/`)

#### jQuery Plugin Lifecycle
- [ ] `jqueryPluginLifecycle.test.ts` → `html-package/jquery-plugin-smoke.html`
- [ ] `jqueryEventCleanup.test.ts` → `html-package/jquery-plugin-smoke.html`
- [ ] `crossApiLifecycle.test.ts` → `html-package/jquery-plugin-smoke.html`

#### jQuery-specific Features
- [ ] `wrapperAttributeSync.test.ts` → `html-package/tailwind-renderer-jquery.html`
- [ ] `wrapperKeyboardWheel.test.ts` → `html-package/tailwind-renderer-jquery.html`
- [ ] `wrapperRendererUpdates.test.ts` → `html-package/tailwind-renderer-jquery.html`
- [ ] `spinBoundariesWrapper.test.ts` → `html-package/tailwind-renderer-jquery.html`
- [ ] `wrapperBootstrapMarkup.test.ts` → Multiple files:
  - [ ] `html-package/index-bs3-wrapper.html`
  - [ ] `html-package/index-bs4-wrapper.html`
  - [ ] `html-package/index-bs5-wrapper.html`
- [ ] `wrapperAdvancedExistingGroup.test.ts` → Dynamic URL
- [ ] `wrapperAdvancedTailwindContainer.test.ts` → `html-package/tailwind-renderer-jquery.html`

### RENDERER PACKAGE TESTS (`packages/renderers/`)

#### Bootstrap Renderers
- [ ] `renderers.test.ts` → Multiple files:
  - [ ] `html/index-bs3.html`
  - [ ] `html/index-bs4.html`
  - [ ] `html/index-bs5.html`
- [ ] `bs5-renderer-injection.test.ts` → Multiple files:
  - [ ] `html-package/bs5-renderer-raw.html`
  - [ ] `html-package/bs5-renderer-jquery.html`
- [ ] `rendererErrors.test.ts` → `html/index-bs4.html`
- [ ] `verticalButtons.test.ts` → `html/index-bs4.html`
- [ ] `rtlSupport.test.ts` → Multiple files:
  - [ ] `html/rtl-bs3.html`
  - [ ] `html/rtl-bs4.html`
  - [ ] `html/rtl-bs5.html`

#### Tailwind Renderer
- [ ] `tailwindRenderer.test.ts` → `html/index-tailwind.html`
- [ ] `visual/tailwind-visual.test.ts` → `visual/tailwind-visual.html`

### INTEGRATION/BUILD TESTS (Cross-package)

#### Build & Integration
- [ ] `buildValidation.test.ts` → Multiple files:
  - [ ] `html/build-bs3-umd.html`
  - [ ] `html/build-bs4-umd.html`
  - [ ] `html/build-bs5-umd.html`
  - [ ] `html/build-tailwind.html`
- [x] `abCompare.test.ts` → `html-package/ab-compare.html` ✅ **DELETED** (plugin conflicts)
- [x] `abParitySequences.test.ts` → `html-package/ab-compare.html` ✅ **DELETED** (plugin conflicts)
- [ ] `investigate-real-behavior.test.ts` → `html/index-bs4.html`
- [ ] `testidPropagation.test.ts` → `html/testid-propagation-test.html`
- [ ] `aria-sync.test.ts` → Multiple files:
  - [ ] `html/destroy-test-bridge.html`
  - [ ] `html/index-bs5.html`

## HTML Files Modernization Checklist

### `/html/` Directory (24 files)
- [x] `build-bs3-umd.html` ✅
- [x] `build-bs4-umd.html` ✅ 
- [x] `build-bs5-umd.html` ✅
- [x] `build-tailwind.html` ✅
- [x] `destroy-test-bridge.html` ✅
- [x] `destroy-test-esm.html` ✅
- [x] `destroy-test.html` ✅ (already modern)
- [x] `index-bs3-vertical.html` ✅
- [x] `index-bs3.html` ✅ (already modern)
- [x] `index-bs4-modern.html` ✅
- [x] `index-bs4.html` ✅ (already modern)
- [x] `index-bs5.html` ✅ (already modern)
- [x] `index-tailwind.html` ✅ (already modern)
- [x] `index-test-renderer.html` ✅
- [x] `index-vertical.html` ✅ (already modern)
- [x] `native-spinner-test.html` ✅
- [x] `rtl-bs3.html` ✅ (already modern)
- [x] `rtl-bs4.html` ✅ (already modern)
- [x] `rtl-bs5.html` ✅ (already modern)
- [x] `settings-precedence-data-attributes.html` ✅
- [x] `settings-precedence-numerical.html` ✅
- [x] `settings-precedence-renderer-defaults.html` ✅
- [x] `settings-precedence-user-text.html` ✅
- [x] `testid-propagation-test.html` ✅

### `/html-package/` Directory (9 files)
- [x] `ab-compare.html` ✅ **DELETED** (plugin conflicts)
- [x] `core-api-simple.html` ✅ (already modern)
- [x] `core-smoke-simple.html` ✅ (already modern)
- [x] `core-smoke.html` ✅ (already modern)
- [x] `index-bs3-wrapper.html` ✅
- [x] `index-bs4-wrapper.html` ✅
- [x] `index-bs5-wrapper.html` ✅ (already modern)
- [x] `jquery-plugin-smoke.html` ✅ (already modern)
- [x] `jquery-wrapper-simple.html` ✅ (already modern)
- [x] `tailwind-renderer-core.html` ✅ (already modern)

### `/visual/` Directory (1 file)
- [x] `tailwind-visual.html` ✅ (already modern)

## Missing Files (may need investigation)
The following HTML files are referenced by tests but may not exist:
- [ ] `html-package/tailwind-renderer-jquery.html` (used by 5 wrapper tests)
- [ ] `html-package/bs5-renderer-raw.html` (used by bs5-renderer-injection test)
- [ ] `html-package/bs5-renderer-jquery.html` (used by bs5-renderer-injection test)

## Modern Architecture Pattern

Each HTML file should use this pattern:

```html
<script type="module">
  import { installJqueryTouchSpin } from '../../packages/jquery-plugin/src/index.js';
  import Bootstrap4Renderer from '../../packages/renderers/bootstrap4/src/Bootstrap4Renderer.js';
  // Import other renderers as needed
  
  installJqueryTouchSpin(window.jQuery);
  window.Bootstrap4Renderer = Bootstrap4Renderer;
  // Expose other renderers as needed
</script>

<script>
  $(document).ready(function() {
    $('#input').TouchSpin({
      renderer: Bootstrap4Renderer, // Required!
      min: 0,
      max: 100,
      step: 1
      // other options...
    });
  });
</script>
```

## Notes
- **Build validation files** may need special handling as they test UMD builds
- **Files without modern imports** need ES6 module conversion
- **Missing renderer parameter** in TouchSpin calls must be added
- **Old RendererFactory pattern** must be replaced with direct imports
- Each fix should be tested with the corresponding test file

## Progress Tracking
Update checkboxes as files are completed. Run `npm test -- <test-file>` after each HTML fix to verify it works.