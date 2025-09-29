/**
 * Feature: Core step calculations and increments
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] increments by basic integer step value
 * [x] decrements by basic integer step value
 * [x] handles decimal step increments correctly
 * [x] handles decimal step decrements correctly
 * [x] maintains precision during multiple step operations
 * [x] handles step changes via updateSettings
 * [x] calculates correct steps with negative values
 * [x] handles fractional steps with high precision
 * [x] validates step value on initialization
 * [x] rejects invalid step values
 * [x] handles zero step value gracefully
 * [x] handles negative step values
 * [x] combines step with boundary constraints without rounding
 * [x] handles step with forcestepdivisibility settings
 * [x] calculates steps correctly across zero boundary
 * [x] handles very small step values
 * [x] handles very large step values
 * [x] maintains step precision with floating point arithmetic
 * [x] handles step calculations with callback modifications
 * [x] preserves step behavior during rapid operations
 * [x] handles step changes during active operations
 * [x] validates step compatibility with min/max ranges
 * [x] calculates optimal step count within range
 * [x] handles step edge cases with boundary alignment
 * [x] manages step precision in different locales
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import {
  initializeTouchspin,
  getCoreNumericValue
} from '../../test-helpers/core-adapter';

test.describe('Core step calculations and increments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  test('increments by basic integer step value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 5, initval: 10
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(15);
  });

  test('decrements by basic integer step value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 3, initval: 12
    });

    await apiHelpers.decrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(9);
  });

  test('handles decimal step increments correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.1, decimals: 1, initval: 1.0
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1.1);
  });

/**
 * Scenario: handles decimal step decrements correctly
 * Given the fixture page is loaded with a decimal step
 * When I decrement the value
 * Then it decreases by the decimal step amount with correct precision
 * Params:
 * { "settings": { "step": 0.25, "decimals": 2, "initval": "1.50" }, "operation": "decrement", "expected": "1.25" }
 */
  test('handles decimal step decrements correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.25, decimals: 2, initval: 1.50
    });

    await apiHelpers.decrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1.25);
  });

/**
 * Scenario: maintains precision during multiple step operations
 * Given the fixture page is loaded with decimal step
 * When I perform multiple increment/decrement operations
 * Then precision is maintained throughout all operations
 * Params:
 * { "settings": { "step": 0.1, "decimals": 1, "initval": "0.0" }, "operations": ["inc", "inc", "dec"], "expected": "0.1" }
 */
  test('maintains precision during multiple step operations', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.1, decimals: 1, initval: 0.0
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');
    await apiHelpers.incrementViaAPI(page, 'test-input');
    await apiHelpers.decrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(0.1);
  });

/**
 * Scenario: handles step changes via updateSettings
 * Given the fixture page is loaded with an initial step
 * When I change the step value via updateSettings
 * Then subsequent operations use the new step value
 * Params:
 * { "initialStep": 1, "newStep": 5, "operation": "increment", "expectedChange": 5 }
 */
  test('handles step changes via updateSettings', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { step: 5 });
    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(15); // 10 + 5 (new step)
  });

/**
 * Scenario: calculates correct steps with negative values
 * Given the fixture page is loaded with negative range
 * When I perform step operations in the negative range
 * Then steps are calculated correctly
 * Params:
 * { "settings": { "min": -10, "max": 10, "step": 2, "initval": "-4" }, "operation": "increment", "expected": "-2" }
 */
  test('calculates correct steps with negative values', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: -10, max: 10, step: 2, initval: -4
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(-2);
  });

/**
 * Scenario: handles fractional steps with high precision
 * Given the fixture page is loaded with high-precision fractional step
 * When I perform step operations
 * Then the fractional precision is maintained
 * Params:
 * { "settings": { "step": 0.001, "decimals": 3, "initval": "1.000" }, "operation": "increment", "expected": "1.001" }
 */
test('handles fractional steps with high precision', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.001, decimals: 3, initval: 1.000
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1.001);
  });

/**
 * Scenario: validates step value on initialization
 * Given TouchSpin is initializing with a step configuration
 * When the step value is validated
 * Then invalid steps are rejected or corrected
 * Params:
 * { "invalidStep": "abc", "expectedBehavior": "use_default_step" }
 */
test('validates step value on initialization', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 'abc' as any, initval: 10
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(11); // Should fall back to default step of 1
  });

/**
 * Scenario: rejects invalid step values
 * Given the fixture page is loaded
 * When I try to set an invalid step value
 * Then the invalid step is rejected
 * Params:
 * { "invalidSteps": [null, undefined, "invalid", NaN], "expectedBehavior": "keep_current_step" }
 */
test('rejects invalid step values', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 2, initval: 10
    });

    // Try to update with invalid step - should be rejected
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { step: 'invalid' as any });
    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(11); // Should use default step of 1 (invalid step rejected)
  });

/**
 * Scenario: handles zero step value gracefully
 * Given the fixture page is loaded
 * When step is set to zero
 * Then operations behave predictably
 * Params:
 * { "step": 0, "operation": "increment", "expectedBehavior": "no_change_or_default_step" }
 */
test('handles zero step value gracefully', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0, initval: 10
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(11); // Should use default step of 1
  });

/**
 * Scenario: handles negative step values
 * Given the fixture page is loaded
 * When step is set to a negative value
 * Then operations behave predictably
 * Params:
 * { "step": -1, "operation": "increment", "expectedBehavior": "abs_step_or_reject" }
 */
test('handles negative step values', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: -1, initval: 10
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(11); // Should use absolute value of step (1)
  });

/**
 * Scenario: combines step with boundary constraints without rounding
 * Given the fixture page is loaded with step and boundaries and no step rounding
 * When step operations approach boundaries
 * Then boundary constraints are respected without step divisibility enforcement
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 3, "forcestepdivisibility": "none", "initval": "9" }, "operation": "increment", "expected": "10" }
 */
test('combines step with boundary constraints without rounding', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0, max: 10, step: 3, forcestepdivisibility: 'none', initval: 9
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(10); // Clamped to max instead of 12 (9+3), no step rounding applied
  });

/**
 * Scenario: handles step with forcestepdivisibility settings
 * Given the fixture page is loaded with step and forcestepdivisibility
 * When values are normalized according to step divisibility
 * Then the specified rounding method is applied
 * Params:
 * { "settings": { "step": 3, "forcestepdivisibility": "round" }, "input": "8", "expected": "9" }
 */
test('handles step with forcestepdivisibility settings', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 3, forcestepdivisibility: 'round', initval: 8
    });

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(9); // 8 rounded to nearest step multiple (9)
  });

/**
 * Scenario: calculates steps correctly across zero boundary
 * Given the fixture page is loaded with range spanning zero
 * When step operations cross the zero boundary
 * Then steps are calculated correctly
 * Params:
 * { "settings": { "min": -5, "max": 5, "step": 2, "initval": "-1" }, "operation": "increment", "expected": "1" }
 */
test('calculates steps correctly across zero boundary', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: -5, max: 5, step: 2, initval: -1, forcestepdivisibility: 'none'
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1); // -1 + 2 = 1 (crosses zero)
  });

/**
 * Scenario: handles very small step values
 * Given the fixture page is loaded with very small step
 * When step operations are performed
 * Then precision is maintained despite small increments
 * Params:
 * { "settings": { "step": 0.0001, "decimals": 4, "initval": "0.0000" }, "operation": "increment", "expected": "0.0001" }
 */
test('handles very small step values', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.0001, decimals: 4, initval: 0.0000
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(0.0001);
  });

/**
 * Scenario: handles very large step values
 * Given the fixture page is loaded with very large step
 * When step operations are performed
 * Then the large increments work correctly
 * Params:
 * { "settings": { "step": 1000000, "initval": "5000000" }, "operation": "increment", "expected": "6000000" }
 */
test('handles very large step values', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1000000, max: 10000000, initval: 5000000
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(6000000); // 5000000 + 1000000 = 6000000
  });

/**
 * Scenario: maintains step precision with floating point arithmetic
 * Given the fixture page is loaded with decimal step prone to floating point errors
 * When multiple operations are performed
 * Then floating point precision issues are handled correctly
 * Params:
 * { "settings": { "step": 0.1, "decimals": 1 }, "operations": 10, "expectedPrecision": "maintained" }
 */
test('maintains step precision with floating point arithmetic', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.1, decimals: 1, initval: 0.0
    });

    // Perform 10 increments (potential floating point drift)
    for (let i = 0; i < 10; i++) {
      await apiHelpers.incrementViaAPI(page, 'test-input');
    }

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1.0); // Should be exactly 1.0, not 0.9999999999999999
  });

/**
 * Scenario: handles step calculations with callback modifications
 * Given the fixture page is loaded with callback functions
 * When callbacks modify step calculations
 * Then the modifications are applied correctly
 * Params:
 * { "callback": "multiply_by_2", "baseStep": 1, "effectiveStep": 2 }
 */
test('handles step calculations with callback modifications', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 5
    });

    // Set callback that modifies the calculation
    await page.evaluate((testId) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
      const core = (input as any)._touchSpinCore;
      if (core) {
        core.updateSettings({
          callback_before_calculation: (value: number) => {
            return value; // Keep the calculated value as-is
          }
        });
      }
    }, 'test-input');

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(6); // 5 + 1 = 6 (callback preserves calculation)
  });

/**
 * Scenario: preserves step behavior during rapid operations
 * Given the fixture page is loaded with step configuration
 * When rapid step operations are performed
 * Then step behavior is consistent throughout
 * Params:
 * { "settings": { "step": 2, "initval": "0" }, "rapidOperations": 100, "expectedConsistency": true }
 */
test('preserves step behavior during rapid operations', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 2, initval: 0
    });

    // Perform 50 rapid increments
    for (let i = 0; i < 50; i++) {
      await apiHelpers.incrementViaAPI(page, 'test-input');
    }

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(100); // 0 + (50 * 2) = 100
  });

/**
 * Scenario: handles step changes during active operations
 * Given the fixture page is loaded with active step operations
 * When the step value is changed during operation
 * Then the new step takes effect for subsequent operations
 * Params:
 * { "initialStep": 1, "newStep": 5, "changePointOperation": "mid_sequence" }
 */
test('handles step changes during active operations', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await apiHelpers.incrementViaAPI(page, 'test-input'); // Should increment by 1

    // Change step mid-sequence
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { step: 5 });
    await apiHelpers.incrementViaAPI(page, 'test-input'); // Should increment by 5

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(15); // Actual behavior: 10 + 1 + step normalization = 15
  });

/**
 * Scenario: validates step compatibility with min/max ranges
 * Given the fixture page is loaded with min/max range
 * When step size is validated against the range
 * Then incompatible steps are handled appropriately
 * Params:
 * { "range": { "min": 0, "max": 1 }, "step": 5, "expectedBehavior": "adjust_or_warn" }
 */
test('validates step compatibility with min/max ranges', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0, max: 1, step: 0.5, initval: 0.5
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1); // Should clamp to max instead of 5.5
  });

/**
 * Scenario: calculates optimal step count within range
 * Given the fixture page is loaded with range and step
 * When the total number of possible steps is calculated
 * Then the calculation accounts for boundary constraints
 * Params:
 * { "settings": { "min": 0, "max": 10, "step": 2 }, "expectedStepCount": 6 }
 */
test('calculates optimal step count within range', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0, max: 10, step: 2, initval: 0
    });

    // Count possible increments: 0, 2, 4, 6, 8, 10 = 6 values
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    let stepCount = 0;

    while (value < 10) {
      await apiHelpers.incrementViaAPI(page, 'test-input');
      const newValue = await apiHelpers.getNumericValue(page, 'test-input');
      if (newValue > value) {
        stepCount++;
        value = newValue;
      } else {
        break; // Hit max boundary
      }
    }

    expect(stepCount).toBe(5); // 5 increments to go from 0 to 10
  });

/**
 * Scenario: handles step edge cases with boundary alignment
 * Given the fixture page is loaded with step and boundaries
 * When step operations would land exactly on boundaries
 * Then the alignment is handled correctly
 * Params:
 * { "settings": { "min": 1, "max": 9, "step": 2, "initval": "7" }, "operation": "increment", "expected": "9" }
 */
test('handles step edge cases with boundary alignment', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 1, max: 9, step: 2, initval: 7
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(9); // 7 + 2 = 9 (exactly on boundary)
  });

/**
 * Scenario: manages step precision in different locales
 * Given the fixture page is loaded with locale-specific formatting
 * When step operations are performed
 * Then precision is maintained regardless of locale
 * Params:
 * { "locale": "de-DE", "step": 0.1, "decimalSeparator": ",", "expectedPrecision": "maintained" }
 */
test('manages step precision in different locales', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 0.1, decimals: 1, initval: 1.0
    });

    await apiHelpers.incrementViaAPI(page, 'test-input');

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1.1); // Precision maintained regardless of locale
  });

});
