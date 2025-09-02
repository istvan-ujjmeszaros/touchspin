# Bootstrap TouchSpin Test Checklist

This document tracks the execution status of all tests in the Bootstrap TouchSpin test suite. Mark test files as passing when all individual tests within them pass, or failing if any test fails.

## Test Suite Overview
- **Total Test Files**: 42
- **Total Individual Tests**: 375
- **Files Passing**: 0/42
- **Tests Passing**: 0/375

## Test Files and Individual Tests

### __tests__/abCompare.test.ts
- [ ] ArrowUp once produces same events pattern and value step
- [ ] Typing 77 shows 77 until blur, then snaps to 75 (step enforcement)
- [ ] Pressing Enter after typing 77 should sanitize to 75 (step enforcement)
- [ ] Typing 7 at end of existing value 40 should result in 407 → 100 (max clamp) with single change event
- [ ] Typing 77 after initial 40 creates 4077, Enter should sanitize to 100 with single change event
- [ ] Min boundary events fire when clicking down to reach min and at min boundary
- [ ] Max boundary events fire when clicking up to reach max and at max boundary
- [ ] Min/Max events fire before change events (correct ordering)

### __tests__/abParitySequences.test.ts
- [ ] boundary hold and disabled parity

### __tests__/advancedFeatures.test.ts
- [ ] should respect data-bts-* attributes for configuration
- [ ] should enforce step divisibility with round mode
- [ ] should start spinning when holding down button
- [ ] should stop spinning on mouseup
- [ ] should respond to touch events
- [ ] should apply callback functions for value processing
- [ ] should fire custom spin events

### __tests__/apiMethods.test.ts
- [ ] should respond to touchspin.uponce event
- [ ] should respond to touchspin.downonce event
- [ ] should respond to touchspin.startupspin event
- [ ] should respond to touchspin.startdownspin event
- [ ] should respond to touchspin.stopspin event
- [ ] should update settings via touchspin.updatesettings event
- [ ] should update min/max settings
- [ ] should update step setting
- [ ] should destroy TouchSpin via touchspin.destroy event
- [ ] should clean up event handlers after destroy
- [ ] should handle direct value changes and maintain consistency
- [ ] should validate programmatically set values against constraints
- [ ] should handle programmatic decimal value changes
- [ ] should respond to attribute changes via mutation observer
- [ ] should respond to readonly attribute changes
- [ ] should respond to attribute removal
- [ ] should allow method chaining after TouchSpin initialization
- [ ] should work with multiple elements
- [ ] should handle invalid settings gracefully
- [ ] should handle missing jQuery gracefully

### __tests__/aria-sync.test.ts
- [ ] aria attributes update on value change and settings updates
- [ ] vertical buttons do not alter change emission semantics

### __tests__/basicOperations.test.ts
- [ ] should render TouchSpin buttons and handle basic increment/decrement
- [ ] should respect disabled and readonly states
- [ ] should initialize with correct disabled state for pre-disabled inputs
- [ ] should handle custom step values correctly
- [ ] should handle min/max boundaries
- [ ] should support keyboard navigation
- [ ] should support mousewheel interaction
- [ ] should handle decimal values correctly

### __tests__/browserNativeSpinners.test.ts
- [ ] should respect native min/max when no TouchSpin min/max provided
- [ ] should use native step when no TouchSpin step provided
- [ ] should set native attributes to match TouchSpin settings on initialization
- [ ] should update native attributes when TouchSpin settings are changed programmatically
- [ ] should sync TouchSpin settings when native attributes are changed externally
- [ ] should prioritize TouchSpin min/max over native when both are present
- [ ] should set native attributes when no native attributes present
- [ ] should respect TouchSpin max over native max
- [ ] should use TouchSpin step setting over native step attribute
- [ ] should handle decimal step conflicts correctly
- [ ] should use TouchSpin step=1 over native step=
- [ ] text input should not have native attributes set
- [ ] should show consistent TouchSpin button behavior across all input types
- [ ] should not sync native attributes on non-number inputs
- [ ] should respect TouchSpin disabled state for native spinners
- [ ] should also disable TouchSpin buttons when input is disabled
- [ ] should maintain TouchSpin event firing with native spinner usage
- [ ] should handle booster functionality independently of native spinners

### __tests__/bs3Renderer.test.ts
- [ ] should inject required data-touchspin-injected attributes
- [ ] should use input-group-addon class for prefix and postfix
- [ ] should handle basic increment/decrement
- [ ] should display initial prefix/postfix
- [ ] should handle vertical layout
- [ ] should update prefix/postfix text via updatesettings
- [ ] should update button text (buttonup_txt/buttondown_txt)
- [ ] should update button classes (buttonup_class/buttondown_class)
- [ ] should update addon classes (prefix_extraclass/postfix_extraclass)
- [ ] should update vertical button classes
- [ ] should update vertical button text
- [ ] should not overwrite existing data-testid on advanced container
- [ ] should update settings in advanced mode
- [ ] should preserve existing container structure
- [ ] should properly clean up on destroy
- [ ] should remove all data-touchspin-injected elements
- [ ] should apply correct size classes
- [ ] should generate correct Bootstrap 3 markup structure

### __tests__/bs4Renderer.test.ts
- [ ] should inject required data-touchspin-injected attributes
- [ ] should use input-group-text class for prefix and postfix
- [ ] should handle basic increment/decrement
- [ ] should display initial prefix/postfix
- [ ] should handle vertical layout
- [ ] should update prefix/postfix text via updatesettings
- [ ] should update button text (buttonup_txt/buttondown_txt)
- [ ] should update button classes (buttonup_class/buttondown_class)
- [ ] should update addon classes (prefix_extraclass/postfix_extraclass)
- [ ] should update vertical button classes
- [ ] should update vertical button text
- [ ] should not overwrite existing data-testid on advanced container
- [ ] should update settings in advanced mode
- [ ] should preserve existing container structure
- [ ] should properly clean up on destroy
- [ ] should remove all data-touchspin-injected elements
- [ ] should apply correct size classes
- [ ] should generate correct Bootstrap 4 markup structure

### __tests__/bs5Renderer.test.ts
- [ ] should inject required data-touchspin-injected attributes
- [ ] should use input-group-text class for prefix and postfix
- [ ] should handle basic increment/decrement
- [ ] should display initial prefix/postfix
- [ ] should handle vertical layout
- [ ] should generate correct Bootstrap 5 markup structure
- [ ] should update prefix/postfix text via updatesettings
- [ ] should update button text (buttonup_txt/buttondown_txt)
- [ ] should update button classes (buttonup_class/buttondown_class)
- [ ] should update addon classes (prefix_extraclass/postfix_extraclass)
- [ ] should update vertical button classes
- [ ] should update vertical button text
- [ ] should not overwrite existing data-testid on advanced container
- [ ] should update settings in advanced mode
- [ ] should preserve existing container structure
- [ ] should properly clean up on destroy
- [ ] should remove all data-touchspin-injected elements
- [ ] should apply correct size classes
- [ ] should generate correct Bootstrap 5 markup structure

### __tests__/buildValidation.test.ts
- [ ] Bootstrap 3 UMD build should work
- [ ] Bootstrap 4 UMD build should work
- [ ] Bootstrap 5 UMD build should work
- [ ] Tailwind build should work

### __tests__/callbackTests.test.ts
- [ ] should apply initial currency formatting callback on load
- [ ] should apply callbacks when clicking up button
- [ ] should apply callbacks when clicking down button
- [ ] should apply callbacks on value update via blur/navigation
- [ ] should handle spinning up to max value with callbacks
- [ ] should handle spinning down to min value with callbacks
- [ ] should handle invalid input with callbacks gracefully
- [ ] should apply numeral.js callbacks on initial load
- [ ] should apply numeral.js callbacks when clicking up button
- [ ] should apply numeral.js callbacks when clicking down button
- [ ] should handle manual entry with numeral.js callbacks
- [ ] should handle spinning up to max with numeral.js callbacks
- [ ] should fire change events with decorated values during continuous operations

### __tests__/coreEventCleanup.test.ts
- [ ] should clean up DOM events on destroy

### __tests__/coreLifecycle.test.ts
- [ ] should not respond to commands after destroy (core-only)
- [ ] should properly reinitialize after destroy (core-only)

### __tests__/crossApiLifecycle.test.ts
- [ ] should handle jQuery init → core destroy cleanly
- [ ] should verify orphaned jQuery events after core destroy
- [ ] should expose core exports for cross-API testing

### __tests__/customEvents.test.ts
- [ ] should handle touchspin.uponce event
- [ ] should handle touchspin.downonce event
- [ ] should handle touchspin.startupspin event
- [ ] should handle touchspin.startdownspin event
- [ ] should handle touchspin.stopspin event
- [ ] should handle multiple uponce events in sequence
- [ ] should handle multiple downonce events in sequence
- [ ] should handle spin direction changes
- [ ] should handle events on input with step constraints
- [ ] should handle events on disabled input gracefully
- [ ] should handle rapid event triggering

### __tests__/destroyAndReinitialize.test.ts
- [ ] Test 1: New Container Creation - destroy and reinitialize
- [ ] Test 2: Existing Container Enhancement - destroy and reinitialize
- [ ] Test 3: Vertical Buttons - destroy and reinitialize
- [ ] Event handlers are properly cleaned up after destroy
- [ ] Multiple destroy calls should not cause errors

### __tests__/doubleInitAndNonInput.test.ts
- [ ] should detect non-input elements and log 

### __tests__/edgeCasesAndErrors.test.ts
- [ ] should use firstclickvalueifempty when clicking on empty input
- [ ] should fall back to midpoint when firstclickvalueifempty is null
- [ ] should limit boost step size with maxboostedstep
- [ ] should handle maxboostedstep=false (unlimited)
- [ ] should handle invalid maxboostedstep values
- [ ] should warn when both data-bts and individual attributes are present
- [ ] should handle missing default renderer gracefully
- [ ] should handle non-input elements appropriately
- [ ] should handle renderer constructor failure
- [ ] should handle step divisibility edge cases
- [ ] should handle empty input with replacementval
- [ ] should handle decimal edge cases
- [ ] should handle rapid successive button clicks
- [ ] should handle mouse wheel on disabled input
- [ ] should handle multiple destroy calls safely

### __tests__/events.test.ts
- [ ] should increase value by 1 when clicking the + button
- [ ] should fire the change event only once when updating the value
- [ ] should fire the change event exactly once when entering a proper value and pressing TAB
- [ ] Should fire change event when pressing TAB (focus loss triggers sanitization)
- [ ] Should fire the change event only once when correcting the value according to step after focus loss
- [ ] Should not fire change event when already at max value and entering a higher value
- [ ] Should not fire change event when already at min value and entering a lower value
- [ ] Should use the callback on the initial value
- [ ] Should have the decorated value when firing the change event
- [ ] Should have the decorated value on blur
- [ ] The touchspin.on.min and touchspin.on.max events should fire as soon as the value reaches the minimum or maximum value

### __tests__/focusout-behavior.test.ts
- [ ] clicking body without leaving widget does not sanitize
- [ ] sanity: no touchspin doc-level listeners (post-refactor)
- [ ] NEW TARGET: focus moving within widget should not sanitize
- [ ] NEW TARGET: leaving widget completely should sanitize
- [ ] BEHAVIOR: change fires for button spins and sanitize, not updatesettings
- [ ] CLEANUP BEHAVIOR: destroy should remove all listeners
- [ ] replacementval on empty input emits change once

### __tests__/investigate-real-behavior.test.ts
- [ ] Is there actually a document listener problem?
- [ ] What about the change event behavior?
- [ ] Memory leak investigation: are there actually leaked listeners?

### __tests__/jqueryEventCleanup.test.ts
- [ ] should clean up jQuery events on destroy

### __tests__/jqueryPluginLifecycle.test.ts
- [ ] should not respond to commands after destroy
- [ ] should properly reinitialize after destroy

### __tests__/keyboardAccessibility.test.ts
- [ ] should handle Enter key on up button
- [ ] should handle Space key on down button
- [ ] should handle Enter key on down button
- [ ] should handle held Space key for spinning
- [ ] should prevent default behavior on Space and Enter keys
- [ ] should ignore other keys on buttons
- [ ] should handle rapid key events correctly

### __tests__/modernCore.test.ts
- [ ] Modern core should handle disabled/readonly checks
- [ ] Modern core should emit proper events
- [ ] Modern core should handle step alignment correctly

### __tests__/nativeAttributeSync.test.ts
- [ ] should demonstrate native attribute synchronization - step changes affect increment behavior
- [ ] should demonstrate attribute removal synchronization

### __tests__/renderers.test.ts
- [ ] should maintain consistent button behavior across Bootstrap versions
- [ ] should generate valid HTML structure for all versions
- [ ] should maintain consistent data-touchspin-injected attributes across versions
- [ ] should maintain consistent functional behavior across all renderers

### __tests__/rtlSupport.test.ts
- [ ] should render and function correctly in RTL layout
- [ ] should handle vertical buttons and prefix/postfix in RTL
- [ ] should render and function correctly in RTL layout
- [ ] should render and function correctly in RTL layout
- [ ] should handle Bootstrap 5 structure without deprecated classes
- [ ] should handle manual text input correctly in RTL

### __tests__/settingsPrecedence.test.ts
- [ ] should preserve user button text over renderer defaults
- [ ] should preserve user prefix and postfix content
- [ ] should preserve user vertical button content
- [ ] should preserve user classes over renderer defaults
- [ ] should preserve user numerical settings
- [ ] should preserve user decimal formatting settings
- [ ] should respect user min/max constraints
- [ ] should respect data attribute settings when no JS settings provided
- [ ] should allow JS settings to override data attributes
- [ ] should handle programmatic settings updates correctly

### __tests__/spinBoundariesWrapper.test.ts
- [ ] stops at max and allows downOnce
- [ ] stops at min and allows upOnce

### __tests__/tailwindRenderer.test.ts
- [ ] should inject required data-touchspin-injected attributes
- [ ] should work without any Bootstrap CSS dependencies
- [ ] should not include any Bootstrap-specific classes
- [ ] should handle basic increment/decrement
- [ ] should display initial prefix/postfix
- [ ] should handle vertical layout
- [ ] should update prefix/postfix text via updatesettings
- [ ] should update button text (buttonup_txt/buttondown_txt)
- [ ] should update button classes (buttonup_class/buttondown_class)
- [ ] should update addon classes (prefix_extraclass/postfix_extraclass)
- [ ] should update vertical button classes
- [ ] should update vertical button text
- [ ] should not overwrite existing data-testid on advanced container
- [ ] should update settings in advanced mode
- [ ] should preserve existing container structure
- [ ] should properly clean up on destroy
- [ ] should remove all data-touchspin-injected elements
- [ ] should apply correct size classes
- [ ] should not include any Bootstrap-specific classes

### __tests__/targetedCoverage.test.ts
- [ ] should warn about double initialization and destroy/reinitialize
- [ ] should detect non-input elements and warn 
- [ ] should fallback to step=1 when step=0
- [ ] should fallback to step=1 when step is invalid
- [ ] should fallback to step=1 when step is negative
- [ ] should handle invalid min value and set to null
- [ ] should handle invalid max value and set to null
- [ ] should handle NaN min/max values
- [ ] should fallback to decimals=0 when decimals is invalid
- [ ] should fallback to decimals=0 when decimals is negative
- [ ] should fallback to decimals=0 when decimals is NaN
- [ ] should work with custom TestRenderer
- [ ] should handle module environment detection
- [ ] should handle extreme decimal values
- [ ] should handle very large numbers

### __tests__/testidPropagation.test.ts
- [ ] should propagate testid from input to new wrapper container
- [ ] should propagate testid to existing input-group wrapper
- [ ] should propagate testid for vertical buttons configuration
- [ ] should not create wrapper testid when input has no testid
- [ ] should maintain input functionality with propagated testids

### __tests__/uncoveredConfigurations.test.ts
- [ ] should disable mousewheel when set to false
- [ ] should disable booster acceleration when set to false
- [ ] should handle forcestepdivisibility: 
- [ ] should handle forcestepdivisibility: 
- [ ] should handle forcestepdivisibility: 
- [ ] should handle empty initval
- [ ] should handle null min/max values
- [ ] should apply custom vertical button classes
- [ ] should apply extra classes to prefix and postfix
- [ ] should use custom button classes and text
- [ ] should preserve user button classes over renderer defaults
- [ ] should apply renderer defaults when user provides no button classes
- [ ] should handle mixed user settings and renderer defaults
- [ ] should respect data attribute settings over renderer defaults
- [ ] should handle decimals=0 with decimal input
- [ ] should handle high decimal precision
- [ ] should use custom stepinterval and stepintervaldelay

### __tests__/verticalButtons.test.ts
- [ ] should render vertical button structure correctly
- [ ] should function correctly with vertical buttons
- [ ] should work with size variations and prefix/postfix
- [ ] should work with existing DOM input groups
- [ ] should handle disabled state for vertical buttons
- [ ] should support long press spinning for vertical buttons

### __tests__/visual/tailwind-visual.test.ts
- [ ] default state
- [ ] focused state
- [ ] disabled state
- [ ] readonly state
- [ ] hover on up button
- [ ] hover on down button
- [ ] active up button
- [ ] active down button
- [ ] small size
- [ ] default size
- [ ] large size
- [ ] extra large size
- [ ] all sizes comparison
- [ ] with currency prefix
- [ ] with unit postfix
- [ ] with both prefix and postfix
- [ ] all prefix/postfix comparison
- [ ] horizontal buttons
- [ ] vertical buttons
- [ ] custom button text
- [ ] all button layouts comparison
- [ ] 2 decimal places
- [ ] 4 decimal places
- [ ] all decimal variations
- [ ] at minimum value
- [ ] at maximum value
- [ ] all min/max states
- [ ] basic states section
- [ ] full page snapshot
- [ ] mobile viewport
- [ ] tablet viewport
- [ ] desktop viewport
- [ ] after increment
- [ ] after decrement
- [ ] manual value entry
- [ ] invalid manual entry - corrected to max
- [ ] invalid manual entry - corrected to min

### __tests__/wrapperAdvancedExistingGroup.test.ts
- [ ] BS3 advanced reuses addons and cleans up on destroy
- [ ] BS4 advanced reuses prepend/append and cleans up on destroy
- [ ] BS5 advanced reuses input-group-text and cleans up on destroy

### __tests__/wrapperAdvancedTailwindContainer.test.ts
- [ ] enhances [data-touchspin-advanced] and cleans up on destroy

### __tests__/wrapperAttributeSync.test.ts
- [ ] disabled/readonly stop spin and prevent changes
- [ ] min/max/step sync via native attrs

### __tests__/wrapperBootstrapMarkup.test.ts
- [ ] BS3 wrapper uses input-group-addon and input-group-btn (no BS4/5 wrappers)
- [ ] BS4 wrapper uses prepend/append wrappers and input-group-text (no BS3 addon)
- [ ] BS5 wrapper uses input-group-text without prepend/append wrappers

### __tests__/wrapperKeyboardWheel.test.ts
- [ ] ArrowUp emits change and spin start/stop; wheel emits change only

## Usage Instructions

1. **For Test Files**: Mark `[x]` if ALL individual tests in the file pass, `[ ]` if ANY test fails
2. **For Individual Tests**: Mark `[x]` if the test passes, `[ ]` if it fails
3. **Update Counters**: Update the overview section with current pass/fail counts
4. **Test Execution**: Run `npm test` or `npx playwright test` to execute all tests
5. **Specific Tests**: Run `npx playwright test <test-file>` for individual test files

## Notes

- This checklist covers the complete test suite as of the current codebase state
- Tests should be run against the modern architecture implementation
- Visual tests require screenshot comparison and may need baseline updates
- Some tests may be environment-specific (browser, viewport, etc.)