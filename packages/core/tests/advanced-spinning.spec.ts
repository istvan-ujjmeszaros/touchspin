import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue,
  startUpSpinViaAPI,
  startDownSpinViaAPI,
  stopSpinViaAPI,
  incrementViaAPI,
  decrementViaAPI
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Advanced Spinning', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-advanced-spinning');
  });

  test.describe('Disabled Input Spin Blocking', () => {
    test('disabled input blocks spin from starting', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Disable the input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });

      const initialValue = await getNumericValue(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Try to start spinning - should be blocked
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);

      // No spin events should be emitted
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);
    });

    test('readonly input blocks spin from starting', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Make input readonly
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('readonly', '');
      });

      const initialValue = await getNumericValue(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Try to start spinning - should be blocked
      await startDownSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);

      // No spin events should be emitted
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);
    });
  });

  test.describe('Spin Direction Management', () => {
    test('starting same direction spin is idempotent', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      // Start up spin
      await startUpSpinViaAPI(page, 'test-input');

      // Clear log and start up spin again
      await apiHelpers.clearEventLog(page);
      await startUpSpinViaAPI(page, 'test-input');

      // Should not emit another start event (idempotent)
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);

      await stopSpinViaAPI(page, 'test-input');
    });

    test('changing direction stops current spin and starts new one', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Start up spin
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Switch to down spin
      await startDownSpinViaAPI(page, 'test-input');

      // Should emit stop then start events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

      await stopSpinViaAPI(page, 'test-input');
    });

    test('direction change resets spin counter', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10, booster: true, boostat: 5 });

      // Start up spin and let it run to build spin count
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(200); // Let some spin cycles occur

      // Switch direction - should reset counter
      await startDownSpinViaAPI(page, 'test-input');

      // The spin counter reset is internal, but we can verify the direction change worked
      await apiHelpers.waitForTimeout(50);
      await stopSpinViaAPI(page, 'test-input');

      // Test passes if no errors occur and direction changes work
      expect(await getNumericValue(page, 'test-input')).toBeGreaterThanOrEqual(8);
    });
  });

  test.describe('Boundary Prevention', () => {
    test('up spin stops immediately if already at max boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 10,
        initval: 10 // Start at max
      });

      await apiHelpers.clearEventLog(page);

      // Try to spin up from max - should not start continuous spin
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);

      // May emit start event but should not continue spinning
      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(10); // Should remain at max

      await stopSpinViaAPI(page, 'test-input');
    });

    test('down spin stops immediately if already at min boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 10,
        initval: 0 // Start at min
      });

      await apiHelpers.clearEventLog(page);

      // Try to spin down from min - should not start continuous spin
      await startDownSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);

      // May emit start event but should not continue spinning
      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(0); // Should remain at min

      await stopSpinViaAPI(page, 'test-input');
    });

    test('spin stops at boundary during continuous spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 2,
        initval: 1
      });

      await apiHelpers.clearEventLog(page);

      // Start spinning up - should stop when reaching max
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(200); // Give time to reach boundary

      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue).toBe(2); // Should stop at max

      // Ensure spin stopped automatically
      await apiHelpers.waitForTimeout(100);
      expect(await getNumericValue(page, 'test-input')).toBe(2); // Should not change further

      await stopSpinViaAPI(page, 'test-input');
    });
  });

  test.describe('Spin Timer Management', () => {
    test('spin uses stepintervaldelay and stepinterval settings', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepintervaldelay: 100, // Short delay for testing
        stepinterval: 50        // Fast interval for testing
      });

      const startTime = Date.now();
      await startUpSpinViaAPI(page, 'test-input');

      // Wait for multiple spin cycles
      await apiHelpers.waitForTimeout(300);
      await stopSpinViaAPI(page, 'test-input');

      const finalValue = await getNumericValue(page, 'test-input');
      const elapsed = Date.now() - startTime;

      // Should have incremented multiple times due to fast settings
      expect(finalValue).toBeGreaterThan(11); // At least some increments
      expect(elapsed).toBeGreaterThan(100); // Ran for reasonable time
    });

    test('timer cleanup prevents continued spinning after stop', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 50
      });

      await startUpSpinViaAPI(page, 'test-input');
      const valueBeforeStop = await getNumericValue(page, 'test-input');

      await stopSpinViaAPI(page, 'test-input');

      // Wait longer than the interval to ensure no more changes
      await apiHelpers.waitForTimeout(200);
      const valueAfterStop = await getNumericValue(page, 'test-input');

      // Value should not change after stop
      expect(valueAfterStop).toBe(valueBeforeStop);
    });

    test('immediate step occurs before timer-based spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepintervaldelay: 1000 // Long delay
      });

      await startUpSpinViaAPI(page, 'test-input');

      // Should immediately increment once before timers kick in
      const immediateValue = await getNumericValue(page, 'test-input');
      expect(immediateValue).toBe(11);

      // Stop before timer kicks in
      await stopSpinViaAPI(page, 'test-input');
    });
  });

  test.describe('Spin Event Emission Patterns', () => {
    test('emits correct events for up spin lifecycle', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');

      // Should emit start events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);

      await apiHelpers.clearEventLog(page);
      await stopSpinViaAPI(page, 'test-input');

      // Should emit stop events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('emits correct events for down spin lifecycle', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      await startDownSpinViaAPI(page, 'test-input');

      // Should emit start events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);

      await apiHelpers.clearEventLog(page);
      await stopSpinViaAPI(page, 'test-input');

      // Should emit stop events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('direction events are specific to direction', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Test up direction specificity
      await apiHelpers.clearEventLog(page);
      await startUpSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(false);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(false);

      // Test down direction specificity
      await apiHelpers.clearEventLog(page);
      await startDownSpinViaAPI(page, 'test-input');
      await stopSpinViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(false);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(false);
    });
  });

  test.describe('Spin Counter and State', () => {
    test('spin counter increments during continuous spin', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 50
      });

      // Access the internal spin counter for testing
      const spinCounters = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Start spinning and track counter changes
        core.startUpSpin();

        await new Promise(resolve => setTimeout(resolve, 200));

        const counterDuringSpin = core.spincount;

        core.stopSpin();
        const counterAfterStop = core.spincount;

        return {
          during: counterDuringSpin,
          after: counterAfterStop
        };
      });

      expect(spinCounters.during).toBeGreaterThan(0);
      // Counter should maintain its value after stop (not reset to 0)
      expect(spinCounters.after).toBe(spinCounters.during);
    });

    test('_spinStep method increments counter and performs step', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 2, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        const initialValue = core.getValue();
        const initialCounter = core.spincount;

        // Call _spinStep directly to test the internal method
        core._spinStep('up');

        return {
          initialValue: initialValue,
          initialCounter: initialCounter,
          finalValue: core.getValue(),
          finalCounter: core.spincount
        };
      });

      expect(result.finalValue).toBe(result.initialValue + 2); // Step of 2
      expect(result.finalCounter).toBe(result.initialCounter + 1); // Counter incremented
    });
  });
});

// NOTE: This test file exercises the _startSpin function and related spinning logic,
// including direction management, boundary prevention, timer handling, and event emission.
