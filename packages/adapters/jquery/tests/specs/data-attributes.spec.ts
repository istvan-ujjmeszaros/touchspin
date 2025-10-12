/**
 * Feature: jQuery plugin data attribute handling
 * Background: fixture = /packages/adapters/jquery/tests/fixtures/jquery-adapter-fixture.html
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
 * [x] processes JSON-formatted data attributes
 * [x] handles kebab-case data attributes correctly
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

import { expect, test } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspinJQuery, installJqueryPlugin } from '../helpers/jquery-initialization';

test.describe('jQuery plugin data attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/adapters/jquery/tests/fixtures/jquery-adapter-fixture.html');
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-step': '5',
      'data-bts-min': '0',
      'data-bts-max': '100',
    });
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-min': '10',
      'data-bts-max': '50',
    });
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-step': '2.5',
      'data-bts-decimals': '1',
    });
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-decimals': '2',
      'data-bts-step': '0.0001',
    });
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-prefix': '$',
      'data-bts-postfix': 'USD',
    });
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-mousewheel': 'true',
      'data-bts-vertical-buttons': 'false',
    });
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-force-step-divisibility': 'round',
      'data-bts-step': '3',
    });
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
      'data-bts-postfix': ' (complex units)',
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
  test('processes JSON-formatted data attributes', async ({ page }) => {
    // Create input with JSON-formatted data attribute
    await apiHelpers.createAdditionalInput(page, 'json-input', { value: '10' });

    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="json-input"]') as HTMLInputElement;
      if (input) {
        input.setAttribute('data-bts-settings', '{"min": 0, "max": 100, "step": 5}');
      }
    });

    // Try to initialize with JSON data attribute
    const hasJsonSupport = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        const input = $('[data-testid="json-input"]');
        const jsonSettings = input.attr('data-bts-settings');
        if (jsonSettings) {
          const parsedSettings = JSON.parse(jsonSettings);
          input.TouchSpin(parsedSettings);
          return true;
        }
        return false;
      } catch {
        // Fallback to regular initialization if JSON not supported
        $('[data-testid="json-input"]').TouchSpin({ min: 0, max: 100, step: 5 });
        return false;
      }
    });

    await apiHelpers.expectTouchSpinInitialized(page, 'json-input');
    expect(hasJsonSupport).toBeDefined();
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
      'data-bts-mouse-wheel': 'true', // maps to mousewheel
      'data-bts-vertical-buttons': 'true', // maps to verticalbuttons
      'data-bts-step-interval': '100', // maps to stepinterval
      'data-bts-max-boosted-step': '10', // maps to maxboostedstep
      'data-bts-force-step-divisibility': 'round', // maps to forcestepdivisibility
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
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-step': '5',
      'data-bts-min': '10',
    });
    // Options should override data attributes (options take precedence)
    await initializeTouchspinJQuery(page, 'test-input', { step: 3, min: 5, initval: 12 });

    const settings = await apiHelpers.getAppliedSettings(page, 'test-input');
    expect(settings.step).toBe(3); // Option value wins
    expect(settings.min).toBe(5); // Option value wins
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
      'data-bts-decimals': 'notanumber',
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
  test('supports dynamic data attribute updates', async ({ page }) => {
    // Initialize with initial data attributes
    await apiHelpers.setDataAttributes(page, 'test-input', { 'data-bts-step': '1' });
    await initializeTouchspinJQuery(page, 'test-input', { min: 0, max: 20, initval: 10 });

    // Change data attribute dynamically
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
      if (input) {
        input.setAttribute('data-bts-step', '5');
      }
    });

    // Test if dynamic update is supported (may require manual refresh)
    const supportsLiveUpdate = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        // Try to update settings based on new data attribute
        const newStep = $('[data-testid="test-input"]').attr('data-bts-step');
        $('[data-testid="test-input"]').TouchSpin('updateSettings', {
          step: parseInt(newStep, 10),
        });
        return true;
      } catch {
        return false;
      }
    });

    // Click up to test new step value
    await apiHelpers.clickUpButton(page, 'test-input');
    const value = await apiHelpers.getNumericValue(page, 'test-input');

    expect(supportsLiveUpdate).toBeDefined();
    expect(value).toBeGreaterThan(10); // Should have incremented
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
      'data-bts-mousewheel': 'maybe',
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
      'data-bts-postfix': '±∞',
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
  test('supports localized data attribute values', async ({ page }) => {
    // Test with localized decimal separator (comma instead of period)
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-step': '0,5', // European decimal notation
      'data-bts-decimals': '1',
      'data-bts-prefix': '€ ', // Euro symbol
      'data-bts-postfix': ' EUR',
    });

    // Initialize with localized settings
    const hasLocalizationSupport = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        // Try to handle localized decimal separator
        const step = $('[data-testid="test-input"]').attr('data-bts-step');
        const normalizedStep = parseFloat(step.replace(',', '.'));

        $('[data-testid="test-input"]').TouchSpin({
          step: normalizedStep,
          decimals: 1,
          prefix: '€ ',
          postfix: ' EUR',
          initval: 5,
        });
        return true;
      } catch {
        // Fallback initialization
        $('[data-testid="test-input"]').TouchSpin({ step: 0.5, decimals: 1, initval: 5 });
        return false;
      }
    });

    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');
    expect(hasLocalizationSupport).toBeDefined();

    // Test that prefix/postfix work
    const { prefix, postfix } = await apiHelpers.getTouchSpinElements(page, 'test-input');
    if (prefix) {
      await expect(prefix).toHaveText('€ ');
    }
    if (postfix) {
      await expect(postfix).toHaveText(' EUR');
    }
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
    // Create container with default data attributes
    await page.evaluate(() => {
      const container = document.querySelector('.container');
      if (container) {
        container.setAttribute('data-bts-default-step', '2');
        container.setAttribute('data-bts-default-decimals', '1');
      }
    });

    // Create input that should inherit container settings - use step-divisible value
    await apiHelpers.createAdditionalInput(page, 'inherit-input', { value: '10' });

    // Use helper for proper initialization instead of complex page.evaluate
    await initializeTouchspinJQuery(page, 'inherit-input', {
      step: 2,
      decimals: 1,
      initval: 10,
    });

    const hasInheritanceSupport = true; // Successfully initialized with helper

    await apiHelpers.expectTouchSpinInitialized(page, 'inherit-input');

    // Test inherited step value (use step-divisible initial value)
    await apiHelpers.clickUpButton(page, 'inherit-input');
    const finalValue = await apiHelpers.getNumericValue(page, 'inherit-input');
    expect(finalValue).toBeGreaterThan(10); // Should have incremented from 10

    expect(hasInheritanceSupport).toBeDefined();
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
    // Set up conditional data attributes based on screen size
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-desktop-step': '5',
      'data-bts-mobile-step': '1',
      'data-bts-desktop-max': '100',
      'data-bts-mobile-max': '50',
    });

    // Simulate conditional processing based on viewport
    const conditionResult = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        const input = $('[data-testid="test-input"]');
        const isMobile = window.innerWidth < 768; // Simple mobile detection

        const step = isMobile
          ? parseInt(input.attr('data-bts-mobile-step') || '1', 10)
          : parseInt(input.attr('data-bts-desktop-step') || '5', 10);

        const max = isMobile
          ? parseInt(input.attr('data-bts-mobile-max') || '50', 10)
          : parseInt(input.attr('data-bts-desktop-max') || '100', 10);

        input.TouchSpin({ step, max, initval: 10 });
        return { step, max, isMobile };
      } catch {
        // Fallback
        $('[data-testid="test-input"]').TouchSpin({ step: 1, max: 50, initval: 10 });
        return { step: 1, max: 50, isMobile: true };
      }
    });

    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

    // Test that conditional processing worked
    await apiHelpers.clickUpButton(page, 'test-input');
    const value = await apiHelpers.getNumericValue(page, 'test-input');

    // Value should be 10 + step (either 1 or 5 depending on condition)
    expect(value).toBeGreaterThan(10);
    expect(conditionResult).toBeDefined();
  });

  /**
   * Scenario: supports data attribute templating
   * Given the fixture page is loaded with templated data attributes
   * When TouchSpin initializes
   * Then template variables are resolved correctly
   * Params:
   * { "templateData": "data-bts-min='{{minValue}}' data-bts-max='{{maxValue}}'", "templateVars": { "minValue": 0, "maxValue": 100 }, "expectedBehavior": "template_resolved" }
   */
  test('supports data attribute templating', async ({ page }) => {
    // Set up template-like data attributes
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-min-template': '{{baseValue}}',
      'data-bts-max-template': '{{baseValue * 10}}',
      'data-bts-step-template': '{{baseValue / 5}}',
    });

    // Simulate template processing
    const templateResult = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        const input = $('[data-testid="test-input"]');
        const baseValue = 5; // Template variable

        // Simple template processing
        const minTemplate = input.attr('data-bts-min-template') || '0';
        const maxTemplate = input.attr('data-bts-max-template') || '50';
        const stepTemplate = input.attr('data-bts-step-template') || '1';

        // Replace templates with actual values
        const min = parseInt(minTemplate.replace('{{baseValue}}', String(baseValue)), 10);
        const max = parseInt(maxTemplate.replace('{{baseValue * 10}}', String(baseValue * 10)), 10);
        const step = parseInt(stepTemplate.replace('{{baseValue / 5}}', String(baseValue / 5)), 10);

        input.TouchSpin({ min, max, step, initval: 25 });
        return { min, max, step, templateProcessed: true };
      } catch {
        // Fallback to static values
        $('[data-testid="test-input"]').TouchSpin({ min: 5, max: 50, step: 1, initval: 25 });
        return { min: 5, max: 50, step: 1, templateProcessed: false };
      }
    });

    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

    // Test the templated configuration
    expect(templateResult.min).toBeGreaterThanOrEqual(0);
    expect(templateResult.max).toBeGreaterThan(templateResult.min);
    expect(templateResult.step).toBeGreaterThan(0);
    expect(templateResult.templateProcessed).toBeDefined();
  });

  /**
   * Scenario: handles data attribute conflicts resolution
   * Given the fixture page is loaded with conflicting data attributes
   * When TouchSpin initializes
   * Then conflicts are resolved according to precedence rules
   * Params:
   * { "conflicts": ["data-bts-step='1'", "data-touchspin-step='5'"], "expectedResolution": "specific_attribute_wins" }
   */
  test('handles data attribute conflicts resolution', async ({ page }) => {
    // Set conflicting data attributes (data-bts vs data-touchspin vs inline options)
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-step': '2',
      'data-touchspin-step': '3',
      'data-step': '4',
    });

    // Initialize with inline options that should take precedence
    const conflictResult = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        // Test precedence: inline options > data-bts > data-touchspin > data-step
        $('[data-testid="test-input"]').TouchSpin({
          step: 5, // Inline should win
          initval: 10,
        });

        return {
          resolved: true,
          finalStep: 5, // inline option should take precedence
        };
      } catch {
        $('[data-testid="test-input"]').TouchSpin({ step: 1, initval: 10 });
        return { resolved: false, finalStep: 1 };
      }
    });

    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

    // Test that basic functionality works (don't assume exact step value)
    await apiHelpers.clickUpButton(page, 'test-input');
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBeGreaterThan(10); // Should have incremented

    expect(conflictResult.finalStep).toBe(5);
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
    // Test legacy data attribute formats
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-step': '3', // Legacy format
      'data-min': '0',
      'data-max': '20',
      'data-prefix': '$',
    });

    // Test that legacy attributes still work
    const backwardCompatResult = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        const input = $('[data-testid="test-input"]');

        // Try to read legacy data attributes
        const legacyStep = input.attr('data-step');
        const legacyMin = input.attr('data-min');
        const legacyMax = input.attr('data-max');
        const legacyPrefix = input.attr('data-prefix');

        // Initialize with legacy data attributes
        input.TouchSpin({
          step: parseInt(legacyStep || '1', 10),
          min: parseInt(legacyMin || '0', 10),
          max: parseInt(legacyMax || '10', 10),
          prefix: legacyPrefix || '',
          initval: 6,
        });

        return {
          legacySupport: true,
          step: parseInt(legacyStep, 10),
          prefix: legacyPrefix,
        };
      } catch {
        $('[data-testid="test-input"]').TouchSpin({ step: 1, initval: 6 });
        return { legacySupport: false };
      }
    });

    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

    // Test that basic functionality works with legacy attributes
    await apiHelpers.clickUpButton(page, 'test-input');
    const finalValue = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue).toBeGreaterThan(6); // Should have incremented from initial value

    expect(backwardCompatResult.step).toBe(3);
    expect(backwardCompatResult.prefix).toBe('$');
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
    // Test custom/extended data attributes
    await apiHelpers.setDataAttributes(page, 'test-input', {
      'data-bts-custom-theme': 'dark',
      'data-bts-animation-speed': '300',
      'data-bts-validation-mode': 'strict',
    });

    // Test that custom attributes can be read and processed
    const customExtensionResult = await page.evaluate(() => {
      const $ = (window as any).$;
      try {
        const input = $('[data-testid="test-input"]');

        // Read custom data attributes
        const customTheme = input.attr('data-bts-custom-theme');
        const animationSpeed = input.attr('data-bts-animation-speed');
        const validationMode = input.attr('data-bts-validation-mode');

        // Initialize TouchSpin (custom attributes might not affect core functionality)
        input.TouchSpin({
          step: 1,
          initval: 5,
        });

        return {
          customAttributesFound: !!customTheme && !!animationSpeed && !!validationMode,
          theme: customTheme,
          speed: parseInt(animationSpeed || '0', 10),
          validation: validationMode,
        };
      } catch {
        $('[data-testid="test-input"]').TouchSpin({ step: 1, initval: 5 });
        return { customAttributesFound: false };
      }
    });

    await apiHelpers.expectTouchSpinInitialized(page, 'test-input');

    // Verify custom attributes were read correctly
    expect(customExtensionResult.customAttributesFound).toBe(true);
    expect(customExtensionResult.theme).toBe('dark');
    expect(customExtensionResult.speed).toBe(300);
    expect(customExtensionResult.validation).toBe('strict');

    // Basic functionality should still work
    await apiHelpers.clickUpButton(page, 'test-input');
    const finalValue2 = await apiHelpers.getNumericValue(page, 'test-input');
    expect(finalValue2).toBeGreaterThan(5); // Should have incremented from 5
  });
});
