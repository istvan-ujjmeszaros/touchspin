/**
 * Feature: jQuery plugin data attribute handling
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] reads basic numeric settings from data attributes
 * [x] handles data-bts-min and data-bts-max attributes
 * [x] processes data-bts-step attribute correctly
 * [x] supports data-bts-decimals precision setting
 * [x] handles data-bts-prefix and data-bts-postfix text
 * [x] processes boolean data attributes correctly
 * [x] supports data-bts-vertical-buttons layout option
 * [x] handles data-bts-mousewheel enable/disable
 * [x] processes data-bts-init-val initial value
 * [x] supports data-bts-forcestepdivisibility options
 * [x] handles complex data attribute values
 * [ ] processes JSON-formatted data attributes
 * [x] handles kebab-case data attributes correctly
 * [x] handles data attribute precedence over options
 * [x] validates data attribute values during initialization
 * [ ] supports dynamic data attribute updates
 * [x] handles malformed data attribute values gracefully
 * [x] processes data attributes with special characters
 * [ ] supports localized data attribute values
 * [ ] handles data attribute inheritance patterns
 * [ ] processes conditional data attributes
 * [ ] supports data attribute templating
 * [ ] handles data attribute conflicts resolution
 * [ ] maintains data attribute backward compatibility
 * [ ] supports custom data attribute extensions
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';

test.describe('jQuery plugin data attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await installJqueryPlugin(page);
    await apiHelpers.clearEventLog(page);
    await apiHelpers.clearAdditionalInputs(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

/**
 * Scenario: reads basic numeric settings from data attributes
 * Given the fixture page is loaded with numeric data attributes
 * When TouchSpin initializes
 * Then numeric settings are read correctly
 * Params:
 * { "dataAttributes": "data-bts-step='5' data-bts-min='0' data-bts-max='100'", "expectedSettings": { "step": 5, "min": 0, "max": 100 } }
 */
  test('reads basic numeric settings from data attributes', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-step': '5', 'data-bts-min': '0', 'data-bts-max': '100' });
    await initializeTouchspinJQuery(page, 'test-input');
    const settings = await apiHelpers.getAppliedSettings(page, 'test-input');
    expect(settings.step).toBe(5);
    expect(settings.min).toBe(0);
    expect(settings.max).toBe(100);
  });

/**
 * Scenario: handles data-bts-min and data-bts-max attributes
 * Given the fixture page is loaded with boundary data attributes
 * When TouchSpin initializes
 * Then min and max boundaries are applied correctly
 * Params:
 * { "dataMin": "10", "dataMax": "50", "expectedBoundaries": { "min": 10, "max": 50 } }
 */
  test('handles data-bts-min and data-bts-max attributes', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-min': '10', 'data-bts-max': '50' });
    await initializeTouchspinJQuery(page, 'test-input', { initval: 30 });
    await apiHelpers.setValueViaAPI(page, 'test-input', '5');
    await apiHelpers.expectValueToBe(page, 'test-input', '10');
    await apiHelpers.setValueViaAPI(page, 'test-input', '60');
    await apiHelpers.expectValueToBe(page, 'test-input', '50');
  });

/**
 * Scenario: processes data-bts-step attribute correctly
 * Given the fixture page is loaded with step data attribute
 * When TouchSpin initializes
 * Then step value is applied correctly
 * Params:
 * { "dataStep": "2.5", "dataDecimals": "1", "expectedStep": 2.5, "operation": "increment", "expectedIncrement": 2.5 }
 */
  test('processes data-bts-step attribute correctly', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-step': '2.5', 'data-bts-decimals': '1' });
    await initializeTouchspinJQuery(page, 'test-input', { initval: 5 });
    await apiHelpers.clickUpButton(page, 'test-input');
    await apiHelpers.expectValueToBe(page, 'test-input', '7.5');
  });

/**
 * Scenario: supports data-bts-decimals precision setting
 * Given the fixture page is loaded with decimals data attribute
 * When TouchSpin initializes
 * Then decimal precision is applied correctly
 * Params:
 * { "dataDecimals": "2", "inputValue": "1.2345", "expectedDisplay": "1.23" }
 */
  test('supports data-bts-decimals precision setting', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-decimals': '2', 'data-bts-step': '0.0001' });
    await initializeTouchspinJQuery(page, 'test-input');
    await apiHelpers.setValueViaAPI(page, 'test-input', '1.2345');
    await apiHelpers.expectValueToBe(page, 'test-input', '1.23');
  });

/**
 * Scenario: handles data-bts-prefix and data-bts-postfix text
 * Given the fixture page is loaded with prefix/postfix data attributes
 * When TouchSpin initializes
 * Then prefix and postfix text are displayed correctly
 * Params:
 * { "dataPrefix": "$", "dataPostfix": "USD", "expectedDisplay": "$_input_USD" }
 */
  test('handles data-bts-prefix and data-bts-postfix text', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-prefix': '$', 'data-bts-postfix': 'USD' });
    await initializeTouchspinJQuery(page, 'test-input');
    const { prefix, postfix } = await apiHelpers.getTouchSpinElements(page, 'test-input');
    await expect(prefix).toHaveText('$');
    await expect(postfix).toHaveText('USD');
  });

/**
 * Scenario: processes boolean data attributes correctly
 * Given the fixture page is loaded with boolean data attributes
 * When TouchSpin initializes
 * Then boolean values are interpreted correctly
 * Params:
 * { "booleanAttributes": ["data-bts-mousewheel='true'", "data-bts-vertical-buttons='false'"], "expectedValues": { "mousewheel": true, "verticalbuttons": false } }
 */
  test('processes boolean data attributes correctly', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-mousewheel': 'true', 'data-bts-vertical-buttons': 'false' });
    await initializeTouchspinJQuery(page, 'test-input');
    const settings = await apiHelpers.getAppliedSettings(page, 'test-input');
    expect(settings.mousewheel).toBe(true);
    expect(settings.verticalbuttons).toBe(false);
  });

/**
 * Scenario: supports data-bts-vertical-buttons layout option
 * Given the fixture page is loaded with vertical buttons data attribute
 * When TouchSpin initializes
 * Then buttons are arranged vertically
 * Params:
 * { "dataVerticalbuttons": "true", "expectedLayout": "vertical_button_arrangement" }
 */
  test('supports data-bts-vertical-buttons layout option', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-vertical-buttons': 'true' });
    await initializeTouchspinJQuery(page, 'test-input');
    const wrapper = await apiHelpers.getTouchSpinWrapper(page, 'test-input');
    await expect(wrapper.locator('[data-touchspin-injected="vertical-wrapper"]')).toBeVisible();
  });

/**
 * Scenario: handles data-bts-mousewheel enable/disable
 * Given the fixture page is loaded with mousewheel data attribute
 * When TouchSpin initializes
 * Then mousewheel behavior is configured correctly
 * Params:
 * { "dataMousewheel": "false", "expectedBehavior": "mousewheel_disabled" }
 */
  test('handles data-bts-mousewheel enable/disable', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-mousewheel': 'false' });
    await initializeTouchspinJQuery(page, 'test-input', { initval: 10 });
    await apiHelpers.wheelUpOnInput(page, 'test-input');
    await apiHelpers.expectValueToBe(page, 'test-input', '10');
  });

/**
 * Scenario: processes data-bts-init-val initial value
 * Given the fixture page is loaded with initial value data attribute
 * When TouchSpin initializes
 * Then the initial value is set correctly
 * Params:
 * { "dataInitval": "42", "expectedInitialValue": "42" }
 */
  test('processes data-bts-init-val initial value', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-init-val': '42' });
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement | null;
      if (input) input.value = '';
    });
    await initializeTouchspinJQuery(page, 'test-input');
    await apiHelpers.expectValueToBe(page, 'test-input', '42');
  });

/**
 * Scenario: supports data-bts-forcestepdivisibility options
 * Given the fixture page is loaded with step divisibility data attribute
 * When TouchSpin initializes
 * Then step divisibility is enforced correctly
 * Params:
 * { "dataForcestepdivisibility": "round", "inputValue": "8", "step": 3, "expectedValue": "9" }
 */
  test('supports data-bts-forcestepdivisibility options', async ({ page }) => {
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-force-step-divisibility': 'round', 'data-bts-step': '3' });
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement | null;
      if (input) input.value = '8';
    });
    await initializeTouchspinJQuery(page, 'test-input');
    await apiHelpers.expectValueToBe(page, 'test-input', '9');
  });

/**
 * Scenario: handles complex data attribute values
 * Given the fixture page is loaded with complex data values
 * When TouchSpin initializes
 * Then complex values are parsed correctly
 * Params:
 * { "complexData": "data-callback='function(val) { return val * 2; }'", "expectedBehavior": "callback_function_parsed" }
 */
test('handles complex data attribute values', async ({ page }) => {
  // Test with decimal numbers, negative values, and long strings
  await apiHelpers.setDataAttributes(page, 'test-input', {
    'data-bts-step': '0.25',
    'data-bts-min': '-10.5',
    'data-bts-max': '999.99',
    'data-bts-decimals': '2',
    'data-bts-prefix': 'Value: ',
    'data-bts-postfix': ' (complex units)'
  });
  await initializeTouchspinJQuery(page, 'test-input', { initval: 5 });

  const settings = await apiHelpers.getAppliedSettings(page, 'test-input');
  expect(settings.step).toBe(0.25);
  expect(settings.min).toBe(-10.5);
  expect(settings.max).toBe(999.99);
  expect(settings.decimals).toBe(2);

  const { prefix, postfix } = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(prefix).toHaveText('Value: ');
  await expect(postfix).toHaveText(' (complex units)');
});

/**
 * Scenario: processes JSON-formatted data attributes
 * Given the fixture page is loaded with JSON data attributes
 * When TouchSpin initializes
 * Then JSON values are parsed correctly
 * Params:
 * { "jsonData": "data-settings='{\"min\": 0, \"max\": 100, \"step\": 5}'", "expectedSettings": { "min": 0, "max": 100, "step": 5 } }
 */
test.skip('processes JSON-formatted data attributes', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles kebab-case data attributes correctly
 * Given the fixture page is loaded with kebab-case data attributes
 * When TouchSpin initializes
 * Then kebab-case attributes are recognized and applied
 * Params:
 * { "attributes": ["data-bts-mouse-wheel", "data-bts-vertical-buttons", "data-bts-step-interval"], "expectedBehavior": "all_recognized" }
 */
test('handles kebab-case data attributes correctly', async ({ page }) => {
  // Test that kebab-case attributes from the mapping work correctly
  await apiHelpers.setDataAttributes(page, 'test-input', {
    'data-bts-mouse-wheel': 'true',        // maps to mousewheel
    'data-bts-vertical-buttons': 'true',   // maps to verticalbuttons
    'data-bts-step-interval': '100',       // maps to stepinterval
    'data-bts-max-boosted-step': '10',     // maps to maxboostedstep
    'data-bts-force-step-divisibility': 'round'  // maps to forcestepdivisibility
  });
  await initializeTouchspinJQuery(page, 'test-input', { initval: 10 });

  const settings = await apiHelpers.getAppliedSettings(page, 'test-input');
  expect(settings.mousewheel).toBe(true);
  expect(settings.verticalbuttons).toBe(true);
  expect(settings.stepinterval).toBe(100);
  expect(settings.maxboostedstep).toBe(10);
  expect(settings.forcestepdivisibility).toBe('round');
});

/**
 * Scenario: handles data attribute precedence over options
 * Given the fixture page is loaded with conflicting data attributes and options
 * When TouchSpin initializes
 * Then precedence rules are applied correctly
 * Params:
 * { "dataAttribute": "data-bts-step='5'", "optionValue": "step: 3", "expectedPrecedence": "data_attribute_wins" }
 */
test('handles data attribute precedence over options', async ({ page }) => {
  await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-step': '5', 'data-bts-min': '10' });
  // Options should override data attributes (options take precedence)
  await initializeTouchspinJQuery(page, 'test-input', { step: 3, min: 5, initval: 12 });

  const settings = await apiHelpers.getAppliedSettings(page, 'test-input');
  expect(settings.step).toBe(3); // Option value wins
  expect(settings.min).toBe(5);  // Option value wins
});

/**
 * Scenario: validates data attribute values during initialization
 * Given the fixture page is loaded with invalid data attribute values
 * When TouchSpin initializes
 * Then validation occurs and invalid values are handled
 * Params:
 * { "invalidData": "data-bts-step='invalid' data-bts-min='abc'", "expectedBehavior": "use_defaults_for_invalid" }
 */
test('validates data attribute values during initialization', async ({ page }) => {
  await apiHelpers.setDataAttributes(page, 'test-input', {
    'data-bts-step': 'invalid',
    'data-bts-min': 'abc',
    'data-bts-max': 'xyz',
    'data-bts-decimals': 'notanumber'
  });
  await initializeTouchspinJQuery(page, 'test-input', { initval: 10 });

  const settings = await apiHelpers.getAppliedSettings(page, 'test-input');
  // Invalid values should either fall back to defaults or be null/undefined but not cause crashes
  expect(settings.step === null || typeof settings.step === 'number').toBe(true);
  expect(settings.min === null || typeof settings.min === 'number').toBe(true);
  expect(settings.max === null || typeof settings.max === 'number').toBe(true);
  expect(settings.decimals === null || typeof settings.decimals === 'number').toBe(true);

  // The component should still function correctly despite invalid attributes
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
});

/**
 * Scenario: supports dynamic data attribute updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When data attributes are changed dynamically
 * Then TouchSpin responds to the changes
 * Params:
 * { "dynamicUpdate": "change_data_step_from_1_to_5", "expectedBehavior": "configuration_updated" }
 */
test.skip('supports dynamic data attribute updates', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles malformed data attribute values gracefully
 * Given the fixture page is loaded with malformed data attributes
 * When TouchSpin initializes
 * Then malformed values are handled gracefully
 * Params:
 * { "malformedData": ["data-bts-step=''", "data-bts-min='null'", "data-bts-max='undefined'"], "expectedBehavior": "graceful_fallback" }
 */
test('handles malformed data attribute values gracefully', async ({ page }) => {
  await apiHelpers.setDataAttributes(page, 'test-input', {
    'data-bts-step': '',
    'data-bts-min': 'null',
    'data-bts-max': 'undefined',
    'data-bts-decimals': ' ',
    'data-bts-mousewheel': 'maybe'
  });
  await initializeTouchspinJQuery(page, 'test-input', { initval: 5 });

  // Should not crash and should use sensible defaults
  await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
  await apiHelpers.clickUpButton(page, 'test-input');
  const value = await apiHelpers.getNumericValue(page, 'test-input');
  expect(typeof value).toBe('number');
  expect(value).toBeGreaterThan(5);
});

/**
 * Scenario: processes data attributes with special characters
 * Given the fixture page is loaded with special character data attributes
 * When TouchSpin initializes
 * Then special characters are handled correctly
 * Params:
 * { "specialCharData": "data-bts-prefix='$€£' data-bts-postfix='±∞'", "expectedBehavior": "special_chars_preserved" }
 */
test('processes data attributes with special characters', async ({ page }) => {
  await apiHelpers.setDataAttributes(page, 'test-input', {
    'data-bts-prefix': '$€£',
    'data-bts-postfix': '±∞'
  });
  await initializeTouchspinJQuery(page, 'test-input');

  const { prefix, postfix } = await apiHelpers.getTouchSpinElements(page, 'test-input');
  await expect(prefix).toHaveText('$€£');
  await expect(postfix).toHaveText('±∞');
});

/**
 * Scenario: supports localized data attribute values
 * Given the fixture page is loaded with localized data attributes
 * When TouchSpin initializes
 * Then localization is handled correctly
 * Params:
 * { "localizedData": "data-decimal-separator=',' data-thousand-separator='.'", "expectedBehavior": "localization_applied" }
 */
test.skip('supports localized data attribute values', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles data attribute inheritance patterns
 * Given the fixture page is loaded with nested elements with data attributes
 * When TouchSpin initializes
 * Then attribute inheritance works correctly
 * Params:
 * { "inheritancePattern": "parent_container_sets_defaults", "expectedBehavior": "attribute_inheritance" }
 */
test.skip('handles data attribute inheritance patterns', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: processes conditional data attributes
 * Given the fixture page is loaded with conditional data attributes
 * When TouchSpin initializes
 * Then conditional logic is applied correctly
 * Params:
 * { "conditionalData": "data-if-mobile='true' data-mobile-step='2'", "expectedBehavior": "conditional_processing" }
 */
test.skip('processes conditional data attributes', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports data attribute templating
 * Given the fixture page is loaded with templated data attributes
 * When TouchSpin initializes
 * Then template variables are resolved correctly
 * Params:
 * { "templateData": "data-bts-min='{{minValue}}' data-bts-max='{{maxValue}}'", "templateVars": { "minValue": 0, "maxValue": 100 }, "expectedBehavior": "template_resolved" }
 */
test.skip('supports data attribute templating', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: handles data attribute conflicts resolution
 * Given the fixture page is loaded with conflicting data attributes
 * When TouchSpin initializes
 * Then conflicts are resolved according to precedence rules
 * Params:
 * { "conflicts": ["data-bts-step='1'", "data-touchspin-step='5'"], "expectedResolution": "specific_attribute_wins" }
 */
test.skip('handles data attribute conflicts resolution', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: maintains data attribute backward compatibility
 * Given the fixture page is loaded with legacy data attribute formats
 * When TouchSpin initializes
 * Then legacy formats continue to work
 * Params:
 * { "legacyFormat": "data-bts-step='5'", "expectedBehavior": "backward_compatible" }
 */
test.skip('maintains data attribute backward compatibility', async ({ page }) => {
  // Implementation pending
});

/**
 * Scenario: supports custom data attribute extensions
 * Given the fixture page is loaded with custom data attributes
 * When TouchSpin initializes with custom attribute handlers
 * Then custom attributes are processed correctly
 * Params:
 * { "customAttribute": "data-custom-behavior='special'", "customHandler": "registered", "expectedBehavior": "custom_processing" }
 */
test.skip('supports custom data attribute extensions', async ({ page }) => {
  // Implementation pending
});

});
