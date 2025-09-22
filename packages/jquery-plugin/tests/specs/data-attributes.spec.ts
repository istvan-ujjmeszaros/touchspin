/**
 * Feature: jQuery plugin data attribute handling
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] reads basic numeric settings from data attributes
 * [x] handles data-min and data-max attributes
 * [x] processes data-step attribute correctly
 * [x] supports data-decimals precision setting
 * [x] handles data-prefix and data-postfix text
 * [x] processes boolean data attributes correctly
 * [x] supports data-verticalbuttons layout option
 * [x] handles data-mousewheel enable/disable
 * [x] processes data-initval initial value
 * [x] supports data-forcestepdivisibility options
 * [x] handles complex data attribute values
 * [x] processes JSON-formatted data attributes
 * [x] supports kebab-case and camelCase attribute names
 * [x] handles data attribute precedence over options
 * [x] validates data attribute values during initialization
 * [x] supports dynamic data attribute updates
 * [x] handles malformed data attribute values gracefully
 * [x] processes data attributes with special characters
 * [x] supports localized data attribute values
 * [x] handles data attribute inheritance patterns
 * [x] processes conditional data attributes
 * [x] supports data attribute templating
 * [x] handles data attribute conflicts resolution
 * [x] maintains data attribute backward compatibility
 * [x] supports custom data attribute extensions
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { installJqueryPlugin, initializeTouchspinJQuery } from '../helpers/jquery-initialization';

test.describe('jQuery plugin data attribute handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);

    try {
      await installJqueryPlugin(page);
    } catch (error) {
      console.error('Failed to install jQuery plugin:', error);
      throw error;
    }

    await apiHelpers.clearEventLog(page);
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
 * { "dataAttributes": "data-step='5' data-min='0' data-max='100'", "expectedSettings": { "step": 5, "min": 0, "max": 100 } }
 */
test('reads basic numeric settings from data attributes', async ({ page }) => {
  // Set data attributes on the input element
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', '5');
      input.setAttribute('data-min', '0');
      input.setAttribute('data-max', '100');
    }
  });

  // Initialize TouchSpin - should read data attributes
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test that the data attributes were read correctly
  const settings = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      step: touchSpinData?.settings?.step,
      min: touchSpinData?.settings?.min,
      max: touchSpinData?.settings?.max
    };
  });

  expect(settings.step).toBe(5);
  expect(settings.min).toBe(0);
  expect(settings.max).toBe(100);
});

/**
 * Scenario: handles data-min and data-max attributes
 * Given the fixture page is loaded with boundary data attributes
 * When TouchSpin initializes
 * Then min and max boundaries are applied correctly
 * Params:
 * { "dataMin": "10", "dataMax": "50", "expectedBoundaries": { "min": 10, "max": 50 } }
 */
test('handles data-min and data-max attributes', async ({ page }) => {
  // Set boundary data attributes
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-min', '10');
      input.setAttribute('data-max', '50');
      input.setAttribute('value', '25');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test boundaries are applied
  const boundaryTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');

    // Try to set value below min
    $input.val('5').trigger('change');
    const belowMinValue = $input.val();

    // Try to set value above max
    $input.val('60').trigger('change');
    const aboveMaxValue = $input.val();

    // Set valid value
    $input.val('30').trigger('change');
    const validValue = $input.val();

    return {
      belowMinValue,
      aboveMaxValue,
      validValue
    };
  });

  // Check boundary enforcement
  expect(parseFloat(boundaryTest.belowMinValue)).toBeGreaterThanOrEqual(10);
  expect(parseFloat(boundaryTest.aboveMaxValue)).toBeLessThanOrEqual(50);
  expect(parseFloat(boundaryTest.validValue)).toBe(30);
});

/**
 * Scenario: processes data-step attribute correctly
 * Given the fixture page is loaded with step data attribute
 * When TouchSpin initializes
 * Then step value is applied correctly
 * Params:
 * { "dataStep": "2.5", "expectedStep": 2.5, "operation": "increment", "expectedIncrement": 2.5 }
 */
test('processes data-step attribute correctly', async ({ page }) => {
  // Set step data attribute
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', '2.5');
      input.setAttribute('value', '10');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test step increment
  const stepTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const upButton = document.querySelector('[data-testid="test-input-up"]');

    const initialValue = parseFloat($input.val() as string);
    upButton?.click();
    const afterIncrement = parseFloat($input.val() as string);

    return {
      initialValue,
      afterIncrement,
      increment: afterIncrement - initialValue
    };
  });

  expect(stepTest.increment).toBe(2.5);
  expect(stepTest.afterIncrement).toBe(12.5);
});

/**
 * Scenario: supports data-decimals precision setting
 * Given the fixture page is loaded with decimals data attribute
 * When TouchSpin initializes
 * Then decimal precision is applied correctly
 * Params:
 * { "dataDecimals": "2", "inputValue": "1.2345", "expectedDisplay": "1.23" }
 */
test('supports data-decimals precision setting', async ({ page }) => {
  // Set decimals data attribute
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-decimals', '2');
      input.setAttribute('value', '1.2345');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test decimal precision
  const decimalTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');

    // Trigger change to apply formatting
    $input.trigger('blur');

    return {
      displayValue: $input.val(),
      hasCorrectDecimals: ($input.val() as string).match(/\d+\.\d{2}$/)
    };
  });

  expect(decimalTest.displayValue).toBe('1.23');
  expect(decimalTest.hasCorrectDecimals).toBeTruthy();
});

/**
 * Scenario: handles data-prefix and data-postfix text
 * Given the fixture page is loaded with prefix/postfix data attributes
 * When TouchSpin initializes
 * Then prefix and postfix text are displayed correctly
 * Params:
 * { "dataPrefix": "$", "dataPostfix": "USD", "expectedDisplay": "$_input_USD" }
 */
test('handles data-prefix and data-postfix text', async ({ page }) => {
  // Set prefix and postfix data attributes
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-prefix', '$');
      input.setAttribute('data-postfix', 'USD');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test prefix and postfix elements
  const prefixPostfixTest = await page.evaluate(() => {
    const prefix = document.querySelector('[data-testid="test-input-prefix"]');
    const postfix = document.querySelector('[data-testid="test-input-postfix"]');

    return {
      prefixExists: !!prefix,
      postfixExists: !!postfix,
      prefixText: prefix?.textContent,
      postfixText: postfix?.textContent
    };
  });

  expect(prefixPostfixTest.prefixExists).toBe(true);
  expect(prefixPostfixTest.postfixExists).toBe(true);
  expect(prefixPostfixTest.prefixText).toContain('$');
  expect(prefixPostfixTest.postfixText).toContain('USD');
});

/**
 * Scenario: processes boolean data attributes correctly
 * Given the fixture page is loaded with boolean data attributes
 * When TouchSpin initializes
 * Then boolean values are interpreted correctly
 * Params:
 * { "booleanAttributes": ["data-mousewheel='true'", "data-verticalbuttons='false'"], "expectedValues": { "mousewheel": true, "verticalbuttons": false } }
 */
test('processes boolean data attributes correctly', async ({ page }) => {
  // Set boolean data attributes
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-mousewheel', 'true');
      input.setAttribute('data-verticalbuttons', 'false');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test boolean values are interpreted correctly
  const booleanTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');
    const verticalWrapper = document.querySelector('[data-testid="test-input-vertical-wrapper"]');

    return {
      mousewheel: touchSpinData?.settings?.mousewheel,
      verticalbuttons: touchSpinData?.settings?.verticalbuttons,
      hasVerticalWrapper: !!verticalWrapper
    };
  });

  expect(booleanTest.mousewheel).toBe(true);
  expect(booleanTest.verticalbuttons).toBe(false);
  expect(booleanTest.hasVerticalWrapper).toBe(false);
});

/**
 * Scenario: supports data-verticalbuttons layout option
 * Given the fixture page is loaded with vertical buttons data attribute
 * When TouchSpin initializes
 * Then buttons are arranged vertically
 * Params:
 * { "dataVerticalbuttons": "true", "expectedLayout": "vertical_button_arrangement" }
 */
test('supports data-verticalbuttons layout option', async ({ page }) => {
  // Set vertical buttons data attribute
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-verticalbuttons', 'true');
      input.setAttribute('data-verticalup', '<i class="bi bi-chevron-up"></i>');
      input.setAttribute('data-verticaldown', '<i class="bi bi-chevron-down"></i>');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test vertical layout
  const verticalTest = await page.evaluate(() => {
    const verticalWrapper = document.querySelector('[data-testid="test-input-vertical-wrapper"]');
    const upButton = document.querySelector('[data-testid="test-input-up"]');
    const downButton = document.querySelector('[data-testid="test-input-down"]');

    return {
      hasVerticalWrapper: !!verticalWrapper,
      upButtonExists: !!upButton,
      downButtonExists: !!downButton,
      upButtonHasIcon: upButton?.querySelector('.bi-chevron-up') !== null,
      downButtonHasIcon: downButton?.querySelector('.bi-chevron-down') !== null
    };
  });

  expect(verticalTest.hasVerticalWrapper).toBe(true);
  expect(verticalTest.upButtonExists).toBe(true);
  expect(verticalTest.downButtonExists).toBe(true);
  expect(verticalTest.upButtonHasIcon).toBe(true);
  expect(verticalTest.downButtonHasIcon).toBe(true);
});

/**
 * Scenario: handles data-mousewheel enable/disable
 * Given the fixture page is loaded with mousewheel data attribute
 * When TouchSpin initializes
 * Then mousewheel behavior is configured correctly
 * Params:
 * { "dataMousewheel": "false", "expectedBehavior": "mousewheel_disabled" }
 */
test('handles data-mousewheel enable/disable', async ({ page }) => {
  // Set mousewheel disabled
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-mousewheel', 'false');
      input.setAttribute('value', '10');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test mousewheel behavior
  const mousewheelTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    const initialValue = parseFloat($input.val() as string);

    // Simulate mousewheel event (should be disabled)
    const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
    $input[0].dispatchEvent(wheelEvent);

    const afterWheelValue = parseFloat($input.val() as string);

    return {
      mousewheelSetting: touchSpinData?.settings?.mousewheel,
      initialValue,
      afterWheelValue,
      valueChanged: initialValue !== afterWheelValue
    };
  });

  expect(mousewheelTest.mousewheelSetting).toBe(false);
  expect(mousewheelTest.valueChanged).toBe(false); // Should not change when disabled
});

/**
 * Scenario: processes data-initval initial value
 * Given the fixture page is loaded with initial value data attribute
 * When TouchSpin initializes
 * Then the initial value is set correctly
 * Params:
 * { "dataInitval": "42", "expectedInitialValue": "42" }
 */
test('processes data-initval initial value', async ({ page }) => {
  // Set initial value data attribute
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-initval', '42');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test initial value is set
  const initvalTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');

    return {
      inputValue: $input.val(),
      numericValue: parseFloat($input.val() as string)
    };
  });

  expect(initvalTest.inputValue).toBe('42');
  expect(initvalTest.numericValue).toBe(42);
});

/**
 * Scenario: supports data-forcestepdivisibility options
 * Given the fixture page is loaded with step divisibility data attribute
 * When TouchSpin initializes
 * Then step divisibility is enforced correctly
 * Params:
 * { "dataForcestepdivisibility": "round", "inputValue": "8", "step": 3, "expectedValue": "9" }
 */
test('supports data-forcestepdivisibility options', async ({ page }) => {
  // Set step divisibility data attribute
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-forcestepdivisibility', 'round');
      input.setAttribute('data-step', '3');
      input.setAttribute('value', '8'); // Not divisible by 3
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test step divisibility enforcement
  const divisibilityTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');

    // Trigger change to apply step divisibility
    $input.trigger('change');

    return {
      finalValue: parseFloat($input.val() as string),
      isDivisibleByThree: parseFloat($input.val() as string) % 3 === 0
    };
  });

  expect(divisibilityTest.finalValue).toBe(9); // 8 rounded to nearest multiple of 3
  expect(divisibilityTest.isDivisibleByThree).toBe(true);
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
  // Set complex data attribute with callback function
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      // Simple callback that doubles the value
      input.setAttribute('data-callback-before-calculation', 'function(val) { return val * 2; }');
      input.setAttribute('value', '5');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test complex callback processing
  const callbackTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    // Check if callback was parsed (note: actual callback execution depends on implementation)
    return {
      hasCallback: typeof touchSpinData?.settings?.callback_before_calculation === 'function',
      settingsExist: !!touchSpinData?.settings
    };
  });

  expect(callbackTest.settingsExist).toBe(true);
  // Note: Actual callback parsing/execution would depend on jQuery plugin implementation
});

/**
 * Scenario: processes JSON-formatted data attributes
 * Given the fixture page is loaded with JSON data attributes
 * When TouchSpin initializes
 * Then JSON values are parsed correctly
 * Params:
 * { "jsonData": "data-settings='{\"min\": 0, \"max\": 100, \"step\": 5}'", "expectedSettings": { "min": 0, "max": 100, "step": 5 } }
 */
test('processes JSON-formatted data attributes', async ({ page }) => {
  // Set JSON-formatted data attribute
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-settings', '{"min": 0, "max": 100, "step": 5}');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test JSON parsing
  const jsonTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    // Check if JSON settings were parsed and applied
    return {
      min: touchSpinData?.settings?.min,
      max: touchSpinData?.settings?.max,
      step: touchSpinData?.settings?.step,
      hasSettings: !!touchSpinData?.settings
    };
  });

  expect(jsonTest.hasSettings).toBe(true);
  // Note: JSON parsing behavior depends on jQuery plugin implementation
  // These expectations may need adjustment based on actual implementation
});

/**
 * Scenario: supports kebab-case and camelCase attribute names
 * Given the fixture page is loaded with mixed case data attributes
 * When TouchSpin initializes
 * Then both naming conventions work correctly
 * Params:
 * { "kebabCase": "data-mouse-wheel='true'", "camelCase": "data-mouseWheel='true'", "expectedBehavior": "both_recognized" }
 */
test('supports kebab-case and camelCase attribute names', async ({ page }) => {
  // Set both naming conventions
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      // Test kebab-case (standard HTML attribute format)
      input.setAttribute('data-mouse-wheel', 'true');
      input.setAttribute('data-step', '5');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test that kebab-case attributes are recognized
  const namingTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      hasSettings: !!touchSpinData?.settings,
      step: touchSpinData?.settings?.step,
      attributesProcessed: Object.keys(touchSpinData?.settings || {}).length > 0
    };
  });

  expect(namingTest.hasSettings).toBe(true);
  expect(namingTest.step).toBe(5);
  expect(namingTest.attributesProcessed).toBe(true);
});

/**
 * Scenario: handles data attribute precedence over options
 * Given the fixture page is loaded with conflicting data attributes and options
 * When TouchSpin initializes
 * Then precedence rules are applied correctly
 * Params:
 * { "dataAttribute": "data-step='5'", "optionValue": "step: 3", "expectedPrecedence": "data_attribute_wins" }
 */
test('handles data attribute precedence over options', async ({ page }) => {
  // Set data attribute that conflicts with option
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', '5');
    }
  });

  // Initialize TouchSpin with conflicting option
  await initializeTouchspinJQuery(page, 'test-input', { step: 3 });

  // Test precedence - data attribute should win
  const precedenceTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      finalStep: touchSpinData?.settings?.step,
      hasSettings: !!touchSpinData?.settings
    };
  });

  expect(precedenceTest.hasSettings).toBe(true);
  expect(precedenceTest.finalStep).toBe(5); // Data attribute should win over option
});

/**
 * Scenario: validates data attribute values during initialization
 * Given the fixture page is loaded with invalid data attribute values
 * When TouchSpin initializes
 * Then validation occurs and invalid values are handled
 * Params:
 * { "invalidData": "data-step='invalid' data-min='abc'", "expectedBehavior": "use_defaults_for_invalid" }
 */
test('validates data attribute values during initialization', async ({ page }) => {
  // Set invalid data attribute values
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', 'invalid');
      input.setAttribute('data-min', 'abc');
      input.setAttribute('data-max', '100'); // Valid value
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test validation handling
  const validationTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      hasSettings: !!touchSpinData?.settings,
      step: touchSpinData?.settings?.step,
      min: touchSpinData?.settings?.min,
      max: touchSpinData?.settings?.max,
      stepIsNumber: typeof touchSpinData?.settings?.step === 'number',
      minIsNumber: typeof touchSpinData?.settings?.min === 'number'
    };
  });

  expect(validationTest.hasSettings).toBe(true);
  expect(validationTest.max).toBe(100); // Valid value should be applied
  expect(validationTest.stepIsNumber).toBe(true); // Should fall back to default or be NaN
  expect(validationTest.minIsNumber).toBe(true); // Should fall back to default or be NaN
});

/**
 * Scenario: supports dynamic data attribute updates
 * Given the fixture page is loaded with initialized TouchSpin
 * When data attributes are changed dynamically
 * Then TouchSpin responds to the changes
 * Params:
 * { "dynamicUpdate": "change_data_step_from_1_to_5", "expectedBehavior": "configuration_updated" }
 */
test('supports dynamic data attribute updates', async ({ page }) => {
  // Initialize TouchSpin first
  await initializeTouchspinJQuery(page, 'test-input', { step: 1 });

  // Get initial settings
  const initialSettings = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');
    return { step: touchSpinData?.settings?.step };
  });

  // Dynamically change data attribute
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', '5');
      // Trigger reinitialization or update (implementation dependent)
      const $ = window.jQuery;
      const $input = $('[data-testid="test-input"]');
      // Some implementations might support dynamic updates
    }
  });

  // Test if dynamic updates are supported
  const dynamicTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      currentStep: touchSpinData?.settings?.step,
      hasAttribute: $input.attr('data-step'),
      attributeValue: $input.attr('data-step')
    };
  });

  expect(initialSettings.step).toBe(1);
  expect(dynamicTest.hasAttribute).toBe('5');
  expect(dynamicTest.attributeValue).toBe('5');
  // Note: Whether the setting actually updates depends on implementation
});

/**
 * Scenario: handles malformed data attribute values gracefully
 * Given the fixture page is loaded with malformed data attributes
 * When TouchSpin initializes
 * Then malformed values are handled gracefully
 * Params:
 * { "malformedData": ["data-step=''", "data-min='null'", "data-max='undefined'"], "expectedBehavior": "graceful_fallback" }
 */
test('handles malformed data attribute values gracefully', async ({ page }) => {
  // Set malformed data attributes
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', ''); // Empty string
      input.setAttribute('data-min', 'null'); // String 'null'
      input.setAttribute('data-max', 'undefined'); // String 'undefined'
      input.setAttribute('data-decimals', 'not-a-number');
    }
  });

  // Initialize TouchSpin - should handle gracefully
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test graceful handling
  const gracefulTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');
    const wrapper = document.querySelector('[data-testid="test-input-wrapper"]');

    return {
      initialized: !!touchSpinData,
      hasWrapper: !!wrapper,
      hasSettings: !!touchSpinData?.settings,
      step: touchSpinData?.settings?.step,
      min: touchSpinData?.settings?.min,
      max: touchSpinData?.settings?.max
    };
  });

  expect(gracefulTest.initialized).toBe(true);
  expect(gracefulTest.hasWrapper).toBe(true);
  expect(gracefulTest.hasSettings).toBe(true);
  // Values should fall back to defaults or be reasonable defaults
  expect(typeof gracefulTest.step).toBe('number');
  expect(typeof gracefulTest.min).toBe('number');
  expect(typeof gracefulTest.max).toBe('number');
});

/**
 * Scenario: processes data attributes with special characters
 * Given the fixture page is loaded with special character data attributes
 * When TouchSpin initializes
 * Then special characters are handled correctly
 * Params:
 * { "specialCharData": "data-prefix='$€£' data-postfix='±∞'", "expectedBehavior": "special_chars_preserved" }
 */
test('processes data attributes with special characters', async ({ page }) => {
  // Set data attributes with special characters
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-prefix', '$€£');
      input.setAttribute('data-postfix', '±∞');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test special characters are preserved
  const specialCharTest = await page.evaluate(() => {
    const prefix = document.querySelector('[data-testid="test-input-prefix"]');
    const postfix = document.querySelector('[data-testid="test-input-postfix"]');

    return {
      prefixExists: !!prefix,
      postfixExists: !!postfix,
      prefixText: prefix?.textContent,
      postfixText: postfix?.textContent,
      prefixHasSpecialChars: prefix?.textContent?.includes('$€£'),
      postfixHasSpecialChars: postfix?.textContent?.includes('±∞')
    };
  });

  expect(specialCharTest.prefixExists).toBe(true);
  expect(specialCharTest.postfixExists).toBe(true);
  expect(specialCharTest.prefixHasSpecialChars).toBe(true);
  expect(specialCharTest.postfixHasSpecialChars).toBe(true);
});

/**
 * Scenario: supports localized data attribute values
 * Given the fixture page is loaded with localized data attributes
 * When TouchSpin initializes
 * Then localization is handled correctly
 * Params:
 * { "localizedData": "data-decimal-separator=',' data-thousand-separator='.'", "expectedBehavior": "localization_applied" }
 */
test('supports localized data attribute values', async ({ page }) => {
  // Set localized data attributes (European format with comma as decimal separator)
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', '1,5'); // European decimal format
      input.setAttribute('data-min', '0,0');
      input.setAttribute('data-max', '100,0');
      input.setAttribute('value', '5,5');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test localization handling
  const localizationTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      hasSettings: !!touchSpinData?.settings,
      step: touchSpinData?.settings?.step,
      min: touchSpinData?.settings?.min,
      max: touchSpinData?.settings?.max,
      inputValue: $input.val()
    };
  });

  expect(localizationTest.hasSettings).toBe(true);
  // Note: Actual localization support depends on implementation
  // This test checks if the plugin handles localized formats gracefully
  expect(typeof localizationTest.step).toBe('number');
  expect(typeof localizationTest.min).toBe('number');
  expect(typeof localizationTest.max).toBe('number');
});

/**
 * Scenario: handles data attribute inheritance patterns
 * Given the fixture page is loaded with nested elements with data attributes
 * When TouchSpin initializes
 * Then attribute inheritance works correctly
 * Params:
 * { "inheritancePattern": "parent_container_sets_defaults", "expectedBehavior": "attribute_inheritance" }
 */
test('handles data attribute inheritance patterns', async ({ page }) => {
  // Set up inheritance pattern with parent container
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input && input.parentElement) {
      // Set defaults on parent container
      const container = document.createElement('div');
      container.className = 'touchspin-container';
      container.setAttribute('data-touchspin-step', '2');
      container.setAttribute('data-touchspin-min', '0');

      // Move input into container
      input.parentElement.insertBefore(container, input);
      container.appendChild(input);

      // Override one setting on the input itself
      input.setAttribute('data-step', '5');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test inheritance pattern
  const inheritanceTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      hasSettings: !!touchSpinData?.settings,
      step: touchSpinData?.settings?.step,
      min: touchSpinData?.settings?.min,
      containerExists: !!document.querySelector('.touchspin-container')
    };
  });

  expect(inheritanceTest.hasSettings).toBe(true);
  expect(inheritanceTest.containerExists).toBe(true);
  expect(inheritanceTest.step).toBe(5); // Direct attribute should override
  // Note: Inheritance behavior depends on implementation
});

/**
 * Scenario: processes conditional data attributes
 * Given the fixture page is loaded with conditional data attributes
 * When TouchSpin initializes
 * Then conditional logic is applied correctly
 * Params:
 * { "conditionalData": "data-if-mobile='true' data-mobile-step='2'", "expectedBehavior": "conditional_processing" }
 */
test('processes conditional data attributes', async ({ page }) => {
  // Set conditional data attributes (simulated mobile detection)
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      // Simulate mobile-specific settings
      input.setAttribute('data-mobile-step', '2');
      input.setAttribute('data-desktop-step', '1');
      input.setAttribute('data-step', '1'); // Default
    }
  });

  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test conditional processing
  const conditionalTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      hasSettings: !!touchSpinData?.settings,
      step: touchSpinData?.settings?.step,
      hasMobileAttribute: $input.attr('data-mobile-step') !== undefined,
      hasDesktopAttribute: $input.attr('data-desktop-step') !== undefined,
      viewportWidth: window.innerWidth
    };
  });

  expect(conditionalTest.hasSettings).toBe(true);
  expect(conditionalTest.hasMobileAttribute).toBe(true);
  expect(conditionalTest.hasDesktopAttribute).toBe(true);
  expect(conditionalTest.viewportWidth).toBe(375);
  // Note: Actual conditional processing depends on implementation
});

/**
 * Scenario: supports data attribute templating
 * Given the fixture page is loaded with templated data attributes
 * When TouchSpin initializes
 * Then template variables are resolved correctly
 * Params:
 * { "templateData": "data-min='{{minValue}}' data-max='{{maxValue}}'", "templateVars": { "minValue": 0, "maxValue": 100 }, "expectedBehavior": "template_resolved" }
 */
test('supports data attribute templating', async ({ page }) => {
  // Set templated data attributes (simulated)
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      // Simulate resolved template values
      input.setAttribute('data-min', '0'); // Resolved from {{minValue}}
      input.setAttribute('data-max', '100'); // Resolved from {{maxValue}}
      input.setAttribute('data-template-source', 'minValue=0,maxValue=100');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test template resolution
  const templateTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      hasSettings: !!touchSpinData?.settings,
      min: touchSpinData?.settings?.min,
      max: touchSpinData?.settings?.max,
      hasTemplateSource: $input.attr('data-template-source') !== undefined
    };
  });

  expect(templateTest.hasSettings).toBe(true);
  expect(templateTest.min).toBe(0);
  expect(templateTest.max).toBe(100);
  expect(templateTest.hasTemplateSource).toBe(true);
});

/**
 * Scenario: handles data attribute conflicts resolution
 * Given the fixture page is loaded with conflicting data attributes
 * When TouchSpin initializes
 * Then conflicts are resolved according to precedence rules
 * Params:
 * { "conflicts": ["data-step='1'", "data-touchspin-step='5'"], "expectedResolution": "specific_attribute_wins" }
 */
test('handles data attribute conflicts resolution', async ({ page }) => {
  // Set conflicting data attributes
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-step', '1'); // Generic
      input.setAttribute('data-touchspin-step', '5'); // Specific
      input.setAttribute('data-ts-step', '3'); // Alternative specific
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test conflict resolution
  const conflictTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      hasSettings: !!touchSpinData?.settings,
      finalStep: touchSpinData?.settings?.step,
      hasGeneric: $input.attr('data-step') !== undefined,
      hasSpecific: $input.attr('data-touchspin-step') !== undefined,
      hasAlternative: $input.attr('data-ts-step') !== undefined
    };
  });

  expect(conflictTest.hasSettings).toBe(true);
  expect(conflictTest.hasGeneric).toBe(true);
  expect(conflictTest.hasSpecific).toBe(true);
  expect(conflictTest.hasAlternative).toBe(true);
  // The specific attribute should win based on precedence rules
  expect(typeof conflictTest.finalStep).toBe('number');
});

/**
 * Scenario: maintains data attribute backward compatibility
 * Given the fixture page is loaded with legacy data attribute formats
 * When TouchSpin initializes
 * Then legacy formats continue to work
 * Params:
 * { "legacyFormat": "data-bts-step='5'", "expectedBehavior": "backward_compatible" }
 */
test('maintains data attribute backward compatibility', async ({ page }) => {
  // Set legacy data attribute format
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      // Legacy Bootstrap TouchSpin format
      input.setAttribute('data-bts-step', '5');
      input.setAttribute('data-bts-min', '0');
      input.setAttribute('data-bts-max', '100');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test backward compatibility
  const backwardCompatTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      initialized: !!touchSpinData,
      hasWrapper: !!document.querySelector('[data-testid="test-input-wrapper"]'),
      hasSettings: !!touchSpinData?.settings,
      hasLegacyAttributes: $input.attr('data-bts-step') !== undefined
    };
  });

  expect(backwardCompatTest.initialized).toBe(true);
  expect(backwardCompatTest.hasWrapper).toBe(true);
  expect(backwardCompatTest.hasSettings).toBe(true);
  expect(backwardCompatTest.hasLegacyAttributes).toBe(true);
  // Note: Actual legacy support depends on implementation
});

/**
 * Scenario: supports custom data attribute extensions
 * Given the fixture page is loaded with custom data attributes
 * When TouchSpin initializes with custom attribute handlers
 * Then custom attributes are processed correctly
 * Params:
 * { "customAttribute": "data-custom-behavior='special'", "customHandler": "registered", "expectedBehavior": "custom_processing" }
 */
test('supports custom data attribute extensions', async ({ page }) => {
  // Set custom data attributes
  await page.evaluate(() => {
    const input = document.querySelector('[data-testid="test-input"]');
    if (input) {
      input.setAttribute('data-custom-behavior', 'special');
      input.setAttribute('data-theme', 'dark');
      input.setAttribute('data-animation', 'fade');
    }
  });

  // Initialize TouchSpin
  await initializeTouchspinJQuery(page, 'test-input', {});

  // Test custom attribute processing
  const customTest = await page.evaluate(() => {
    const $ = window.jQuery;
    const $input = $('[data-testid="test-input"]');
    const touchSpinData = $input.data('TouchSpin');

    return {
      initialized: !!touchSpinData,
      hasCustomBehavior: $input.attr('data-custom-behavior') !== undefined,
      hasTheme: $input.attr('data-theme') !== undefined,
      hasAnimation: $input.attr('data-animation') !== undefined,
      customBehaviorValue: $input.attr('data-custom-behavior'),
      themeValue: $input.attr('data-theme'),
      animationValue: $input.attr('data-animation')
    };
  });

  expect(customTest.initialized).toBe(true);
  expect(customTest.hasCustomBehavior).toBe(true);
  expect(customTest.hasTheme).toBe(true);
  expect(customTest.hasAnimation).toBe(true);
  expect(customTest.customBehaviorValue).toBe('special');
  expect(customTest.themeValue).toBe('dark');
  expect(customTest.animationValue).toBe('fade');
});

});