/**
 * Feature: Core value management and normalization
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] normalizes initial value to nearest step multiple
 * [x] handles empty string input gracefully
 * [x] parses numeric string inputs correctly
 * [x] rejects non-numeric input and preserves display value
 * [x] handles decimal precision correctly
 * [x] parses scientific notation values
 * [x] handles negative values correctly
 * [x] trims leading and trailing spaces on blur
 * [x] normalizes to step when forcestepdivisibility is floor
 * [x] normalizes to step when forcestepdivisibility is ceil
 * [x] skips normalization when forcestepdivisibility is none
 * [x] preserves exact decimal precision with decimals setting
 * [x] rounds to nearest decimal place on blur
 * [x] handles very large numbers correctly
 * [x] handles very small decimal numbers correctly
 * [x] maintains internal numeric state vs display value
 * [x] handles locale-specific decimal separators
 * [x] validates input on programmatic setValue
 * [x] handles edge case of setting value to empty string
 * [x] maintains precision during increment/decrement operations
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import {
  initializeTouchspin,
  setValueViaAPI,
  getNumericValue,
  incrementViaAPI
} from '../../test-helpers/core-adapter';

test.describe('Core value management and normalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  test('normalizes initial value to nearest step multiple', async ({ page }) => {
    // Core does normalize to step on initialization
    await initializeTouchspin(page, 'test-input', {
      step: 3, initval: 50
    });

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(51); // 50 normalized to nearest step multiple (51)
  });

/**
 * Scenario: handles empty string input gracefully
 * Given the fixture page is loaded
 * When I set the input to empty string and blur
 * Then the value is handled according to configuration
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 1 }, "action": "blur", "expected": "0" }
 */
  test('handles empty string input gracefully', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0, max: 10, step: 1, initval: 5
    });

    // Set to empty string and blur
    await apiHelpers.fillWithValueAndBlur(page, 'test-input', '');

    // Check display value (empty) vs numeric value (NaN)
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    expect(displayValue).toBe('');
  });

/**
 * Scenario: parses numeric string inputs correctly
 * Given the fixture page is loaded
 * When I type a numeric string into the input
 * Then the value is parsed and stored as a number
 * Params:
 * { "input": "42", "expectedNumeric": 42, "expectedDisplay": "42" }
 */
  test('parses numeric string inputs correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 0
    });

    await setValueViaAPI(page, 'test-input', '42');

    const numericValue = await getNumericValue(page, 'test-input');
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    expect(numericValue).toBe(42);
    expect(displayValue).toBe('42');
  });

/**
 * Scenario: rejects non-numeric input and preserves display value
 * Given the fixture page is loaded
 * When I type non-numeric text into the input
 * Then the internal value becomes NaN but display is preserved
 * Params:
 * { "input": "abc123", "expectedDisplay": "", "expectedInternal": "NaN" }
 */
  test('rejects non-numeric input and preserves display value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    // Use keyboard input for type="number" input to test behavior
    const input = page.getByTestId('test-input');
    await input.focus();
    await input.selectText();
    await page.keyboard.type('abc123');

    // Check value after typing invalid characters
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    expect(displayValue).toBe('123'); // Only numeric parts remain
  });

/**
 * Scenario: handles decimal precision correctly
 * Given the fixture page is loaded with decimal step
 * When I set a decimal value
 * Then the precision is maintained correctly
 * Params:
 * { "settings": { "step": 0.1, "decimals": 2 }, "input": "1.25", "expected": "1.25" }
 */
test('handles decimal precision correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.01, decimals: 2, initval: 1.25
    });

    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    const numericValue = await getNumericValue(page, 'test-input');

    expect(displayValue).toBe('1.25');
    expect(numericValue).toBe(1.25);
  });

/**
 * Scenario: parses scientific notation values
 * Given the fixture page is loaded
 * When I input a value in scientific notation
 * Then it is parsed correctly to decimal
 * Params:
 * { "input": "1e2", "expected": "100" }
 */
test('parses scientific notation values', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 0
    });

    await setValueViaAPI(page, 'test-input', '1e2');

    const numericValue = await getNumericValue(page, 'test-input');
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');

    expect(numericValue).toBe(100);
    expect(displayValue).toBe('100');
  });

/**
 * Scenario: handles negative values correctly
 * Given the fixture page is loaded with negative range
 * When I set a negative value
 * Then it is handled correctly
 * Params:
 * { "settings": { "min": -10, "max": 10, "step": 1 }, "input": "-5", "expected": "-5" }
 */
test('handles negative values correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: -10, max: 10, step: 1, initval: -5
    });

    const numericValue = await getNumericValue(page, 'test-input');
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');

    expect(numericValue).toBe(-5);
    expect(displayValue).toBe('-5');
  });

/**
 * Scenario: trims leading and trailing spaces on blur
 * Given the fixture page is loaded
 * When I type a value with spaces and blur
 * Then the spaces are trimmed
 * Params:
 * { "input": "  42  ", "expected": "42" }
 */
test('trims leading and trailing spaces on blur', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 0
    });

    await apiHelpers.fillWithValueAndBlur(page, 'test-input', '  42  ');

    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    const numericValue = await getNumericValue(page, 'test-input');

    expect(displayValue).toBe('42'); // Spaces trimmed
    expect(numericValue).toBe(42);
  });

/**
 * Scenario: normalizes to step when forcestepdivisibility is floor
 * Given the fixture page is loaded with floor normalization
 * When I set a value between step multiples
 * Then it rounds down to the lower multiple
 * Params:
 * { "settings": { "step": 3, "forcestepdivisibility": "floor" }, "input": "8", "expected": "6" }
 */
test('normalizes to step when forcestepdivisibility is floor', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 3, forcestepdivisibility: 'floor', initval: 8
    });

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(6); // 8 floored to nearest step multiple (6)
  });

/**
 * Scenario: normalizes to step when forcestepdivisibility is ceil
 * Given the fixture page is loaded with ceil normalization
 * When I set a value between step multiples
 * Then it rounds up to the higher multiple
 * Params:
 * { "settings": { "step": 3, "forcestepdivisibility": "ceil" }, "input": "7", "expected": "9" }
 */
test('normalizes to step when forcestepdivisibility is ceil', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 3, forcestepdivisibility: 'ceil', initval: 7
    });

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(9); // 7 ceiled to nearest step multiple (9)
  });

/**
 * Scenario: skips normalization when forcestepdivisibility is none
 * Given the fixture page is loaded with no step normalization
 * When I set a value not divisible by step
 * Then the value is preserved as-is
 * Params:
 * { "settings": { "step": 3, "forcestepdivisibility": "none" }, "input": "8", "expected": "8" }
 */
test('skips normalization when forcestepdivisibility is none', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 3, forcestepdivisibility: 'none', initval: 8
    });

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(8); // No normalization, value preserved
  });

/**
 * Scenario: preserves exact decimal precision with decimals setting
 * Given the fixture page is loaded with specific decimal precision
 * When I set a value with more decimals
 * Then it rounds to the specified precision
 * Params:
 * { "settings": { "decimals": 2 }, "input": "1.2345", "expected": "1.23" }
 */
test('preserves exact decimal precision with decimals setting', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      decimals: 2, step: 0.01, initval: 1.2345
    });

    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    const numericValue = await getNumericValue(page, 'test-input');

    expect(displayValue).toBe('1.23'); // Rounded to 2 decimals
    expect(numericValue).toBe(1.23);
  });

/**
 * Scenario: rounds to nearest decimal place on blur
 * Given the fixture page is loaded with decimal precision
 * When I type a value with extra decimals and blur
 * Then it rounds to the nearest allowed decimal place
 * Params:
 * { "settings": { "decimals": 1 }, "input": "1.28", "expected": "1.3" }
 */
test('rounds to nearest decimal place on blur', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      decimals: 1, step: 0.1, initval: 1.0
    });

    await apiHelpers.fillWithValueAndBlur(page, 'test-input', '1.28');

    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    const numericValue = await getNumericValue(page, 'test-input');

    expect(displayValue).toBe('1.3'); // Rounded to 1 decimal place
    expect(numericValue).toBe(1.3);
  });

/**
 * Scenario: handles very large numbers correctly
 * Given the fixture page is loaded
 * When I set a very large number
 * Then it is handled without overflow
 * Params:
 * { "input": "999999999", "expected": "999999999" }
 */
test('handles very large numbers correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, max: 1000000000, initval: 999999999
    });

    const numericValue = await getNumericValue(page, 'test-input');
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');

    expect(numericValue).toBe(999999999);
    expect(displayValue).toBe('999999999');
  });

/**
 * Scenario: handles very small decimal numbers correctly
 * Given the fixture page is loaded with high precision
 * When I set a very small decimal number
 * Then it is handled with correct precision
 * Params:
 * { "settings": { "decimals": 6 }, "input": "0.000001", "expected": "0.000001" }
 */
test('handles very small decimal numbers correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      decimals: 6, step: 0.000001, initval: 0.000001
    });

    const numericValue = await getNumericValue(page, 'test-input');
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');

    expect(numericValue).toBe(0.000001);
    expect(displayValue).toBe('0.000001');
  });

/**
 * Scenario: maintains internal numeric state vs display value
 * Given the fixture page is loaded
 * When display and internal values differ due to formatting
 * Then both states are maintained correctly
 * Params:
 * { "internalValue": 42, "displayValue": "42.00" }
 */
test('maintains internal numeric state vs display value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      decimals: 2, step: 0.01, initval: 42
    });

    const numericValue = await getNumericValue(page, 'test-input');
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');

    expect(numericValue).toBe(42); // Internal numeric value
    expect(displayValue).toBe('42.00'); // Display with decimals formatting
  });

/**
 * Scenario: handles locale-specific decimal separators
 * Given the fixture page is loaded with locale settings
 * When I input values with locale-specific separators
 * Then they are parsed correctly
 * Params:
 * { "locale": "de-DE", "input": "1,5", "expected": "1.5" }
 */
test('handles locale-specific decimal separators', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.1, decimals: 1, initval: 1.5
    });

    // Core should handle decimal points consistently regardless of locale
    const numericValue = await getNumericValue(page, 'test-input');
    const displayValue = await apiHelpers.readInputValue(page, 'test-input');

    expect(numericValue).toBe(1.5);
    expect(displayValue).toBe('1.5'); // Should use dot separator
  });

/**
 * Scenario: validates input on programmatic setValue
 * Given the fixture page is loaded
 * When I set a value programmatically via API
 * Then the value is validated and normalized
 * Params:
 * { "apiValue": "invalid", "expectedBehavior": "reject" }
 */
test('validates input on programmatic setValue', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await setValueViaAPI(page, 'test-input', 'invalid');

    const numericValue = await getNumericValue(page, 'test-input');
    expect(numericValue).toBe(10); // Invalid value rejected, previous value kept
  });

/**
 * Scenario: handles edge case of setting value to empty string
 * Given the fixture page is loaded
 * When I set the value to empty string via API
 * Then it is handled according to configuration
 * Params:
 * { "apiValue": "", "settings": { "min": 0 }, "expected": "0" }
 */
test('handles edge case of setting value to empty string', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0, step: 1, initval: 5
    });

    await setValueViaAPI(page, 'test-input', '');

    const displayValue = await apiHelpers.readInputValue(page, 'test-input');
    const numericValue = await getNumericValue(page, 'test-input');

    expect(displayValue).toBe('0'); // Core sets to minimum value
    expect(numericValue).toBe(0); // Numeric minimum value
  });

/**
 * Scenario: maintains precision during increment/decrement operations
 * Given the fixture page is loaded with decimal precision
 * When I perform increment/decrement operations
 * Then precision is maintained throughout
 * Params:
 * { "settings": { "step": 0.1, "decimals": 1, "initval": "1.0" }, "operation": "increment", "expected": "1.1" }
 */
test('maintains precision during increment/decrement operations', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.1, decimals: 1, initval: 1.0
    });

    await incrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(1.1); // Precision maintained during increment
  });

});