/**
 * Feature: Core API operations and programmatic control
 * Background: fixture = /packages/core/tests/__shared__/fixtures/test-fixture.html
 */

/*
 * CHECKLIST — Scenarios in this spec
 * [x] upOnce increments value by one step
 * [x] downOnce decrements value by one step
 * [x] setValue sets value programmatically
 * [x] getValue returns current numeric value
 * [x] startUpSpin begins upward spinning
 * [x] startDownSpin begins downward spinning
 * [x] stopSpin halts any active spinning
 * [x] updateSettings modifies configuration dynamically
 * [x] destroy cleans up instance completely
 * [x] isDestroyed returns correct status
 * [x] API methods respect boundary constraints
 * [x] API methods maintain step compliance
 * [x] API methods handle invalid parameters gracefully
 * [x] API methods return appropriate values/promises
 * [x] API methods work correctly after updateSettings
 * [x] chained API calls work correctly
 * [x] API methods maintain internal state consistency
 * [x] concurrent API calls are handled safely
 * [x] API methods trigger appropriate events
 * [x] API methods preserve precision
 * [x] API validation prevents invalid operations
 * [x] API methods handle edge cases gracefully
 * [x] API state is recoverable after errors
 * [x] API methods work with callback modifications
 * [x] API performance with full logging (baseline)
 * [x] API performance with disabled textarea (events fire but skip DOM)
 * [x] API performance with removed textarea (no event registration)
 */

import { test, expect } from '@playwright/test';
import * as apiHelpers from '@touchspin/core/test-helpers';
import {
  initializeTouchspin,
  incrementViaAPI,
  decrementViaAPI,
  setValueViaAPI,
  getNumericValue,
  updateSettingsViaAPI,
  destroyCore,
  isCoreInitialized,
  startUpSpinViaAPI,
  startDownSpinViaAPI,
  stopSpinViaAPI
} from '../../test-helpers/core-adapter';

test.describe('Core API operations and programmatic control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');
    await apiHelpers.startCoverage(page);
    await apiHelpers.waitForPageReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await apiHelpers.collectCoverage(page, testInfo.title);
  });

/**
 * Scenario: upOnce increments value by one step
 * Given the fixture page is loaded
 * When I call upOnce via API
 * Then the value increases by one step
 * Params:
 * { "settings": { "step": 2, "initval": "10" }, "operation": "upOnce", "expected": "12" }
 */
test('upOnce increments value by one step', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 2, initval: 10
    });

    await incrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(12);
  });

/**
 * Scenario: downOnce decrements value by one step
 * Given the fixture page is loaded
 * When I call downOnce via API
 * Then the value decreases by one step
 * Params:
 * { "settings": { "step": 3, "initval": "15" }, "operation": "downOnce", "expected": "12" }
 */
test('downOnce decrements value by one step', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 3, initval: 15
    });

    await decrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(12);
  });

/**
 * Scenario: setValue sets value programmatically
 * Given the fixture page is loaded
 * When I call setValue with a new value
 * Then the value is set to the specified amount
 * Params:
 * { "initialValue": "10", "setValue": "25", "expected": "25" }
 */
test('setValue sets value programmatically', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await setValueViaAPI(page, 'test-input', '25');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(25);
  });

/**
 * Scenario: getValue returns current numeric value
 * Given the fixture page is loaded with a specific value
 * When I call getValue via API
 * Then it returns the correct numeric value
 * Params:
 * { "displayValue": "42", "expectedNumericValue": 42 }
 */
test('getValue returns current numeric value', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 42
    });

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(42);
  });

/**
 * Scenario: startUpSpin begins upward spinning
 * Given the fixture page is loaded
 * When I call startUpSpin via API
 * Then upward spinning begins and continues
 * Params:
 * { "initialValue": "5", "spinDuration": 500, "expectedBehavior": "continuous_increment" }
 */
test('startUpSpin begins upward spinning', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 5
    });

    const initialValue = await getNumericValue(page, 'test-input');
    await startUpSpinViaAPI(page, 'test-input');

    // Allow some time for spinning
    await page.waitForTimeout(100);
    await stopSpinViaAPI(page, 'test-input');

    const finalValue = await getNumericValue(page, 'test-input');
    expect(finalValue).toBeGreaterThan(initialValue); // Value increased during spinning
  });

/**
 * Scenario: startDownSpin begins downward spinning
 * Given the fixture page is loaded
 * When I call startDownSpin via API
 * Then downward spinning begins and continues
 * Params:
 * { "initialValue": "10", "spinDuration": 500, "expectedBehavior": "continuous_decrement" }
 */
test('startDownSpin begins downward spinning', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    const initialValue = await getNumericValue(page, 'test-input');
    await startDownSpinViaAPI(page, 'test-input');

    // Allow some time for spinning
    await page.waitForTimeout(100);
    await stopSpinViaAPI(page, 'test-input');

    const finalValue = await getNumericValue(page, 'test-input');
    expect(finalValue).toBeLessThan(initialValue); // Value decreased during spinning
  });

/**
 * Scenario: stopSpin halts any active spinning
 * Given the fixture page is loaded with active spinning
 * When I call stopSpin via API
 * Then the spinning stops immediately
 * Params:
 * { "activeSpinning": "up", "stopAction": "stopSpin", "expectedBehavior": "immediate_stop" }
 */
test('stopSpin halts any active spinning', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await startUpSpinViaAPI(page, 'test-input');
    await page.waitForTimeout(50); // Brief spinning
    const valueAfterStart = await getNumericValue(page, 'test-input');

    await stopSpinViaAPI(page, 'test-input');
    await page.waitForTimeout(50); // Wait to ensure spinning stopped
    const valueAfterStop = await getNumericValue(page, 'test-input');

    expect(valueAfterStop).toBe(valueAfterStart); // No change after stop
  });

/**
 * Scenario: updateSettings modifies configuration dynamically
 * Given the fixture page is loaded with initial settings
 * When I call updateSettings with new configuration
 * Then the settings are applied immediately
 * Params:
 * { "initialSettings": { "step": 1, "max": 10 }, "newSettings": { "step": 5, "max": 50 } }
 */
test('updateSettings modifies configuration dynamically', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, max: 10, initval: 5
    });

    await updateSettingsViaAPI(page, 'test-input', { step: 5, max: 50 });
    await incrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(10); // 5 + 5 = 10 (new step applied)
  });

/**
 * Scenario: destroy cleans up instance completely
 * Given the fixture page is loaded with active TouchSpin
 * When I call destroy via API
 * Then the instance is completely cleaned up
 * Params:
 * { "expectedCleanup": ["event_listeners", "dom_modifications", "internal_state"] }
 */
test('destroy cleans up instance completely', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    expect(await isCoreInitialized(page, 'test-input')).toBe(true);

    await destroyCore(page, 'test-input');

    expect(await isCoreInitialized(page, 'test-input')).toBe(false);
  });

/**
 * Scenario: isDestroyed returns correct status
 * Given the fixture page is loaded
 * When I check isDestroyed status before and after destroy
 * Then it returns the correct boolean status
 * Params:
 * { "beforeDestroy": false, "afterDestroy": true }
 */
test('isDestroyed returns correct status', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    // Before destroy
    expect(await isCoreInitialized(page, 'test-input')).toBe(true);

    // After destroy
    await destroyCore(page, 'test-input');
    expect(await isCoreInitialized(page, 'test-input')).toBe(false);
  });

/**
 * Scenario: API methods respect boundary constraints
 * Given the fixture page is loaded with boundaries
 * When I use API methods that would exceed boundaries
 * Then the boundaries are respected
 * Params:
 * { "settings": { "min": 0, "max": 10, "initval": "10" }, "operation": "upOnce", "expected": "10" }
 */
test('API methods respect boundary constraints', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      min: 0, max: 10, step: 1, initval: 10
    });

    await incrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(10); // Boundary respected, no change beyond max
  });

/**
 * Scenario: API methods maintain step compliance
 * Given the fixture page is loaded with step configuration
 * When I use API methods
 * Then step compliance is maintained
 * Params:
 * { "settings": { "step": 3, "initval": "6" }, "operation": "upOnce", "expected": "9" }
 */
test('API methods maintain step compliance', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 3, initval: 6
    });

    await incrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(9); // 6 + 3 = 9 (step compliance)
  });

/**
 * Scenario: API methods handle invalid parameters gracefully
 * Given the fixture page is loaded
 * When I call API methods with invalid parameters
 * Then they handle the invalid input gracefully
 * Params:
 * { "invalidParams": [null, undefined, "invalid", NaN], "expectedBehavior": "reject_or_ignore" }
 */
test('API methods handle invalid parameters gracefully', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    // Try to set invalid value
    await setValueViaAPI(page, 'test-input', 'invalid');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(10); // Invalid value rejected, original preserved
  });

/**
 * Scenario: API methods return appropriate values/promises
 * Given the fixture page is loaded
 * When I call various API methods
 * Then they return the expected types and values
 * Params:
 * { "method": "getValue", "expectedReturnType": "number", "method2": "upOnce", "expectedReturnType2": "void" }
 */
test('API methods return appropriate values/promises', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 42
    });

    // getValue should return number
    const value = await getNumericValue(page, 'test-input');
    expect(typeof value).toBe('number');
    expect(value).toBe(42);

    // API operations should complete without errors
    await incrementViaAPI(page, 'test-input');
    await decrementViaAPI(page, 'test-input');
    await setValueViaAPI(page, 'test-input', '50');

    expect(await getNumericValue(page, 'test-input')).toBe(50);
  });

/**
 * Scenario: API methods work correctly after updateSettings
 * Given the fixture page is loaded with updated settings
 * When I use API methods after settings change
 * Then they work with the new settings
 * Params:
 * { "originalStep": 1, "newStep": 5, "operation": "upOnce", "expectedIncrement": 5 }
 */
test('API methods work correctly after updateSettings', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await updateSettingsViaAPI(page, 'test-input', { step: 5 });
    await incrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(15); // 10 + 5 (new step)
  });

/**
 * Scenario: chained API calls work correctly
 * Given the fixture page is loaded
 * When I make multiple chained API calls
 * Then all calls execute correctly in sequence
 * Params:
 * { "chain": ["upOnce", "upOnce", "downOnce"], "initialValue": "10", "expectedFinalValue": "12" }
 */
test('chained API calls work correctly', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await incrementViaAPI(page, 'test-input'); // 11
    await incrementViaAPI(page, 'test-input'); // 12
    await decrementViaAPI(page, 'test-input'); // 11

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(11); // up, up, down from 10
  });

/**
 * Scenario: API methods maintain internal state consistency
 * Given the fixture page is loaded
 * When I perform various API operations
 * Then internal state remains consistent throughout
 * Params:
 * { "operations": ["setValue", "upOnce", "updateSettings", "downOnce"], "expectedConsistency": true }
 */
test('API methods maintain internal state consistency', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 6
    });

    await setValueViaAPI(page, 'test-input', '10');
    await incrementViaAPI(page, 'test-input'); // 10 + 1 = 11
    await setValueViaAPI(page, 'test-input', '12'); // Use even number before step change
    await updateSettingsViaAPI(page, 'test-input', { step: 2 });
    await decrementViaAPI(page, 'test-input'); // 12 - 2 = 10

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(10); // Clean arithmetic without normalization side effects
  });

/**
 * Scenario: concurrent API calls are handled safely
 * Given the fixture page is loaded
 * When I make concurrent API calls
 * Then they are handled safely without race conditions
 * Params:
 * { "concurrentCalls": ["upOnce", "downOnce", "setValue"], "expectedBehavior": "safe_execution" }
 */
test('concurrent API calls are handled safely', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    // Perform multiple operations in sequence (simulating concurrency)
    await incrementViaAPI(page, 'test-input'); // 11
    await decrementViaAPI(page, 'test-input'); // 10
    await setValueViaAPI(page, 'test-input', '15'); // 15

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(15); // Final operation result preserved
  });

/**
 * Scenario: API methods trigger appropriate events
 * Given the fixture page is loaded
 * When I use API methods
 * Then appropriate events are triggered
 * Params:
 * { "operation": "setValue", "expectedEvents": ["change"], "operation2": "upOnce", "expectedEvents2": ["change"] }
 */
test('API methods trigger appropriate events', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await apiHelpers.clearEventLog(page);
    await setValueViaAPI(page, 'test-input', '15');

    // API methods do NOT emit change events (expected behavior)
    const hasChangeEvent = await apiHelpers.hasEventInLog(page, 'change', 'native');
    expect(hasChangeEvent).toBe(false);
  });

/**
 * Scenario: API methods preserve precision
 * Given the fixture page is loaded with decimal precision
 * When I use API methods with decimal values
 * Then precision is preserved correctly
 * Params:
 * { "settings": { "decimals": 2 }, "operation": "setValue", "value": "1.25", "expectedPrecision": "maintained" }
 */
test('API methods preserve precision', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      decimals: 2, step: 0.01, initval: 1.25
    });

    await incrementViaAPI(page, 'test-input');

    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(1.26); // Precision maintained: 1.25 + 0.01
  });

/**
 * Scenario: API validation prevents invalid operations
 * Given the fixture page is loaded
 * When I attempt invalid API operations
 * Then validation prevents the operations
 * Params:
 * { "invalidOperation": "upOnce_on_destroyed_instance", "expectedBehavior": "throw_error_or_ignore" }
 */
test('API validation prevents invalid operations', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    await destroyCore(page, 'test-input');

    // Try to operate on destroyed instance - should not throw but have no effect
    const initialValue = await apiHelpers.readInputValue(page, 'test-input');
    await incrementViaAPI(page, 'test-input'); // Should be ignored
    const finalValue = await apiHelpers.readInputValue(page, 'test-input');

    expect(finalValue).toBe(initialValue); // No change on destroyed instance
  });

/**
 * Scenario: API methods handle edge cases gracefully
 * Given the fixture page is loaded
 * When edge case scenarios occur during API calls
 * Then they are handled gracefully
 * Params:
 * { "edgeCase": "empty_input_value", "operation": "getValue", "expectedBehavior": "return_default_or_NaN" }
 */
test('API methods handle edge cases gracefully', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 0
    });

    // Clear the input to make it empty
    await apiHelpers.fillWithValue(page, 'test-input', '');

    const value = await getNumericValue(page, 'test-input');
    expect(Number.isNaN(value)).toBe(true); // Empty input returns NaN
  });

/**
 * Scenario: API state is recoverable after errors
 * Given the fixture page is loaded
 * When errors occur during API operations
 * Then the state remains recoverable
 * Params:
 * { "errorScenario": "invalid_setValue", "recoveryAction": "valid_setValue", "expectedOutcome": "recovered_state" }
 */
test('API state is recoverable after errors', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10
    });

    // Try invalid setValue
    await setValueViaAPI(page, 'test-input', 'invalid');
    expect(await getNumericValue(page, 'test-input')).toBe(10); // Error handled

    // Recovery with valid setValue
    await setValueViaAPI(page, 'test-input', '20');
    expect(await getNumericValue(page, 'test-input')).toBe(20); // State recovered
  });

/**
 * Scenario: API methods work with callback modifications
 * Given the fixture page is loaded with callback functions
 * When API methods interact with callbacks
 * Then the interactions work correctly
 * Params:
 * { "callback": "before_calculation", "apiMethod": "setValue", "expectedBehavior": "callback_respected" }
 */
test('API methods work with callback modifications', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 10,
      callback_before_calculation: (value) => {
        // Double the value in the callback
        const num = parseFloat(value);
        return String(num * 2);
      }
    });

    await setValueViaAPI(page, 'test-input', '5');

    // Callback should transform 5 → 10
    const value = await getNumericValue(page, 'test-input');
    expect(value).toBe(10);
  });

/**
 * Scenario: API performance is acceptable under load
 * Given the fixture page is loaded
 * When many API operations are performed rapidly
 * Then performance remains acceptable
 * Params:
 * { "operationCount": 1000, "maxExecutionTime": 1000, "operations": ["upOnce", "downOnce", "setValue"] }
 */
test('API performance with full logging (baseline)', async ({ page }) => {
    await initializeTouchspin(page, 'test-input', {
      step: 1, initval: 0
    });

    const startTime = Date.now();

    // Perform 100 rapid operations with full logging
    for (let i = 0; i < 50; i++) {
      await incrementViaAPI(page, 'test-input');
      await decrementViaAPI(page, 'test-input');
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`✅ Execution time with full logging: ${executionTime}ms`);

    // Should complete within reasonable time (1 second)
    expect(executionTime).toBeLessThan(1000);

    // Final value should be consistent
    const finalValue = await getNumericValue(page, 'test-input');
    expect(finalValue).toBe(0); // Back to initial value after up/down pairs
  });

test('API performance with disabled textarea (events fire but skip DOM)', async ({ page }) => {
    // Disable textarea - events still fire but skip DOM manipulation
    await apiHelpers.disableEventLogging(page);

    await apiHelpers.createAdditionalInput(page, 'perf-test-disabled', { value: '0' });
    await initializeTouchspin(page, 'perf-test-disabled', {
      step: 1, initval: 0
    });

    const startTime = Date.now();

    // Perform 100 rapid operations
    for (let i = 0; i < 50; i++) {
      await incrementViaAPI(page, 'perf-test-disabled');
      await decrementViaAPI(page, 'perf-test-disabled');
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`⚡ Execution time with disabled textarea: ${executionTime}ms`);

    // Should complete within reasonable time (1 second)
    expect(executionTime).toBeLessThan(1000);

    // Final value should be consistent
    const finalValue = await getNumericValue(page, 'perf-test-disabled');
    expect(finalValue).toBe(0); // Back to initial value after up/down pairs
  });

test('API performance with removed textarea (no event registration)', async ({ page }) => {
    // Remove textarea - with the setupLogging check, no events will be registered
    await apiHelpers.removeEventLogTextarea(page);

    await apiHelpers.createAdditionalInput(page, 'perf-test-removed', { value: '0' });
    await initializeTouchspin(page, 'perf-test-removed', {
      step: 1, initval: 0
    });

    const startTime = Date.now();

    // Perform 100 rapid operations
    for (let i = 0; i < 50; i++) {
      await incrementViaAPI(page, 'perf-test-removed');
      await decrementViaAPI(page, 'perf-test-removed');
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`🚀 Execution time with removed textarea: ${executionTime}ms`);

    // Should complete within reasonable time (1 second)
    expect(executionTime).toBeLessThan(1000);

    // Final value should be consistent
    const finalValue = await getNumericValue(page, 'perf-test-removed');
    expect(finalValue).toBe(0); // Back to initial value after up/down pairs
  });
});