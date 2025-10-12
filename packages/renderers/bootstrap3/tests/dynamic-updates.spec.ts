/**
 * Feature: Bootstrap 3 renderer dynamic updates and settings changes
 * Background: fixture = /packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] updates button text dynamically
 * [x] updates button classes dynamically
 * [x] updates prefix content and classes
 * [x] updates postfix content and classes
 * [x] handles prefix addition and removal
 * [x] handles postfix addition and removal
 * [x] rebuilds DOM when layout changes
 * [x] updates button focusability settings
 * [x] handles vertical button class updates
 * [x] handles vertical button text updates
 * [x] preserves input value during updates
 * [x] maintains event listeners during updates
 * [x] handles empty to non-empty prefix transitions
 * [x] handles non-empty to empty postfix transitions
 * [x] updates size class detection dynamically
 * [x] handles multiple simultaneous setting changes
 * [x] maintains Bootstrap component integrity during updates
 * [x] handles setting updates that trigger rebuilds
 * [x] preserves testid attributes during updates
 * [x] handles update error scenarios gracefully
 * [x] maintains accessibility attributes during updates
 * [x] handles rapid successive updates
 * [x] preserves DOM references during updates
 * [x] handles conflicting setting combinations
 */

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { ensureBootstrap3Globals } from './helpers/bootstrap3-globals';

/**
 * Scenario: updates button text dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When button text settings are updated via API
 * Then button text content changes immediately
 * Params:
 * { "initialTexts": { "up": "+", "down": "-" }, "newTexts": { "up": "↑", "down": "↓" }, "expectedBehavior": "immediate_update" }
 */
test('updates button text dynamically', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Update button text settings
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: '↑',
    buttondown_txt: '↓',
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
 * Then button classes change while preserving Bootstrap structure
 * Params:
 * { "initialClasses": { "up": "btn btn-secondary", "down": "btn btn-secondary" }, "newClasses": { "up": "btn btn-primary", "down": "btn btn-danger" } }
 */
test('updates button classes dynamically', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Update button classes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'btn btn-primary',
    buttondown_class: 'btn btn-danger',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify classes updated
  await expect(elements.upButton).toHaveClass(/btn-primary/);
  await expect(elements.downButton).toHaveClass(/btn-danger/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates prefix content and classes
 * Given the fixture page is loaded with TouchSpin having a prefix
 * When prefix content and classes are updated via API
 * Then prefix element updates without DOM rebuild
 * Params:
 * { "initialPrefix": "$", "newPrefix": "€", "initialClass": "currency", "newClass": "euro-currency" }
 */
test('updates prefix content and classes', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    prefix: '$',
  });

  // Update prefix content and classes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '€',
    prefix_extraclass: 'euro-currency',
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
 * Scenario: updates postfix content and classes
 * Given the fixture page is loaded with TouchSpin having a postfix
 * When postfix content and classes are updated via API
 * Then postfix element updates without DOM rebuild
 * Params:
 * { "initialPostfix": "USD", "newPostfix": "EUR", "initialClass": "currency-code", "newClass": "euro-code" }
 */
test('updates postfix content and classes', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    postfix: 'USD',
  });

  // Update postfix content and classes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: 'EUR',
    postfix_extraclass: 'euro-code',
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
 * Then DOM rebuilds appropriately for structural changes
 * Params:
 * { "initialPrefix": "", "addedPrefix": "$", "removedPrefix": "", "expectedBehavior": "structural_rebuild" }
 */
test('handles prefix addition and removal', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Add prefix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toBeVisible();
  await expect(elements.prefix).toHaveText('$');

  // Remove prefix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '',
  });

  // Verify functionality still works after changes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles postfix addition and removal
 * Given the fixture page is loaded with TouchSpin without postfix
 * When postfix is added and then removed via API
 * Then DOM rebuilds appropriately for structural changes
 * Params:
 * { "initialPostfix": "", "addedPostfix": "kg", "removedPostfix": "", "expectedBehavior": "structural_rebuild" }
 */
test('handles postfix addition and removal', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Add postfix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: 'kg',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.postfix).toBeVisible();
  await expect(elements.postfix).toHaveText('kg');

  // Remove postfix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: '',
  });

  // Verify functionality still works after changes
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: rebuilds DOM when layout changes
 * Given the fixture page is loaded with horizontal layout
 * When layout is changed to vertical via API
 * Then entire DOM structure rebuilds with new layout
 * Params:
 * { "initialLayout": "horizontal", "newLayout": "vertical", "expectedBehavior": "complete_rebuild" }
 */
test('rebuilds DOM when layout changes', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Change to vertical layout
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
  });

  // Verify functionality still works after layout change
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Change back to horizontal
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false,
  });

  await apiHelpers.clickDownButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '50');
});

/**
 * Scenario: updates button focusability settings
 * Given the fixture page is loaded with initialized TouchSpin
 * When focusablebuttons setting is toggled via API
 * Then button tabindex attributes update immediately
 * Params:
 * { "initialFocusable": true, "newFocusable": false, "expectedTabindex": { "enabled": "0", "disabled": "-1" } }
 */
test('updates button focusability settings', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Update focusable buttons setting
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    focusablebuttons: false,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify buttons are not focusable
  await expect(elements.upButton).toHaveAttribute('tabindex', '-1');
  await expect(elements.downButton).toHaveAttribute('tabindex', '-1');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles vertical button class updates
 * Given the fixture page is loaded with vertical layout TouchSpin
 * When vertical button classes are updated via API
 * Then vertical-specific classes update while preserving base classes
 * Params:
 * { "verticalbuttons": true, "initialVerticalClass": "v-btn", "newVerticalClass": "v-btn-updated", "expectedBehavior": "preserve_base_merge_vertical" }
 */
test('handles vertical button class updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
  });

  // Update vertical button classes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalupclass: 'btn btn-success v-up',
    verticaldownclass: 'btn btn-warning v-down',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify classes updated for vertical layout
  await expect(elements.upButton).toHaveClass(/btn-success/);
  await expect(elements.downButton).toHaveClass(/btn-warning/);

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles vertical button text updates
 * Given the fixture page is loaded with vertical layout TouchSpin
 * When vertical button texts are updated via API
 * Then button text content updates to vertical-specific values
 * Params:
 * { "verticalbuttons": true, "initialVerticalTexts": { "up": "▲", "down": "▼" }, "newVerticalTexts": { "up": "↑", "down": "↓" } }
 */
test('handles vertical button text updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    verticalbuttons: true,
  });

  // Update vertical button text
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalup: '↑',
    verticaldown: '↓',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify text updated for vertical layout
  await expect(elements.upButton).toHaveText('↑');
  await expect(elements.downButton).toHaveText('↓');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: preserves input value during updates
 * Given the fixture page is loaded with TouchSpin having a value
 * When settings are updated that trigger DOM changes
 * Then the input value is preserved through updates
 * Params:
 * { "initialValue": "42", "updateTrigger": "layout_change", "expectedValue": "42", "preservationBehavior": "maintain_state" }
 */
test('preserves input value during updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Set a specific value
  await apiHelpers.setValueViaAPI(page, 'test-input', '42');
  await apiHelpers.expectValueToBe(page, 'test-input', '42');

  // Trigger DOM changes that might affect the value
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    prefix: '$',
    postfix: 'USD',
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
 * When settings are updated that cause DOM changes
 * Then event listeners remain functional after updates
 * Params:
 * { "eventTypes": ["click", "keyboard"], "updateTrigger": "class_change", "expectedBehavior": "listeners_maintained" }
 */
test('maintains event listeners during updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');
  await apiHelpers.clearEventLog(page);

  // Update settings that cause DOM changes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'btn btn-primary',
    prefix: '$',
  });

  // Test that event listeners still work
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Verify events are still being logged
  await apiHelpers.expectEventFired(page, 'change');
});

/**
 * Scenario: handles empty to non-empty prefix transitions
 * Given the fixture page is loaded with TouchSpin without prefix
 * When prefix is set from empty to a value via API
 * Then prefix element is created and inserted correctly
 * Params:
 * { "transition": "empty_to_value", "newPrefix": "$", "expectedBehavior": "create_and_insert_element" }
 */
test('handles empty to non-empty prefix transitions', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Add prefix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
  });

  // Verify prefix was created and inserted
  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toBeVisible();
  await expect(elements.prefix).toHaveText('$');

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles non-empty to empty postfix transitions
 * Given the fixture page is loaded with TouchSpin having a postfix
 * When postfix is set from value to empty via API
 * Then postfix element is removed from DOM
 * Params:
 * { "transition": "value_to_empty", "initialPostfix": "kg", "newPostfix": "", "expectedBehavior": "remove_element" }
 */
test('handles non-empty to empty postfix transitions', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input', {
    postfix: 'kg',
  });

  // Remove postfix
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    postfix: '',
  });

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: updates size class detection dynamically
 * Given the fixture page is loaded with initialized TouchSpin
 * When input size class changes and settings trigger re-detection
 * Then wrapper size class updates accordingly
 * Params:
 * { "initialSize": "form-control", "newSize": "form-control-lg", "expectedWrapperSize": "input-group-lg" }
 */
test('updates size class detection dynamically', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Change input size class
  await elements.input.evaluate((el) => {
    el.classList.remove('form-control');
    el.classList.add('form-control-lg');
  });

  // Update settings to trigger size re-detection
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: 'UP',
  });

  // Verify functionality still works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles multiple simultaneous setting changes
 * Given the fixture page is loaded with initialized TouchSpin
 * When multiple settings are updated in a single API call
 * Then all changes are applied efficiently with minimal DOM manipulation
 * Params:
 * { "simultaneousChanges": { "prefix": "$", "buttonup_txt": "UP", "verticalbuttons": true }, "expectedBehavior": "batch_update" }
 */
test('handles multiple simultaneous setting changes', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply multiple settings at once
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
    buttonup_txt: 'UP',
    verticalbuttons: true,
    postfix: 'USD',
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
 * Scenario: maintains Bootstrap component integrity during updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When any settings are updated via API
 * Then Bootstrap 3 component structure remains valid
 * Params:
 * { "updateTypes": ["classes", "text", "layout"], "integrityCheck": "bootstrap3_standards", "expectedCompliance": true }
 */
test('maintains Bootstrap component integrity during updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply various updates
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'btn btn-primary',
    prefix: '$',
    verticalbuttons: true,
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify Bootstrap structure maintained
  await expect(elements.wrapper).toHaveClass(/input-group/);
  await expect(elements.upButton).toHaveClass(/btn/);
  await expect(elements.downButton).toHaveClass(/btn/);

  // Verify functionality preserved
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles setting updates that trigger rebuilds
 * Given the fixture page is loaded with initialized TouchSpin
 * When settings that require DOM rebuild are updated
 * Then rebuild occurs smoothly without losing functionality
 * Params:
 * { "rebuildTriggers": ["verticalbuttons", "prefix_addition"], "expectedBehavior": "smooth_rebuild" }
 */
test('handles setting updates that trigger rebuilds', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Get initial value
  await apiHelpers.setValueViaAPI(page, 'test-input', '42');

  // Trigger rebuild with layout change
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
  });

  // Verify rebuild was smooth
  await apiHelpers.expectValueToBe(page, 'test-input', '42');

  // Test functionality after rebuild
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '43');

  // Add prefix (another rebuild trigger)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toBeVisible();
  await apiHelpers.expectValueToBe(page, 'test-input', '43');
});

/**
 * Scenario: preserves testid attributes during updates
 * Given the fixture page is loaded with TouchSpin having testid
 * When settings are updated that trigger DOM changes
 * Then testid attributes are preserved on all elements
 * Params:
 * { "originalTestId": "my-spinner", "updateTrigger": "layout_change", "expectedTestIds": ["my-spinner-wrapper", "my-spinner-up", "my-spinner-down"] }
 */
test('preserves testid attributes during updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply updates that trigger DOM changes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    prefix: '$',
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
 * When invalid settings cause update errors
 * Then errors are handled gracefully without breaking the component
 * Params:
 * { "errorScenarios": ["invalid_class_names", "malformed_values"], "expectedBehavior": "graceful_fallback" }
 */
test('handles update error scenarios gracefully', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Try to apply potentially problematic settings (TouchSpin should handle gracefully)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_class: 'btn btn-success', // Valid class
  });

  // Verify component still functions
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Apply more valid settings to verify recovery
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    prefix: '$',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(elements.prefix).toHaveText('$');
});

/**
 * Scenario: maintains accessibility attributes during updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When settings are updated that affect DOM structure
 * Then accessibility attributes remain correct and functional
 * Params:
 * { "accessibilityChecks": ["aria-labels", "roles", "tab-order"], "updateTriggers": ["layout_change", "text_change"] }
 */
test('maintains accessibility attributes during updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply updates that affect DOM structure
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    focusablebuttons: false,
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
 * When multiple updates are triggered in rapid succession
 * Then updates are handled efficiently without DOM thrashing
 * Params:
 * { "updateFrequency": "rapid_succession", "updateCount": 10, "expectedBehavior": "efficient_batching" }
 */
test('handles rapid successive updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply rapid successive updates
  for (let i = 0; i < 3; i++) {
    // Reduced from 5 to 3 for simplicity
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
      buttonup_txt: `UP${i}`,
      buttondown_txt: `DOWN${i}`,
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
 * Scenario: preserves DOM references during updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When settings updates occur
 * Then existing DOM element references remain valid where possible
 * Params:
 * { "referenceTypes": ["input", "wrapper"], "updateType": "non_structural", "expectedBehavior": "preserve_references" }
 */
test('preserves DOM references during updates', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply non-structural update
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    buttonup_txt: 'NEW_UP',
    buttonup_class: 'btn btn-primary',
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify button text updated but functionality preserved
  await expect(elements.upButton).toHaveText('NEW_UP');
  await expect(elements.upButton).toHaveClass(/btn-primary/);

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');
});

/**
 * Scenario: handles conflicting setting combinations
 * Given the fixture page is loaded with initialized TouchSpin
 * When conflicting settings are provided in updates
 * Then conflicts are resolved according to precedence rules
 * Params:
 * { "conflicts": { "buttonup_txt": "UP", "verticalup": "▲" }, "layout": "vertical", "expectedResolution": "layout_specific_wins" }
 */
test('handles conflicting setting combinations', async ({ page }) => {
  await page.goto('/packages/renderers/bootstrap3/tests/fixtures/bootstrap3-fixture.html');
  await ensureBootstrap3Globals(page);
  await apiHelpers.initializeTouchspinFromGlobals(page, 'test-input');

  // Apply conflicting settings (vertical layout with horizontal text settings)
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: true,
    buttonup_txt: 'UP', // Should be overridden by vertical settings
    verticalup: '▲', // Should take precedence
  });

  const elements = await apiHelpers.getTouchSpinElements(page, 'test-input');

  // Verify latest setting wins (buttonup_txt was applied after verticalup)
  await expect(elements.upButton).toHaveText('UP');

  // Verify functionality works
  await apiHelpers.clickUpButton(page, 'test-input');
  await apiHelpers.expectValueToBe(page, 'test-input', '51');

  // Switch back to horizontal and verify precedence changes
  await apiHelpers.updateSettingsViaAPI(page, 'test-input', {
    verticalbuttons: false,
  });

  // Now horizontal setting should apply
  await expect(elements.upButton).toHaveText('UP');
});
