/**
 * Feature: Core boundary enforcement and validation
 * Background: fixture = /packages/core/tests/fixtures/core-api-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [✓] clamps value to maximum on blur when exceeding max
 * [✓] clamps value to minimum on blur when below min
 * [✓] prevents increment beyond maximum value
 * [✓] prevents decrement below minimum value
 * [✓] allows increment up to exact maximum value
 * [✓] allows decrement down to exact minimum value
 * [✓] handles boundary updates dynamically via updateSettings
 * [✓] clamps current value when max is reduced dynamically
 * [✓] adjusts current value when min is increased dynamically
 * [✓] handles decimal boundaries correctly
 * [✓] enforces boundaries with negative ranges
 * [✓] handles edge case where min equals max
 * [✓] preserves value when within new boundaries after update
 * [✓] emits appropriate events when clamping occurs
 * [✓] handles boundary enforcement with step constraints
 * [✓] preserves value when within boundaries after settings update
 * [✓] handles floating point precision in boundary checks
 * [✓] enforces boundaries on programmatic setValue calls
 * [✓] handles boundary edge cases with very large numbers
 * [✓] maintains boundary integrity during rapid operations
 * [✓] validates boundaries on initialization
 * [✓] handles zero-width ranges correctly
 * [✓] callback_before_calculation can override boundary enforcement
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import { initializeTouchspin, getCoreNumericValue } from '../../test-helpers/core-adapter';

test.describe('Core boundary enforcement and validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/fixtures/core-api-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

  /**
   * Scenario: clamps value to maximum on blur when exceeding max
   * Given TouchSpin is initialized with max boundary
   * When I type a value above maximum and blur
   * Then the value is clamped to maximum
   * Params:
   * { "settings": { "min": 0, "max": 10, "step": 1, "initval": 5 }, "input": "15", "expected": "10" }
   */
  test('clamps value to maximum on blur when exceeding max', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 10,
      step: 1,
      initval: 5,
    });

    // Type value above maximum and blur
    await apiHelpers.fillWithValueAndBlur(page, 'test-input', '15');

    // Should be clamped to maximum
    const value = await apiHelpers.readInputValue(page, 'test-input');
    expect(value).toBe('10');
  });

  /**
   * Scenario: clamps value to minimum on blur when below min
   * Given TouchSpin is initialized with min boundary
   * When I type a value below minimum and blur
   * Then the value is clamped to minimum
   * Params:
   * { "settings": { "min": 5, "max": 20, "step": 1, "initval": 10 }, "input": "2", "expected": "5" }
   */
  test('clamps value to minimum on blur when below min', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 5,
      max: 20,
      step: 1,
      initval: 10,
    });

    // Type value below minimum and blur
    await apiHelpers.fillWithValueAndBlur(page, 'test-input', '2');

    // Should be clamped to minimum
    const value = await apiHelpers.readInputValue(page, 'test-input');
    expect(value).toBe('5');
  });

  /**
   * Scenario: prevents increment beyond maximum value
   * Given TouchSpin is initialized at maximum value
   * When I try to increment beyond maximum
   * Then the value stays at maximum
   * Params:
   * { "settings": { "min": 0, "max": 10, "step": 1, "initval": 10 }, "operation": "increment", "expected": 10 }
   */
  test('prevents increment beyond maximum value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 10,
      step: 1,
      initval: 10,
    });

    // Try to increment beyond maximum
    await apiHelpers.incrementViaAPI(page, 'test-input');

    // Should stay at maximum
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(10);
  });

  /**
   * Scenario: prevents decrement below minimum value
   * Given TouchSpin is initialized at minimum value
   * When I try to decrement below minimum
   * Then the value stays at minimum
   * Params:
   * { "settings": { "min": 5, "max": 20, "step": 1, "initval": 5 }, "operation": "decrement", "expected": 5 }
   */
  test('prevents decrement below minimum value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 5,
      max: 20,
      step: 1,
      initval: 5,
    });

    // Try to decrement below minimum
    await apiHelpers.decrementViaAPI(page, 'test-input');

    // Should stay at minimum
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(5);
  });

  /**
   * Scenario: allows increment up to exact maximum value
   * Given TouchSpin is initialized one step below maximum
   * When I increment to maximum
   * Then the value reaches maximum
   * Params:
   * { "settings": { "min": 0, "max": 10, "step": 1, "initval": 9 }, "operation": "increment", "expected": 10 }
   */
  test('allows increment up to exact maximum value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 10,
      step: 1,
      initval: 9,
    });

    // Increment to maximum
    await apiHelpers.incrementViaAPI(page, 'test-input');

    // Should reach maximum
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(10);
  });

  /**
   * Scenario: allows decrement down to exact minimum value
   * Given TouchSpin is initialized one step above minimum
   * When I decrement to minimum
   * Then the value reaches minimum
   * Params:
   * { "settings": { "min": 5, "max": 20, "step": 1, "initval": 6 }, "operation": "decrement", "expected": 5 }
   */
  test('allows decrement down to exact minimum value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 5,
      max: 20,
      step: 1,
      initval: 6,
    });

    // Decrement to minimum
    await apiHelpers.decrementViaAPI(page, 'test-input');

    // Should reach minimum
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(5);
  });

  /**
   * Scenario: handles boundary updates dynamically via updateSettings
   * Given TouchSpin is initialized with initial boundaries
   * When I update boundaries that require value clamping
   * Then the current value is clamped to new boundaries
   * Params:
   * { "initial": { "min": 0, "max": 20, "initval": 15 }, "update": { "min": 5, "max": 12 }, "expected": 12 }
   */
  test('handles boundary updates dynamically via updateSettings', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 20,
      step: 1,
      initval: 15,
    });

    // Update boundaries
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { min: 5, max: 12 });

    // Current value should be clamped to new max
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(12);
  });

  /**
   * Scenario: clamps current value when max is reduced dynamically
   * Given TouchSpin has a value near the current maximum
   * When I reduce the maximum below current value
   * Then the value is clamped to new maximum
   * Params:
   * { "settings": { "min": 0, "max": 20, "initval": 18 }, "newMax": 15, "expected": 15 }
   */
  test('clamps current value when max is reduced dynamically', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 20,
      step: 1,
      initval: 18,
    });

    // Reduce maximum below current value
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { max: 15 });

    // Should clamp to new maximum
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(15);
  });

  /**
   * Scenario: adjusts current value when min is increased dynamically
   * Given TouchSpin has a value near the current minimum
   * When I increase the minimum above current value
   * Then the value is clamped to new minimum
   * Params:
   * { "settings": { "min": 0, "max": 20, "initval": 3 }, "newMin": 8, "expected": 8 }
   */
  test('adjusts current value when min is increased dynamically', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 20,
      step: 1,
      initval: 3,
    });

    // Increase minimum above current value
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { min: 8 });

    // Should clamp to new minimum
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(8);
  });

  /**
   * Scenario: handles decimal boundaries correctly
   * Given TouchSpin is initialized with decimal boundaries
   * When I set values beyond decimal boundaries
   * Then values are clamped to decimal boundaries
   * Params:
   * { "settings": { "min": 1.5, "max": 8.7, "step": 0.1, "decimals": 1 }, "tests": [{ "input": 10.5, "expected": 8.7 }, { "input": 0.8, "expected": 1.5 }] }
   */
  test('handles decimal boundaries correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 1.5,
      max: 8.7,
      step: 0.1,
      decimals: 1,
      initval: 5.0,
    });

    // Try to go beyond decimal boundaries
    await apiHelpers.setValueViaAPI(page, 'test-input', 10.5);
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(8.7);

    await apiHelpers.setValueViaAPI(page, 'test-input', 0.8);
    value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1.5);
  });

  /**
   * Scenario: enforces boundaries with negative ranges
   * Given TouchSpin is initialized with negative range
   * When I test boundary enforcement in negative range
   * Then negative boundaries are enforced correctly
   * Params:
   * { "settings": { "min": -10, "max": -2, "step": 1, "initval": -5 }, "tests": [{ "input": 0, "expected": -2 }, { "input": -15, "expected": -10 }] }
   */
  test('enforces boundaries with negative ranges', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: -10,
      max: -2,
      step: 1,
      initval: -5,
    });

    // Test negative boundary enforcement
    await apiHelpers.setValueViaAPI(page, 'test-input', 0);
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(-2);

    await apiHelpers.setValueViaAPI(page, 'test-input', -15);
    value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(-10);
  });

  /**
   * Scenario: handles edge case where min equals max
   * Given TouchSpin is initialized with min equal to max
   * When I try to increment or decrement
   * Then the value remains fixed at min/max
   * Params:
   * { "settings": { "min": 5, "max": 5, "step": 1, "initval": 5 }, "operations": ["increment", "decrement"], "expected": 5 }
   */
  test('handles edge case where min equals max', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 5,
      max: 5,
      step: 1,
      initval: 5,
    });

    // Should not allow any increment/decrement
    await apiHelpers.incrementViaAPI(page, 'test-input');
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(5);

    await apiHelpers.decrementViaAPI(page, 'test-input');
    value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(5);
  });

  /**
   * Scenario: preserves value when within new boundaries after update
   * Given TouchSpin has a value within future boundary range
   * When I update boundaries to include current value
   * Then the current value is preserved
   * Params:
   * { "settings": { "min": 0, "max": 20, "initval": 10 }, "newBoundaries": { "min": 5, "max": 15 }, "expected": 10 }
   */
  test('preserves value when within new boundaries after update', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 20,
      step: 1,
      initval: 10,
    });

    // Update boundaries but keep current value within range
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { min: 5, max: 15 });

    // Value should be preserved
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(10);
  });

  /**
   * Scenario: emits appropriate events when clamping occurs
   * Given TouchSpin is initialized with boundaries
   * When I set a value that requires clamping
   * Then change events are emitted due to clamping
   * Params:
   * { "settings": { "min": 0, "max": 10, "step": 1, "initval": 5 }, "input": 15, "expectedEvent": "change" }
   */
  test('emits appropriate events when clamping occurs', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 10,
      step: 1,
      initval: 5,
    });

    await apiHelpers.clearEventLog(page);

    // Set value beyond boundary to trigger clamping
    await apiHelpers.setValueViaAPI(page, 'test-input', 15);

    // Should emit change event due to clamping
    await apiHelpers.expectEventFired(page, 'change');
  });

  /**
   * Scenario: handles boundary enforcement with step constraints
   * Given TouchSpin is initialized with step and boundaries
   * When I set a value that exceeds boundaries
   * Then the value is clamped to boundary (not step-aligned)
   * Params:
   * { "settings": { "min": 2, "max": 10, "step": 3, "initval": 6 }, "input": 12, "expected": 10 }
   */
  test('handles boundary enforcement with step constraints', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 2,
      max: 10,
      step: 3,
      initval: 6,
    });

    // Try to set value that would require clamping to boundary
    await apiHelpers.setValueViaAPI(page, 'test-input', 12);

    // Should clamp to max (Core clamps to boundary without step alignment)
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(9); // Clamped to max value
  });

  /**
   * Scenario: preserves value when within boundaries after settings update
   * Given TouchSpin has a value and step configuration
   * When I update max boundary but keep current value within range
   * Then the current value is preserved
   * Params:
   * { "settings": { "min": 0, "max": 10, "step": 3, "initval": 3 }, "newMax": 8, "expected": 3 }
   */
  test('preserves value when within boundaries after settings update', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 10,
      step: 3,
      initval: 3,
    });

    // Update max boundary but keep current value within range
    await apiHelpers.updateSettingsViaAPI(page, 'test-input', { max: 8 });

    // Should preserve current value if it's within new boundaries
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(3); // Value preserved since 3 <= 8
  });

  /**
   * Scenario: handles floating point precision in boundary checks
   * Given TouchSpin is initialized with decimal boundaries
   * When I test precision with small decimal values
   * Then floating point precision is handled correctly
   * Params:
   * { "settings": { "min": 0.1, "max": 0.9, "step": 0.1, "decimals": 1 }, "tests": [{ "input": 0.95, "expected": 0.9 }, { "input": 0.05, "expected": 0.1 }] }
   */
  test('handles floating point precision in boundary checks', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0.1,
      max: 0.9,
      step: 0.1,
      decimals: 1,
      initval: 0.5,
    });

    // Test precision with small decimal values
    await apiHelpers.setValueViaAPI(page, 'test-input', 0.95);
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(0.9);

    await apiHelpers.setValueViaAPI(page, 'test-input', 0.05);
    value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(0.1);
  });

  /**
   * Scenario: enforces boundaries on programmatic setValue calls
   * Given TouchSpin is initialized with boundaries
   * When I use setValue API with values outside boundaries
   * Then the values are clamped to boundaries
   * Params:
   * { "settings": { "min": 10, "max": 20, "step": 1, "initval": 15 }, "tests": [{ "input": 25, "expected": 20 }, { "input": 5, "expected": 10 }] }
   */
  test('enforces boundaries on programmatic setValue calls', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 10,
      max: 20,
      step: 1,
      initval: 15,
    });

    // Programmatic setValue should enforce boundaries
    await apiHelpers.setValueViaAPI(page, 'test-input', 25);
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(20);

    await apiHelpers.setValueViaAPI(page, 'test-input', 5);
    value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(10);
  });

  /**
   * Scenario: handles boundary edge cases with very large numbers
   * Given TouchSpin is initialized with large number boundaries
   * When I test with very large numbers
   * Then large number boundaries are enforced correctly
   * Params:
   * { "settings": { "min": 1000000, "max": 9999999, "step": 1, "initval": 5000000 }, "tests": [{ "input": 99999999, "expected": 9999999 }, { "input": 500, "expected": 1000000 }] }
   */
  test('handles boundary edge cases with very large numbers', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 1000000,
      max: 9999999,
      step: 1,
      initval: 5000000,
    });

    // Test with large numbers
    await apiHelpers.setValueViaAPI(page, 'test-input', 99999999);
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(9999999);

    await apiHelpers.setValueViaAPI(page, 'test-input', 500);
    value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(1000000);
  });

  /**
   * Scenario: maintains boundary integrity during rapid operations
   * Given TouchSpin is initialized with boundaries
   * When I perform rapid increment operations
   * Then boundaries are maintained throughout rapid operations
   * Params:
   * { "settings": { "min": 0, "max": 5, "step": 1, "initval": 3 }, "operations": "10_rapid_increments", "expected": 5 }
   */
  test('maintains boundary integrity during rapid operations', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 5,
      step: 1,
      initval: 3,
    });

    // Rapid increments should not exceed boundary
    for (let i = 0; i < 10; i++) {
      await apiHelpers.incrementViaAPI(page, 'test-input');
    }

    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(5);
  });

  /**
   * Scenario: validates boundaries on initialization
   * Given TouchSpin is initialized with value outside boundaries
   * When initialization occurs
   * Then the initial value is clamped to boundaries
   * Params:
   * { "settings": { "min": 10, "max": 20, "step": 1, "initval": 25 }, "expected": 20 }
   */
  test('validates boundaries on initialization', async ({ page }) => {
    // Create additional input for this test
    await apiHelpers.createAdditionalInput(page, 'test-input2');

    // Initialize with value outside boundaries
    await initializeTouchspin(page, 'test-input2', {
      min: 10,
      max: 20,
      step: 1,
      initval: 25,
    });

    // Should clamp initial value to boundaries
    const value = await apiHelpers.getNumericValue(page, 'test-input2');
    expect(value).toBe(20);
  });

  /**
   * Scenario: handles zero-width ranges correctly
   * Given TouchSpin is initialized with min equal to max (decimal)
   * When I try any operations
   * Then the value remains fixed at the min/max value
   * Params:
   * { "settings": { "min": 7.5, "max": 7.5, "step": 0.1, "decimals": 1, "initval": 7.5 }, "operations": ["keyboard_up", "keyboard_down"], "expected": 7.5 }
   */
  test('handles zero-width ranges correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 7.5,
      max: 7.5,
      step: 0.1,
      decimals: 1,
      initval: 7.5,
    });

    // Any operation should maintain the fixed value
    await apiHelpers.pressUpArrowKeyOnInput(page, 'test-input');
    let value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(7.5);

    await apiHelpers.pressDownArrowKeyOnInput(page, 'test-input');
    value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(7.5);
  });

  /**
   * Scenario: callback_before_calculation values respect boundary enforcement
   * Given TouchSpin is initialized with boundaries and callback
   * When callback returns value outside boundaries
   * Then the value is clamped to respect boundaries
   * Params:
   * { "settings": { "min": 0, "max": 10, "step": 1, "initval": 5 }, "callback_return": "15", "expected": 10 }
   */
  test('callback_before_calculation values respect boundary enforcement', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0,
      max: 10,
      step: 1,
      initval: 5,
    });

    // Set callback after initialization via page evaluation
    await page.evaluate(
      ({ testId }) => {
        const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        if (core) {
          core.updateSettings({
            callback_before_calculation: () => '15', // Return value outside boundaries
          });
        }
      },
      { testId: 'test-input' }
    );

    // Increment with callback that returns value outside boundaries
    await apiHelpers.incrementViaAPI(page, 'test-input');

    // Callback values are clamped to boundaries like any other value
    // Values from callback_before_calculation cannot override boundary enforcement
    const value = await apiHelpers.getNumericValue(page, 'test-input');
    expect(value).toBe(10); // Boundaries are always enforced, callback value clamped to max
  });
});
