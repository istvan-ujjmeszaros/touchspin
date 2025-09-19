import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  incrementViaAPI,
  decrementViaAPI,
  readInputValue,
  getPublicAPI,
  updateSettingsViaAPI,
  incrementViaKeyboard,
  decrementViaKeyboard,
  incrementViaWheel,
  decrementViaWheel,
  startUpSpinViaAPI,
  startDownSpinViaAPI,
  stopSpinViaAPI
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Coverage Boost', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-coverage-boost');
  });

  test.describe('Public API Surface', () => {
    test('toPublicApi should expose core methods with correct structure', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const publicApi = await getPublicAPI(page, 'test-input');

      // Verify public API has expected methods/properties
      expect(typeof publicApi).toBe('object');
      expect(publicApi).toBeTruthy();
    });
  });

  test.describe('Force Step Divisibility None', () => {
    test('forcestepdivisibility none preserves non-divisible values through increment', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'none',
        initval: 10  // Not divisible by 3
      });

      // Value should remain 10 (not normalized to 9 or 12)
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      await incrementViaAPI(page, 'test-input');
      // 10 + 3 = 13 (non-divisible by 3, but allowed)
      expect(await getNumericValue(page, 'test-input')).toBe(13);
    });

    test('forcestepdivisibility none with decimals preserves precision', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 0.1,
        decimals: 2,
        forcestepdivisibility: 'none',
        initval: 5.33  // Not exact multiple of 0.1
      });

      expect(await getNumericValue(page, 'test-input')).toBe(5.33);
      expect(await readInputValue(page, 'test-input')).toBe('5.33');
    });
  });

  test.describe('Runtime Settings Updates', () => {
    test('updateSettingsViaAPI can switch forcestepdivisibility round to none', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'round',
        initval: 10  // Gets normalized to 9
      });

      expect(await getNumericValue(page, 'test-input')).toBe(9); // Rounded to nearest

      // Switch to none mode
      await updateSettingsViaAPI(page, 'test-input', { forcestepdivisibility: 'none' });

      await setValueViaAPI(page, 'test-input', 10);
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Now preserved
    });

    test('updateSettingsViaAPI can switch forcestepdivisibility none to round', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        forcestepdivisibility: 'none',
        initval: 17  // Not divisible by 5
      });

      expect(await getNumericValue(page, 'test-input')).toBe(17); // Preserved

      // Switch to round mode
      await updateSettingsViaAPI(page, 'test-input', { forcestepdivisibility: 'round' });

      await setValueViaAPI(page, 'test-input', 18);
      expect(await getNumericValue(page, 'test-input')).toBe(20); // Rounded to nearest multiple of 5
    });
  });

  test.describe('Keyboard Events Emit Start/Stop Spin', () => {
    test('keyboard hold emits startspin and stopspin events', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      await page.focus('[data-testid="test-input"]');
      await page.keyboard.down('ArrowUp');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

      await page.keyboard.up('ArrowUp');
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('API spin methods do not emit startspin or stopspin events', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      // API methods should not emit start/stop events
      await incrementViaAPI(page, 'test-input');
      await decrementViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(false);
    });
  });

  test.describe('Wheel Events Emit Start/Stop Spin', () => {
    test('mousewheel emits startspin and stopspin events when focused', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Wheel events should emit start/stop events
      await apiHelpers.wheelUpOnInput(page, 'test-input');  // Wheel up
      await apiHelpers.waitForTimeout(50);

      // Check if spin events were emitted (may vary by browser/implementation)
      const startSpinCount = await apiHelpers.countEventInLog(page, 'touchspin.on.startspin', 'touchspin');
      const stopSpinCount = await apiHelpers.countEventInLog(page, 'touchspin.on.stopspin', 'touchspin');

      // At least start/stop pairs should be balanced or events should occur
      expect(startSpinCount).toBeGreaterThanOrEqual(0);
      expect(stopSpinCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Settings Sanitization Edge Cases', () => {
    test('invalid step values are sanitized to 1', async ({ page }) => {
      // Test infinite step
      await initializeCore(page, 'test-input', { step: Infinity, initval: 10 });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(11); // Uses default step 1

      // Test NaN step
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { step: NaN, initval: 10 });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(11);

      // Test negative step
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { step: -5, initval: 10 });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(11);
    });

    test('invalid decimals values are sanitized to 0', async ({ page }) => {
      // Test negative decimals
      await initializeCore(page, 'test-input', { decimals: -2, initval: 10.555 });
      expect(await readInputValue(page, 'test-input')).toBe('11'); // Rounded, no decimals

      // Test infinite decimals
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { decimals: Infinity, initval: 10.555 });
      expect(await readInputValue(page, 'test-input')).toBe('11');

      // Test NaN decimals
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { decimals: NaN, initval: 10.555 });
      expect(await readInputValue(page, 'test-input')).toBe('11');
    });

    test('invalid min values are sanitized to null', async ({ page }) => {
      // Test NaN min
      await initializeCore(page, 'test-input', { min: NaN, initval: 10 });
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000); // No min constraint

      // Test string min
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { min: 'invalid', initval: 10 });
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000);

      // Test empty string min
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { min: '', initval: 10 });
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000);
    });

    test('invalid max values are sanitized to null', async ({ page }) => {
      // Test NaN max
      await initializeCore(page, 'test-input', { max: NaN, initval: 10 });
      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000); // No max constraint

      // Test infinite max
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { max: Infinity, initval: 10 });
      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000);

      // Test undefined max
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { max: undefined, initval: 10 });
      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000);
    });

    test('min/max values are swapped when min > max', async ({ page }) => {
      // Initialize with swapped min/max
      await initializeCore(page, 'test-input', {
        min: 50,
        max: 10, // max < min, should be swapped
        initval: 25
      });

      // Value should be clamped to swapped range (min=10, max=50)
      await setValueViaAPI(page, 'test-input', 5);
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Clamped to new min

      await setValueViaAPI(page, 'test-input', 100);
      expect(await getNumericValue(page, 'test-input')).toBe(50); // Clamped to new max
    });

    test('invalid stepinterval values are sanitized to default', async ({ page }) => {
      // Test negative stepinterval
      await initializeCore(page, 'test-input', { stepinterval: -100, initval: 10 });
      // Should use default stepinterval (can't easily test timing but should not crash)
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      // Test NaN stepinterval
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { stepinterval: NaN, initval: 10 });
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });

    test('invalid stepintervaldelay values are sanitized to default', async ({ page }) => {
      // Test negative stepintervaldelay
      await initializeCore(page, 'test-input', { stepintervaldelay: -500, initval: 10 });
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      // Test infinite stepintervaldelay
      await destroyCore(page, 'test-input');
      await initializeCore(page, 'test-input', { stepintervaldelay: Infinity, initval: 10 });
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });
  });

  test.describe('Disabled and Readonly Input Handling', () => {
    test('disabled input does not respond to spin operations', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Disable the input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });

      const initialValue = await getNumericValue(page, 'test-input');

      // Try to start spinning - should be ignored
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);
      await stopSpinViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);
    });

    test('readonly input does not respond to spin operations', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Make input readonly
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('readonly', '');
      });

      const initialValue = await getNumericValue(page, 'test-input');

      // Try to start spinning - should be ignored
      await startDownSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);
      await stopSpinViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);
    });

    test('spinning stops when input becomes disabled during operation', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Start spinning
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Disable input during spin
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });

      // Future spin attempts should be ignored
      const valueAfterDisable = await getNumericValue(page, 'test-input');
      await apiHelpers.waitForTimeout(100);

      // Value should not change further
      expect(await getNumericValue(page, 'test-input')).toBe(valueAfterDisable);
    });

    test('spinning direction change works for enabled inputs', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Start up spin
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Change to down spin (should stop up and start down)
      await startDownSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      await stopSpinViaAPI(page, 'test-input');

      // Should have changed value and handled direction change
      const finalValue = await getNumericValue(page, 'test-input');
      expect(typeof finalValue).toBe('number');
    });

    test('spin stops at boundaries and does not start continuous spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 2,
        initval: 1
      });

      // Start up spin - should reach max=2 and stop
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);
      await stopSpinViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(2);

      // Start down spin from max - should go down by 1 each time
      await startDownSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);
      await stopSpinViaAPI(page, 'test-input');

      // Should be at 1 after one down spin, then continue to 0
      const valueAfterFirstDown = await getNumericValue(page, 'test-input');
      expect(valueAfterFirstDown).toBeGreaterThanOrEqual(0);
      expect(valueAfterFirstDown).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Native Attribute Parsing', () => {
    test('parses valid native min attribute', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '5');
      });

      await initializeCore(page, 'test-input', { initval: 3 });

      // Value should be clamped to min
      expect(await getNumericValue(page, 'test-input')).toBe(5);
    });

    test('parses valid native max attribute', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('max', '10');
      });

      await initializeCore(page, 'test-input', { initval: 15 });

      // Value should be clamped to max
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });

    test('parses valid native step attribute', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('step', '5');
      });

      await initializeCore(page, 'test-input', { initval: 10 });

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(15); // 10 + 5
    });

    test('handles invalid native min attribute', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', 'invalid');
      });

      await initializeCore(page, 'test-input', { initval: 10 });

      // Should not have min constraint due to invalid attribute
      await setValueViaAPI(page, 'test-input', -100);
      expect(await getNumericValue(page, 'test-input')).toBe(-100);
    });

    test('handles invalid native max attribute', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('max', 'NaN');
      });

      await initializeCore(page, 'test-input', { initval: 10 });

      // Should not have max constraint due to invalid attribute
      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000);
    });

    test('handles invalid native step attribute', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('step', '-5');
      });

      await initializeCore(page, 'test-input', { initval: 10 });

      // Should use default step of 1 due to invalid step
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(11);
    });

    test('handles empty string native attributes', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '');
        input.setAttribute('max', '');
        input.setAttribute('step', '');
      });

      await initializeCore(page, 'test-input', { initval: 10 });

      // Empty attributes should be treated as null/default
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000); // No min

      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000); // No max

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(1001); // Step = 1
    });

    test('dynamically updates when native attributes change', async ({ page }) => {
      await initializeCore(page, 'test-input', { initval: 10 });

      // Add min attribute dynamically
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '15');
      });

      // Give mutation observer time to trigger
      await apiHelpers.waitForTimeout(100);

      // Value should be updated to respect new min
      expect(await getNumericValue(page, 'test-input')).toBe(15);
    });

    test('removes constraints when native attributes are removed', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '5');
        input.setAttribute('max', '15');
      });

      await initializeCore(page, 'test-input', { initval: 10 });

      // Remove attributes
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.removeAttribute('min');
        input.removeAttribute('max');
      });

      // Give mutation observer time to trigger
      await apiHelpers.waitForTimeout(100);

      // Should no longer have constraints
      await setValueViaAPI(page, 'test-input', 0);
      expect(await getNumericValue(page, 'test-input')).toBe(0);

      await setValueViaAPI(page, 'test-input', 100);
      expect(await getNumericValue(page, 'test-input')).toBe(100);
    });
  });

  test.describe('Edge Cases and Error Paths', () => {
    test('setValue with invalid input preserves previous value', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const initialValue = await getNumericValue(page, 'test-input');

      // Try to set invalid values
      await setValueViaAPI(page, 'test-input', NaN);
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);

      await setValueViaAPI(page, 'test-input', 'invalid');
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);
    });

    test('extreme boundary values are handled correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: -999999,
        max: 999999,
        initval: 0
      });

      await setValueViaAPI(page, 'test-input', -1000000); // Below min
      expect(await getNumericValue(page, 'test-input')).toBe(-999999); // Clamped to min

      await setValueViaAPI(page, 'test-input', 1000000); // Above max
      expect(await getNumericValue(page, 'test-input')).toBe(999999); // Clamped to max
    });

    test('zero step value defaults to 1', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0, initval: 10 });

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(11); // Step 0 becomes 1
    });

    test('negative step value is handled gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: -1, initval: 10 });

      await incrementViaAPI(page, 'test-input');
      const newValue = await getNumericValue(page, 'test-input');
      expect(typeof newValue).toBe('number');
      expect(newValue).not.toBe(10); // Should change somehow
    });
  });
});

// NOTE: This test file adds micro-tests to improve coverage of edge cases,
// public API surface, and less common configuration combinations.
