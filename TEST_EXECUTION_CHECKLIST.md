# Bootstrap TouchSpin Test Execution Checklist

This document tracks the execution status of all tests in the Bootstrap TouchSpin test suite. Mark test files as passing when all individual tests within them pass, or failing if any test fails.

## How to Update This Checklist

### 1. Run All Tests
```bash
# Run tests with list reporter for detailed output
npx playwright test --reporter=list

# Or run with JSON reporter for programmatic parsing
npx playwright test --reporter=json > tmp/test-results.json
```

### 2. Parse Test Results
Use the dedicated parsing script to extract and format test results:

```bash
# Method 1: Save results to file, then parse
npx playwright test --reporter=json > tmp/test-results.json
node scripts/parse-test-results.js tmp/test-results.json

# Method 2: Pipe results directly (faster)
npx playwright test --reporter=json | node scripts/parse-test-results.js
```

The script will output:
- **Overview counters** to update the summary section
- **File status markers** showing which files pass/fail
- **Individual test results** for detailed checkbox updates

### 3. Update Checklist Manually
- Mark test files as `[x]` if ALL tests in the file pass
- Mark test files as `[ ]` if ANY test in the file fails  
- Mark individual tests: `[x]` for pass, `[-]` for fail, `[~]` for flaky
- Update the overview counters in the Test Suite Overview section
- Add the generated history log entry to the Test Execution History section

### 4. Single File Testing (Recommended for Development)
For faster feedback cycles when fixing specific issues:

```bash
# Test a single file and parse results
npx playwright test __tests__/basicOperations.test.ts --reporter=json > tmp/test-results.json
node scripts/parse-test-results.js tmp/test-results.json

# Or use the pipe method for single files
npx playwright test __tests__/basicOperations.test.ts --reporter=json | node scripts/parse-test-results.js
```

This approach allows you to:
- Quickly verify fixes without waiting for the full suite
- Update specific sections of the checklist incrementally
- Track progress on problematic test files

## Test Suite Overview
- **Total Test Files**: 42
- **Total Individual Tests**: 289
- **Files Passing**: 32/42
- **Tests Passing**: 237/289
- **Flaky Tests**: 0


### Files with Failing Tests
- [targetedCoverage.test.ts](./__tests__/targetedCoverage.test.ts) (4 failing)
- [visual/tailwind-visual.test.ts](./__tests__/visual/tailwind-visual.test.ts) (37 failing)
## 
## 
## 
## 
## 
## 
## 
## Test Files and Individual Tests

### __tests__/abCompare.test.ts
- [x] ArrowUp once produces same events pattern and value step
- [x] Typing 77 shows 77 until blur, then snaps to 75 (step enforcement)
- [x] Pressing Enter after typing 77 should sanitize to 75 (step enforcement)
- [x] Typing 7 at end of existing value 40 should result in 407 → 100 (max clamp) with single change event
- [x] Typing 77 after initial 40 creates 4077, Enter should sanitize to 100 with single change event
- [x] Min boundary events fire when clicking down to reach min and at min boundary
- [x] Max boundary events fire when clicking up to reach max and at max boundary
- [x] Min/Max events fire before change events (correct ordering)

### __tests__/abParitySequences.test.ts
- [x] boundary hold and disabled parity

### __tests__/advancedFeatures.test.ts
- [x] should respect data-bts-* attributes for configuration
- [x] should enforce step divisibility with round mode
- [x] should start spinning when holding down button
- [x] should stop spinning on mouseup
- [x] should respond to touch events
- [x] should apply callback functions for value processing
- [x] should fire custom spin events

### __tests__/apiMethods.test.ts
- [x] should respond to touchspin.uponce event
- [x] should respond to touchspin.downonce event
- [x] should respond to touchspin.startupspin event
- [x] should respond to touchspin.startdownspin event
- [x] should respond to touchspin.stopspin event
- [x] should update settings via touchspin.updatesettings event
- [x] should update min/max settings
- [x] should update step setting
- [x] should destroy TouchSpin via touchspin.destroy event
- [x] should clean up event handlers after destroy
- [x] should handle direct value changes and maintain consistency
- [x] should validate programmatically set values against constraints
- [x] should handle programmatic decimal value changes
- [x] should respond to attribute changes via mutation observer
- [x] should respond to readonly attribute changes
- [x] should respond to attribute removal
- [x] should allow method chaining after TouchSpin initialization
- [x] should work with multiple elements
- [x] should handle invalid settings gracefully
- [x] should handle missing jQuery gracefully

### __tests__/aria-sync.test.ts
- [x] aria attributes update on value change and settings updates
- [x] vertical buttons do not alter change emission semantics

### __tests__/basicOperations.test.ts
- [x] should render TouchSpin buttons and handle basic increment/decrement
- [x] should respect disabled and readonly states
- [x] should initialize with correct disabled state for pre-disabled inputs
- [x] should handle custom step values correctly
- [x] should handle min/max boundaries
- [x] should support keyboard navigation
- [x] should support mousewheel interaction
- [x] should handle decimal values correctly

### __tests__/browserNativeSpinners.test.ts
- [x] should respect native min/max when no TouchSpin min/max provided
- [x] should use native step when no TouchSpin step provided
- [x] should set native attributes to match TouchSpin settings on initialization
- [x] should update native attributes when TouchSpin settings are changed programmatically
- [x] should sync TouchSpin settings when native attributes are changed externally
- [x] should prioritize TouchSpin min/max over native when both are present
- [x] should set native attributes when no native attributes present
- [x] should respect TouchSpin max over native max
- [x] should use TouchSpin step setting over native step attribute
- [x] should handle decimal step conflicts correctly
- [ ] should use TouchSpin step=1 over native step=
- [x] text input should not have native attributes set
- [x] should show consistent TouchSpin button behavior across all input types
- [x] should not sync native attributes on non-number inputs
- [x] should respect TouchSpin disabled state for native spinners
- [x] should also disable TouchSpin buttons when input is disabled
- [x] should maintain TouchSpin event firing with native spinner usage
- [x] should handle booster functionality independently of native spinners

### __tests__/bs3Renderer.test.ts
- [x] should inject required data-touchspin-injected attributes
- [x] should use input-group-addon class for prefix and postfix
- [x] should handle basic increment/decrement
- [x] should display initial prefix/postfix
- [x] should handle vertical layout
- [x] should update prefix/postfix text via updatesettings
- [x] should update button text (buttonup_txt/buttondown_txt)
- [x] should update button classes (buttonup_class/buttondown_class)
- [x] should update addon classes (prefix_extraclass/postfix_extraclass)
- [x] should update vertical button classes
- [x] should update vertical button text
- [x] should not overwrite existing data-testid on advanced container
- [x] should update settings in advanced mode
- [x] should preserve existing container structure
- [x] should properly clean up on destroy
- [x] should remove all data-touchspin-injected elements
- [x] should apply correct size classes
- [x] should generate correct Bootstrap 3 markup structure

### __tests__/bs4Renderer.test.ts
- [x] should inject required data-touchspin-injected attributes
- [x] should use input-group-text class for prefix and postfix
- [x] should handle basic increment/decrement
- [x] should display initial prefix/postfix
- [x] should handle vertical layout
- [x] should update prefix/postfix text via updatesettings
- [x] should update button text (buttonup_txt/buttondown_txt)
- [x] should update button classes (buttonup_class/buttondown_class)
- [x] should update addon classes (prefix_extraclass/postfix_extraclass)
- [x] should update vertical button classes
- [x] should update vertical button text
- [x] should not overwrite existing data-testid on advanced container
- [x] should update settings in advanced mode
- [x] should preserve existing container structure
- [x] should properly clean up on destroy
- [x] should remove all data-touchspin-injected elements
- [x] should apply correct size classes
- [x] should generate correct Bootstrap 4 markup structure

### __tests__/bs5Renderer.test.ts
- [x] should inject required data-touchspin-injected attributes
- [x] should use input-group-text class for prefix and postfix
- [x] should handle basic increment/decrement
- [x] should display initial prefix/postfix
- [x] should handle vertical layout
- [x] should generate correct Bootstrap 5 markup structure
- [x] should update prefix/postfix text via updatesettings
- [x] should update button text (buttonup_txt/buttondown_txt)
- [x] should update button classes (buttonup_class/buttondown_class)
- [x] should update addon classes (prefix_extraclass/postfix_extraclass)
- [x] should update vertical button classes
- [x] should update vertical button text
- [x] should not overwrite existing data-testid on advanced container
- [x] should update settings in advanced mode
- [x] should preserve existing container structure
- [x] should properly clean up on destroy
- [x] should remove all data-touchspin-injected elements
- [x] should apply correct size classes
- [x] should generate correct Bootstrap 5 markup structure

### __tests__/buildValidation.test.ts
- [x] Bootstrap 3 UMD build should work
- [x] Bootstrap 4 UMD build should work
- [x] Bootstrap 5 UMD build should work
- [x] Tailwind build should work

### __tests__/callbackTests.test.ts
- [x] should apply initial currency formatting callback on load
- [x] should apply callbacks when clicking up button
- [x] should apply callbacks when clicking down button
- [x] should apply callbacks on value update via blur/navigation
- [x] should handle spinning up to max value with callbacks
- [x] should handle spinning down to min value with callbacks
- [x] should handle invalid input with callbacks gracefully
- [x] should apply numeral.js callbacks on initial load
- [x] should apply numeral.js callbacks when clicking up button
- [x] should apply numeral.js callbacks when clicking down button
- [x] should handle manual entry with numeral.js callbacks
- [x] should handle spinning up to max with numeral.js callbacks
- [x] should fire change events with decorated values during continuous operations

### __tests__/coreEventCleanup.test.ts
- [x] should clean up DOM events on destroy

### __tests__/coreLifecycle.test.ts
- [x] should not respond to commands after destroy (core-only)
- [x] should properly reinitialize after destroy (core-only)

### __tests__/crossApiLifecycle.test.ts
- [x] should handle jQuery init → core destroy cleanly
- [x] should verify orphaned jQuery events after core destroy
- [x] should expose core exports for cross-API testing

### __tests__/customEvents.test.ts
- [x] should handle touchspin.uponce event
- [x] should handle touchspin.downonce event
- [x] should handle touchspin.startupspin event
- [x] should handle touchspin.startdownspin event
- [x] should handle touchspin.stopspin event
- [x] should handle multiple uponce events in sequence
- [x] should handle multiple downonce events in sequence
- [x] should handle spin direction changes
- [x] should handle events on input with step constraints
- [x] should handle events on disabled input gracefully
- [x] should handle rapid event triggering

### __tests__/destroyAndReinitialize.test.ts
- [x] Test 1: New Container Creation - destroy and reinitialize
- [x] Test 2: Existing Container Enhancement - destroy and reinitialize
- [x] Test 3: Vertical Buttons - destroy and reinitialize
- [x] Event handlers are properly cleaned up after destroy
- [x] Multiple destroy calls should not cause errors

### __tests__/doubleInitAndNonInput.test.ts
- [ ] should detect non-input elements and log 

### __tests__/edgeCasesAndErrors.test.ts
- [x] should use firstclickvalueifempty when clicking on empty input
- [x] should fall back to midpoint when firstclickvalueifempty is null
- [x] should limit boost step size with maxboostedstep
- [x] should handle maxboostedstep=false (unlimited)
- [x] should handle invalid maxboostedstep values
- [x] should warn when both data-bts and individual attributes are present
- [x] should handle missing default renderer gracefully
- [x] should handle non-input elements appropriately
- [x] should handle renderer constructor failure
- [x] should handle step divisibility edge cases
- [x] should handle empty input with replacementval
- [x] should handle decimal edge cases
- [x] should handle rapid successive button clicks
- [x] should handle mouse wheel on disabled input
- [x] should handle multiple destroy calls safely

### __tests__/events.test.ts
- [x] should increase value by 1 when clicking the + button
- [x] should fire the change event only once when updating the value
- [x] should fire the change event exactly once when entering a proper value and pressing TAB
- [x] Should fire change event when pressing TAB (focus loss triggers sanitization)
- [x] Should fire the change event only once when correcting the value according to step after focus loss
- [x] Should not fire change event when already at max value and entering a higher value
- [x] Should not fire change event when already at min value and entering a lower value
- [x] Should use the callback on the initial value
- [x] Should have the decorated value when firing the change event
- [x] Should have the decorated value on blur
- [x] The touchspin.on.min and touchspin.on.max events should fire as soon as the value reaches the minimum or maximum value

### __tests__/focusout-behavior.test.ts
- [x] clicking body without leaving widget does not sanitize
- [x] sanity: no touchspin doc-level listeners (post-refactor)
- [x] NEW TARGET: focus moving within widget should not sanitize
- [x] NEW TARGET: leaving widget completely should sanitize
- [x] BEHAVIOR: change fires for button spins and sanitize, not updatesettings
- [x] CLEANUP BEHAVIOR: destroy should remove all listeners
- [x] replacementval on empty input emits change once

### __tests__/investigate-real-behavior.test.ts
- [x] Is there actually a document listener problem?
- [x] What about the change event behavior?
- [x] Memory leak investigation: are there actually leaked listeners?

### __tests__/jqueryEventCleanup.test.ts
- [x] should clean up jQuery events on destroy

### __tests__/jqueryPluginLifecycle.test.ts
- [x] should not respond to commands after destroy
- [x] should properly reinitialize after destroy

### __tests__/keyboardAccessibility.test.ts
- [x] should handle Enter key on up button
- [x] should handle Space key on down button
- [x] should handle Enter key on down button
- [x] should handle held Space key for spinning
- [x] should prevent default behavior on Space and Enter keys
- [x] should ignore other keys on buttons
- [x] should handle rapid key events correctly

### __tests__/modernCore.test.ts
- [x] Modern core should handle disabled/readonly checks
- [x] Modern core should emit proper events
- [x] Modern core should handle step alignment correctly

### __tests__/nativeAttributeSync.test.ts
- [x] should demonstrate native attribute synchronization - step changes affect increment behavior
- [x] should demonstrate attribute removal synchronization

### __tests__/renderers.test.ts
- [x] should maintain consistent button behavior across Bootstrap versions
- [x] should generate valid HTML structure for all versions
- [x] should maintain consistent data-touchspin-injected attributes across versions
- [x] should maintain consistent functional behavior across all renderers

### __tests__/rtlSupport.test.ts
- [x] should render and function correctly in RTL layout
- [x] should handle vertical buttons and prefix/postfix in RTL
- [x] should render and function correctly in RTL layout
- [x] should render and function correctly in RTL layout
- [x] should handle Bootstrap 5 structure without deprecated classes
- [x] should handle manual text input correctly in RTL

### __tests__/settingsPrecedence.test.ts
- [x] should preserve user button text over renderer defaults
- [x] should preserve user prefix and postfix content
- [x] should preserve user vertical button content
- [x] should preserve user classes over renderer defaults
- [x] should preserve user numerical settings
- [x] should preserve user decimal formatting settings
- [x] should respect user min/max constraints
- [x] should respect data attribute settings when no JS settings provided
- [x] should allow JS settings to override data attributes
- [x] should handle programmatic settings updates correctly

### __tests__/spinBoundariesWrapper.test.ts
- [x] stops at max and allows downOnce
- [x] stops at min and allows upOnce

### __tests__/tailwindRenderer.test.ts
- [x] should inject required data-touchspin-injected attributes
- [x] should work without any Bootstrap CSS dependencies
- [x] should not include any Bootstrap-specific classes
- [x] should handle basic increment/decrement
- [x] should display initial prefix/postfix
- [x] should handle vertical layout
- [x] should update prefix/postfix text via updatesettings
- [x] should update button text (buttonup_txt/buttondown_txt)
- [x] should update button classes (buttonup_class/buttondown_class)
- [x] should update addon classes (prefix_extraclass/postfix_extraclass)
- [x] should update vertical button classes
- [x] should update vertical button text
- [x] should not overwrite existing data-testid on advanced container
- [x] should update settings in advanced mode
- [x] should preserve existing container structure
- [x] should properly clean up on destroy
- [x] should remove all data-touchspin-injected elements
- [x] should apply correct size classes
- [x] should not include any Bootstrap-specific classes

### __tests__/targetedCoverage.test.ts
- [x] should warn about double initialization and destroy/reinitialize
- [x] should detect non-input elements and warn "Must be an input."
- [x] should fallback to step=1 when step=0
- [-] should fallback to step=1 when step is invalid
- [-] should fallback to step=1 when step is negative
- [x] should handle invalid min value and set to null
- [x] should handle invalid max value and set to null
- [x] should handle NaN min/max values
- [x] should fallback to decimals=0 when decimals is invalid
- [-] should fallback to decimals=0 when decimals is negative
- [x] should fallback to decimals=0 when decimals is NaN
- [-] should work with custom TestRenderer
- [x] should handle module environment detection
- [x] should handle extreme decimal values
- [x] should handle very large numbers

### __tests__/testidPropagation.test.ts
- [x] should propagate testid from input to new wrapper container
- [x] should propagate testid to existing input-group wrapper
- [x] should propagate testid for vertical buttons configuration
- [x] should not create wrapper testid when input has no testid
- [x] should maintain input functionality with propagated testids

### __tests__/uncoveredConfigurations.test.ts
- [x] should disable mousewheel when set to false
- [x] should disable booster acceleration when set to false
- [ ] should handle forcestepdivisibility: 
- [ ] should handle forcestepdivisibility: 
- [ ] should handle forcestepdivisibility: 
- [x] should handle empty initval
- [x] should handle null min/max values
- [x] should apply custom vertical button classes
- [x] should apply extra classes to prefix and postfix
- [x] should use custom button classes and text
- [x] should preserve user button classes over renderer defaults
- [x] should apply renderer defaults when user provides no button classes
- [x] should handle mixed user settings and renderer defaults
- [x] should respect data attribute settings over renderer defaults
- [x] should handle decimals=0 with decimal input
- [x] should handle high decimal precision
- [x] should use custom stepinterval and stepintervaldelay

### __tests__/verticalButtons.test.ts
- [x] should render vertical button structure correctly
- [x] should function correctly with vertical buttons
- [x] should work with size variations and prefix/postfix
- [x] should work with existing DOM input groups
- [x] should handle disabled state for vertical buttons
- [x] should support long press spinning for vertical buttons

### __tests__/visual/tailwind-visual.test.ts
- [-] default state
- [-] focused state
- [-] disabled state
- [-] readonly state
- [-] hover on up button
- [-] hover on down button
- [-] active up button
- [-] active down button
- [-] small size
- [-] default size
- [-] large size
- [-] extra large size
- [-] all sizes comparison
- [-] with currency prefix
- [-] with unit postfix
- [-] with both prefix and postfix
- [-] all prefix/postfix comparison
- [-] horizontal buttons
- [-] vertical buttons
- [-] custom button text
- [-] all button layouts comparison
- [-] 2 decimal places
- [-] 4 decimal places
- [-] all decimal variations
- [-] at minimum value
- [-] at maximum value
- [-] all min/max states
- [-] basic states section
- [-] full page snapshot
- [-] mobile viewport
- [-] tablet viewport
- [-] desktop viewport
- [-] after increment
- [-] after decrement
- [-] manual value entry
- [-] invalid manual entry - corrected to max
- [-] invalid manual entry - corrected to min

### __tests__/wrapperAdvancedExistingGroup.test.ts
- [x] BS3 advanced reuses addons and cleans up on destroy
- [x] BS4 advanced reuses prepend/append and cleans up on destroy
- [x] BS5 advanced reuses input-group-text and cleans up on destroy

### __tests__/wrapperAdvancedTailwindContainer.test.ts
- [x] enhances [data-touchspin-advanced] and cleans up on destroy

### __tests__/wrapperAttributeSync.test.ts
- [x] disabled/readonly stop spin and prevent changes
- [x] min/max/step sync via native attrs

### __tests__/wrapperBootstrapMarkup.test.ts
- [x] BS3 wrapper uses input-group-addon and input-group-btn (no BS4/5 wrappers)
- [x] BS4 wrapper uses prepend/append wrappers and input-group-text (no BS3 addon)
- [x] BS5 wrapper uses input-group-text without prepend/append wrappers

### __tests__/wrapperKeyboardWheel.test.ts
- [x] ArrowUp emits change and spin start/stop; wheel emits change only

## Usage Instructions

1. **For Test Files**: Mark `[x]` if ALL individual tests in the file pass, `[ ]` if ANY test fails
2. **For Individual Tests**: Mark `[x]` if passes, `[-]` if fails, `[~]` if flaky
3. **Update Counters**: Update the overview section with current pass/fail counts
4. **Update History Log**: Add new entries to the Test Execution History section
5. **Test Execution**: Use `scripts/parse-test-results.js` to generate formatted updates
6. **Single File Testing**: Test individual files for faster development cycles

## Notes

- This checklist covers the complete test suite as of the current codebase state
- Tests should be run against the modern architecture implementation
- Visual tests require screenshot comparison and may need baseline updates
- Some tests may be environment-specific (browser, viewport, etc.)
- Use `[x]` for passing tests, `[-]` for failing tests, `[~]` for flaky tests

## Test Execution History

Track test execution progress over time. Add new entries at the top.

```
Date/Time           | Tests | Passing | Failing | Flaky | Notes
2025-09-03 05:12:04 |     4 |       4 |       0 |     0 | Fixed buildValidation.test.ts: made touchspinHelpers renderer-agnostic
2025-09-03 05:03:25 |    33 |      28 |       5 |     0 | 3 more files now passing: abCompare, advancedFeatures, renderers
2025-09-03 04:26:10 |    16 |      16 |       0 |     0 | Fixed renderer tests: prefix/postfix visibility, Bootstrap markup, Tailwind classes
2025-09-03 01:11:54 |   289 |     237 |      52 |     0 | Full test suite run after ESLint cleanup
2025-09-03 00:33:52 |     3 |       2 |       1 |     0 | Updated 1 files, 4 tests
2025-09-03 00:33:22 |     2 |       2 |       0 |     0 | Updated 1 files, 2 tests
2025-09-03 00:15:18 |     2 |       2 |       0 |     0 | Updated 1 files, 2 tests
2025-09-03 00:14:25 |     3 |       2 |       1 |     0 | Updated 1 files, 4 tests
2025-09-03 00:10:44 |     8 |       8 |       0 |     0 | Updated 1 files, 8 tests
2025-09-03 00:02:58 |     8 |       8 |       0 |     0 | Updated 1 files, 8 tests
2025-09-03 00:00:06 |     8 |       8 |       0 |     0 | Updated 1 files, 8 tests
2025-09-02 23:57:12 |   287 |     234 |      52 |     1 | Updated 42 files, 331 tests
2025-09-02 20:49:45 |   287 |     234 |      52 |     1 | Full test suite run - 76% files passing, main issues in visual tests
2025-09-02 20:39:04 |     2 |       1 |       0 |     1 | aria-sync.test.ts run - 1 flaky test detected
2025-09-02 20:31:43 |     8 |       8 |       0 |     0 | Initial basicOperations.test.ts run - all passing
```
