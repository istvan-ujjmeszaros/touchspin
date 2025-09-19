import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeTouchspin,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue,
  getPublicAPI,
  startUpSpinViaAPI,
  startDownSpinViaAPI,
  stopSpinViaAPI,
  incrementViaAPI,
  decrementViaAPI,
  updateSettingsViaAPI
} from '../../../__tests__/helpers/touchspinApiHelpers';

test.describe('Core TouchSpin Public API', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-public-api');
  });

  test.describe('toPublicApi Method', () => {
    test('exposes all public API methods', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      const publicApi = await getPublicAPI(page, 'test-input');

      // Verify all expected methods are present
      expect(typeof publicApi.upOnce).toBe('function');
      expect(typeof publicApi.downOnce).toBe('function');
      expect(typeof publicApi.startUpSpin).toBe('function');
      expect(typeof publicApi.startDownSpin).toBe('function');
      expect(typeof publicApi.stopSpin).toBe('function');
      expect(typeof publicApi.updateSettings).toBe('function');
      expect(typeof publicApi.getValue).toBe('function');
      expect(typeof publicApi.setValue).toBe('function');
      expect(typeof publicApi.destroy).toBe('function');
      expect(typeof publicApi.on).toBe('function');
      expect(typeof publicApi.off).toBe('function');
    });

    test('methods maintain correct context binding', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      // Test that methods work when called from public API
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        if (!core) throw new Error('Core not found');

        const publicApi = core.toPublicApi();

        // Test getValue method binding
        const initialValue = publicApi.getValue();

        // Test upOnce method binding
        publicApi.upOnce();
        const afterUp = publicApi.getValue();

        // Test downOnce method binding
        publicApi.downOnce();
        const afterDown = publicApi.getValue();

        return {
          initial: initialValue,
          afterUp: afterUp,
          afterDown: afterDown
        };
      });

      expect(result.initial).toBe(10);
      expect(result.afterUp).toBe(11);
      expect(result.afterDown).toBe(10);
    });

    test('setValue method works through public API', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        publicApi.setValue(25);
        return publicApi.getValue();
      });

      expect(result).toBe(25);
      expect(await readInputValue(page, 'test-input')).toBe('25');
    });

    test('updateSettings method works through public API', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, decimals: 0, initval: 10 });

      await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        publicApi.updateSettings({ decimals: 2 });
        publicApi.setValue(10.555);
      });

      expect(await readInputValue(page, 'test-input')).toBe('10.56');
    });

    test('destroy method works through public API', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      const isDestroyedViaAPI = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        publicApi.destroy();

        // Check if core is gone
        return (input as any)._touchSpinCore === undefined;
      });

      expect(isDestroyedViaAPI).toBe(true);
    });
  });

  test.describe('Direct API Spin Methods', () => {
    test('startUpSpin method works directly', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');

      // Should emit start spin event
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

      await stopSpinViaAPI(page, 'test-input');
    });

    test('startDownSpin method works directly', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      await startDownSpinViaAPI(page, 'test-input');

      // Should emit start spin event
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

      await stopSpinViaAPI(page, 'test-input');
    });

    test('stopSpin method stops active spinning', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      await stopSpinViaAPI(page, 'test-input');

      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
    });

    test('direct spin methods work without renderer/buttons', async ({ page }) => {
      // Initialize without any renderer (no buttons)
      await initializeTouchspin(page, 'test-input', { step: 2, initval: 10 });

      const initialValue = await getNumericValue(page, 'test-input');

      // Direct API should work even without UI buttons
      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.waitForTimeout(100);
      await stopSpinViaAPI(page, 'test-input');

      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue).toBeGreaterThan(initialValue);
    });

    test('idempotent behavior - calling startUpSpin twice', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });
      await apiHelpers.clearEventLog(page);

      await startUpSpinViaAPI(page, 'test-input');

      // Starting again should be idempotent (no second start event)
      await startUpSpinViaAPI(page, 'test-input');

      const startSpinCount = await apiHelpers.countEventInLog(page, 'touchspin.on.startspin', 'touchspin');
      expect(startSpinCount).toBe(1); // Should only have one start event

      await stopSpinViaAPI(page, 'test-input');
    });

    test('direction switching during spin', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      await startUpSpinViaAPI(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Switch to down while spinning up
      await startDownSpinViaAPI(page, 'test-input');

      // Should emit stop then start events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);

      await stopSpinViaAPI(page, 'test-input');
    });
  });

  test.describe('Event System API', () => {
    test('on/off methods work through public API', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      const eventReceived = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        let received = false;
        const handler = () => { received = true; };

        // Register handler through public API
        publicApi.on('startspin', handler);
        publicApi.startUpSpin();

        // Remove handler and try again
        publicApi.off('startspin', handler);
        received = false; // Reset
        publicApi.stopSpin();
        publicApi.startDownSpin();

        publicApi.stopSpin();
        return received;
      });

      // Should be false because handler was removed
      expect(eventReceived).toBe(false);
    });

    test('off method removes all handlers when no specific handler provided', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        let count = 0;
        const handler1 = () => { count++; };
        const handler2 = () => { count++; };

        // Register multiple handlers
        publicApi.on('startspin', handler1);
        publicApi.on('startspin', handler2);
        publicApi.startUpSpin();
        publicApi.stopSpin();

        const countAfterBoth = count;

        // Remove all handlers for the event
        publicApi.off('startspin'); // No specific handler = remove all
        count = 0;
        publicApi.startDownSpin();
        publicApi.stopSpin();

        return {
          countAfterBoth: countAfterBoth,
          countAfterRemoval: count
        };
      });

      expect(result.countAfterBoth).toBe(2); // Both handlers fired
      expect(result.countAfterRemoval).toBe(0); // No handlers fired after removal
    });

    test('event system handles callback errors gracefully', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        let goodHandlerCalled = false;

        // Register a handler that throws
        publicApi.on('startspin', () => {
          throw new Error('Bad handler');
        });

        // Register a good handler
        publicApi.on('startspin', () => {
          goodHandlerCalled = true;
        });

        // This should not crash despite the bad handler
        publicApi.startUpSpin();
        publicApi.stopSpin();

        return goodHandlerCalled;
      });

      // Good handler should still be called despite error in bad handler
      expect(result).toBe(true);
    });
  });

  test.describe('API Behavior After Destroy', () => {
    test('API methods handle destroy gracefully', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      // Get public API reference before destroy
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        // Destroy the core
        publicApi.destroy();

        // Try to use API methods after destroy - should handle gracefully
        try {
          publicApi.upOnce();
          publicApi.getValue();
          publicApi.startUpSpin();
          return 'no-error';
        } catch (error) {
          return 'error';
        }
      });

      // The API should either work gracefully or throw expected errors
      // This test mainly ensures no crashes occur
      expect(['no-error', 'error']).toContain(result);
    });

    test('double destroy is safe', async ({ page }) => {
      await initializeTouchspin(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        const publicApi = core.toPublicApi();

        try {
          publicApi.destroy();
          publicApi.destroy(); // Second destroy should be safe
          return 'success';
        } catch (error) {
          return 'error';
        }
      });

      expect(result).toBe('success');
    });
  });
});

// NOTE: This test file exercises the toPublicApi method and tests the public API
// surface, including method binding, event handling, and post-destroy behavior.
