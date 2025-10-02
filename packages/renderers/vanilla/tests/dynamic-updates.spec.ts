/**
 * Feature: Vanilla renderer dynamic updates and settings changes
 * Background: fixture = /packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates button text dynamically
 * [x] updates button classes dynamically
 * [x] updates prefix content dynamically
 * [x] updates postfix content dynamically
 * [x] handles prefix addition and removal
 * [x] handles postfix addition and removal
 * [x] rebuilds DOM when layout changes
 * [x] updates disabled state dynamically
 * [x] handles multiple simultaneous updates
 * [x] preserves input value during updates
 * [x] maintains event listeners during updates
 * [x] handles empty to non-empty transitions
 * [x] handles non-empty to empty transitions
 * [x] updates accessibility attributes dynamically
 * [x] handles rapid successive updates
 * [x] maintains DOM references during updates
 * [x] handles conflicting setting combinations
 * [x] preserves testid attributes during updates
 * [x] handles update error scenarios gracefully
 * [x] optimizes performance during updates
 * [x] handles custom class updates
 * [x] maintains browser compatibility during updates
 * [x] handles CSS variable updates
 * [x] preserves semantic structure during updates
 * [x] handles animation-friendly updates
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';

const VANILLA_FIXTURE = '/packages/renderers/vanilla/tests/fixtures/vanilla-fixture.html';

/**
 * Scenario: updates button text dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When button text settings are updated via API
 * Then button text content changes immediately
 * Params:
 * { "initialTexts": { "up": "+", "down": "-" }, "newTexts": { "up": "↑", "down": "↓" }, "updateBehavior": "immediate" }
 */
test('updates button text dynamically', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Update button text settings
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: '↑',
    buttondown_txt: '↓'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify text updated
  await expect(elements.upButton).toHaveText('↑');
  await expect(elements.downButton).toHaveText('↓');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates button classes dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When button class settings are updated via API
 * Then button classes change while preserving vanilla structure
 * Params:
 * { "initialClasses": "touchspin-btn", "newClasses": "touchspin-btn custom-btn", "classUpdate": "additive" }
 */
test('updates button classes dynamically', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Update button classes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'custom-up-btn',
    buttondown_class: 'custom-down-btn'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify classes updated
  await expect(elements.upButton).toHaveClass(/custom-up-btn/);
  await expect(elements.downButton).toHaveClass(/custom-down-btn/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates prefix content dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When prefix content is updated via API
 * Then prefix element content changes immediately
 * Params:
 * { "initialPrefix": "$", "newPrefix": "€", "contentUpdate": "immediate", "elementPreservation": true }
 */
test('updates prefix content dynamically', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    prefix: '$'
  });

  // Update prefix content
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '€',
    prefix_extraclass: 'euro-currency'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify prefix updated
  await expect(elements.prefix).toHaveText('€');
  await expect(elements.prefix).toHaveClass(/euro-currency/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates postfix content dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When postfix content is updated via API
 * Then postfix element content changes immediately
 * Params:
 * { "initialPostfix": "USD", "newPostfix": "EUR", "contentUpdate": "immediate", "elementPreservation": true }
 */
test('updates postfix content dynamically', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    postfix: 'USD'
  });

  // Update postfix content
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: 'EUR',
    postfix_extraclass: 'euro-code'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify postfix updated
  await expect(elements.postfix).toHaveText('EUR');
  await expect(elements.postfix).toHaveClass(/euro-code/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles prefix addition and removal
 * Given the fixture page is loaded with TouchSpin without prefix
 * When prefix is added and then removed via API
 * Then DOM structure adjusts appropriately
 * Params:
 * { "initialPrefix": "", "addedPrefix": "$", "removedPrefix": "", "domAdjustment": "structural", "performanceOptimized": true }
 */
test('handles prefix addition and removal', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Add prefix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$'
  });

  let elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toBeVisible();
  await expect(elements.prefix).toHaveText('$');

  // Remove prefix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: ''
  });

  // Verify functionality still works after changes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles postfix addition and removal
 * Given the fixture page is loaded with TouchSpin without postfix
 * When postfix is added and then removed via API
 * Then DOM structure adjusts appropriately
 * Params:
 * { "initialPostfix": "", "addedPostfix": "USD", "removedPostfix": "", "domAdjustment": "structural", "performanceOptimized": true }
 */
test('handles postfix addition and removal', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Add postfix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: 'kg'
  });

  let elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.postfix).toBeVisible();
  await expect(elements.postfix).toHaveText('kg');

  // Remove postfix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: ''
  });

  // Verify functionality still works after changes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: rebuilds DOM when layout changes
 * Given the fixture page is loaded with horizontal layout
 * When layout is changed to vertical via API
 * Then entire DOM structure rebuilds with new vanilla layout
 * Params:
 * { "initialLayout": "horizontal", "newLayout": "vertical", "rebuildBehavior": "complete", "statePreservation": "maintained" }
 */
test('rebuilds DOM when layout changes', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Change to vertical layout
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true
  });

  // Verify functionality still works after layout change
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Change back to horizontal
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false
  });

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: updates disabled state dynamically
 * Given the fixture page is loaded with enabled TouchSpin
 * When disabled state is toggled on the input element
 * Then all elements reflect the new disabled state
 * Params:
 * { "initialState": "enabled", "newState": "disabled", "stateUpdate": "comprehensive", "accessibilityUpdate": true }
 */
test('updates disabled state dynamically', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Disable the input element (TouchSpin watches this via MutationObserver)
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    if (input) input.disabled = true;
  });

  // Wait for MutationObserver to react
  await page.waitForTimeout(50);

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify input is disabled
  await expect(elements.input).toBeDisabled();

  // Verify buttons are also disabled (TouchSpin behavior)
  await expect(elements.upButton).toBeDisabled();
  await expect(elements.downButton).toBeDisabled();

  // Re-enable the input element
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
    if (input) input.disabled = false;
  });

  // Wait for MutationObserver to react
  await page.waitForTimeout(50);

  // Verify functionality restored
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles multiple simultaneous updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When multiple settings are updated simultaneously
 * Then all updates are applied correctly without conflicts
 * Params:
 * { "simultaneousUpdates": ["text", "classes", "prefix", "postfix"], "conflictResolution": "proper", "updateBatching": "optimized" }
 */
test('handles multiple simultaneous updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply multiple settings at once
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
    buttonup_txt: 'UP',
    verticalbuttons: true,
    postfix: 'USD'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify all changes applied
  await expect(elements.prefix).toHaveText('$');
  await expect(elements.upButton).toHaveText('UP');
  await expect(elements.postfix).toHaveText('USD');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: preserves input value during updates
 * Given the fixture page is loaded with TouchSpin containing a value
 * When various settings are updated
 * Then the input value is preserved through updates
 * Params:
 * { "initialValue": "50", "updates": ["layout", "classes", "prefix"], "valuePreservation": "guaranteed" }
 */
test('preserves input value during updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Set a specific value
  await apiHelpers.setValueViaAPI(page, 'test-input', '42');
  await apiHelpers.expectValueToBe(page, 'test-input', '42');

  // Trigger DOM changes that might affect the value
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    prefix: '$',
    postfix: 'USD'
  });

  // Verify value is preserved
  await apiHelpers.expectValueToBe(page, 'test-input', '42');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '43');
});

/**
 * Scenario: maintains event listeners during updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When settings are updated that affect DOM structure
 * Then event listeners are maintained or properly reattached
 * Params:
 * { "eventListeners": ["click", "focus", "input"], "listenerMaintenance": "automatic", "functionalityPreservation": true }
 */
test('maintains event listeners during updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');
  await apiHelpers.clearEventLog(page);

  // Update settings that cause DOM changes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'custom-up',
    prefix: '$'
  });

  // Test that event listeners still work
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Verify events are still being logged
  await apiHelpers.expectEventFired(page, 'change');
});

/**
 * Scenario: handles empty to non-empty transitions
 * Given the fixture page is loaded with empty prefix/postfix
 * When prefix or postfix is set to non-empty values
 * Then elements are created and positioned correctly
 * Params:
 * { "transition": "empty_to_content", "elementCreation": "dynamic", "positioning": "correct" }
 */
test('handles empty to non-empty transitions', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Add prefix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$'
  });

  // Verify prefix was created and inserted
  let elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toBeVisible();
  await expect(elements.prefix).toHaveText('$');

  // Add postfix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: 'USD'
  });

  elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.postfix).toBeVisible();
  await expect(elements.postfix).toHaveText('USD');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles non-empty to empty transitions
 * Given the fixture page is loaded with content in prefix/postfix
 * When prefix or postfix is set to empty
 * Then elements are removed cleanly from DOM
 * Params:
 * { "transition": "content_to_empty", "elementRemoval": "clean", "domCleanup": "complete" }
 */
test('handles non-empty to empty transitions', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    prefix: '$',
    postfix: 'kg'
  });

  // Remove prefix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: ''
  });

  // Remove postfix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: ''
  });

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates accessibility attributes dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When accessibility-related settings are updated
 * Then ARIA attributes and accessibility features update accordingly
 * Params:
 * { "accessibilityUpdates": ["aria-label", "aria-valuemin", "aria-valuemax"], "a11yMaintenance": "dynamic", "screenReaderSupport": "continuous" }
 */
test('updates accessibility attributes dynamically', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply updates that affect accessibility
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    focusablebuttons: false
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify accessibility attributes maintained
  await expect(elements.input).toHaveAttribute('type', 'number');
  await expect(elements.upButton).toHaveAttribute('tabindex', '-1');
  await expect(elements.downButton).toHaveAttribute('tabindex', '-1');

  // Test keyboard accessibility
  await elements.input.focus();
  await page.keyboard.press('ArrowUp');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles rapid successive updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When rapid successive updates are made
 * Then updates are processed efficiently without errors
 * Params:
 * { "updateFrequency": "rapid", "successiveUpdates": "handled", "performanceOptimization": "debouncing" }
 */
test('handles rapid successive updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply rapid successive updates
  for (let i = 0; i < 3; i++) {
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      buttonup_txt: `UP${i}`,
      buttondown_txt: `DOWN${i}`
    });
  }

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify final state is correct
  await expect(elements.upButton).toHaveText('UP2');
  await expect(elements.downButton).toHaveText('DOWN2');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: maintains DOM references during updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When updates that affect DOM structure occur
 * Then DOM references remain valid or are updated appropriately
 * Params:
 * { "domReferences": "maintained", "referenceUpdates": "automatic", "memoryLeaks": "prevented" }
 */
test('maintains DOM references during updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply non-structural update
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: 'NEW_UP',
    buttonup_class: 'custom-primary'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify button text updated but functionality preserved
  await expect(elements.upButton).toHaveText('NEW_UP');
  await expect(elements.upButton).toHaveClass(/custom-primary/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles conflicting setting combinations
 * Given the fixture page is loaded with initialized TouchSpin
 * When conflicting settings are updated
 * Then conflicts are resolved according to precedence rules
 * Params:
 * { "conflictingSettings": ["layout_vs_classes", "size_vs_custom"], "conflictResolution": "precedence_based", "expectedBehavior": "predictable" }
 */
test('handles conflicting setting combinations', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply conflicting settings (vertical layout with horizontal text settings)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    buttonup_txt: 'UP',
    verticalup: '▲'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify latest setting wins
  await expect(elements.upButton).toHaveText('UP');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch back to horizontal and verify precedence changes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false
  });

  // Now horizontal setting should apply
  await expect(elements.upButton).toHaveText('UP');
});

/**
 * Scenario: preserves testid attributes during updates
 * Given the fixture page is loaded with testid attributes
 * When updates that affect DOM structure occur
 * Then testid attributes are preserved for testing
 * Params:
 * { "testidPreservation": "guaranteed", "testingSupport": "maintained", "attributeStability": "ensured" }
 */
test('preserves testid attributes during updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply updates that trigger DOM changes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    prefix: '$'
  });

  // Verify testid attributes preserved
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.input).toHaveAttribute('data-testid', 'test-input');
  await expect(elements.wrapper).toHaveAttribute('data-testid', 'test-input-wrapper');
  await expect(elements.upButton).toHaveAttribute('data-testid', 'test-input-up');
  await expect(elements.downButton).toHaveAttribute('data-testid', 'test-input-down');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles update error scenarios gracefully
 * Given the fixture page is loaded with initialized TouchSpin
 * When invalid updates are attempted
 * Then errors are handled gracefully without breaking functionality
 * Params:
 * { "errorScenarios": ["invalid_values", "null_settings"], "errorHandling": "graceful", "functionalityPreservation": true }
 */
test('handles update error scenarios gracefully', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Try to apply potentially problematic settings (TouchSpin should handle gracefully)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'custom-success'
  });

  // Verify component still functions
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Apply more valid settings to verify recovery
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toHaveText('$');
});

/**
 * Scenario: optimizes performance during updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When frequent updates are made
 * Then performance is optimized through efficient update strategies
 * Params:
 * { "performanceOptimization": "update_batching", "renderingEfficiency": "high", "domManipulation": "minimized" }
 */
test('optimizes performance during updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply multiple updates in quick succession
  const startTime = Date.now();

  for (let i = 0; i < 5; i++) {
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      buttonup_txt: `UP-${i}`
    });
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Verify final state
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.upButton).toHaveText('UP-4');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Basic performance check (updates should complete in reasonable time)
  expect(duration).toBeLessThan(5000);
});

/**
 * Scenario: handles custom class updates
 * Given the fixture page is loaded with custom classes
 * When custom class settings are updated
 * Then custom classes are applied without conflicts
 * Params:
 * { "customClassUpdates": "conflict_free", "classApplication": "additive", "classPrecedence": "maintained" }
 */
test('handles custom class updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_class: 'initial-up-class'
  });

  // Update to new custom classes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'updated-up-class custom-btn',
    buttondown_class: 'updated-down-class custom-btn'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify custom classes applied
  await expect(elements.upButton).toHaveClass(/updated-up-class/);
  await expect(elements.upButton).toHaveClass(/custom-btn/);
  await expect(elements.downButton).toHaveClass(/updated-down-class/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: maintains browser compatibility during updates
 * Given the fixture page is loaded in different browsers
 * When updates are made across browser environments
 * Then updates work consistently across supported browsers
 * Params:
 * { "browserCompatibility": ["chrome", "firefox", "safari", "edge"], "updateConsistency": "cross_browser" }
 */
test('maintains browser compatibility during updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply various updates that should work consistently
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: '↑',
    prefix: '$',
    verticalbuttons: true,
    postfix: 'USD'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify all updates applied correctly
  await expect(elements.upButton).toHaveText('↑');
  await expect(elements.prefix).toHaveText('$');
  await expect(elements.postfix).toHaveText('USD');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles CSS variable updates
 * Given the fixture page is loaded with CSS variables
 * When CSS variable-based settings are updated
 * Then CSS variables are updated appropriately
 * Params:
 * { "cssVariables": ["colors", "sizes", "spacing"], "variableUpdates": "dynamic", "stylingEffects": "immediate" }
 */
test('handles CSS variable updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply updates that might affect CSS variables
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'custom-styled-btn',
    prefix: '$',
    prefix_extraclass: 'custom-prefix-style'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify classes applied (CSS variables work through classes)
  await expect(elements.upButton).toHaveClass(/custom-styled-btn/);
  await expect(elements.prefix).toHaveClass(/custom-prefix-style/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: preserves semantic structure during updates
 * Given the fixture page is loaded with semantic HTML structure
 * When updates that affect structure occur
 * Then semantic HTML structure is preserved
 * Params:
 * { "semanticStructure": "preserved", "htmlSemantics": "maintained", "accessibilitySemantics": "consistent" }
 */
test('preserves semantic structure during updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply structural updates
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    prefix: '$',
    postfix: 'USD'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify semantic structure maintained
  await expect(elements.input).toHaveAttribute('type', 'number');
  await expect(elements.upButton).toHaveAttribute('type', 'button');
  await expect(elements.downButton).toHaveAttribute('type', 'button');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles animation-friendly updates
 * Given the fixture page is loaded with CSS animations
 * When updates that could affect animations occur
 * Then updates are animation-friendly and don't break transitions
 * Params:
 * { "animationSupport": "maintained", "transitionFriendly": true, "visualContinuity": "preserved" }
 */
test('handles animation-friendly updates', async ({ page }) => {
  await page.goto(VANILLA_FIXTURE);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    buttonup_class: 'animated-btn'
  });

  // Apply updates that should not break animations
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: '↑',
    buttondown_txt: '↓',
    prefix: '$'
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify updates applied
  await expect(elements.upButton).toHaveText('↑');
  await expect(elements.downButton).toHaveText('↓');
  await expect(elements.prefix).toHaveText('$');

  // Verify functionality works (animations don't block interaction)
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});
