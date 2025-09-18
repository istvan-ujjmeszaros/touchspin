import { test, expect } from '@playwright/test';
import touchspinHelpers from '../test-helpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Event System Internals', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-event-system-internals');
  });

  test.describe('Event Subscription Management', () => {
    test('off() method removes specific handler', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const eventCallCounts = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let handler1Calls = 0;
        let handler2Calls = 0;

        const handler1 = () => { handler1Calls++; };
        const handler2 = () => { handler2Calls++; };

        // Subscribe both handlers to the same event
        core.on('min', handler1);
        core.on('min', handler2);

        // Trigger event - both should fire
        core.emit('min');
        const bothActiveCount = handler1Calls + handler2Calls;

        // Remove only handler1
        core.off('min', handler1);

        // Reset counters
        handler1Calls = 0;
        handler2Calls = 0;

        // Trigger event again - only handler2 should fire
        core.emit('min');
        const onlyHandler2Count = handler1Calls + handler2Calls;

        return {
          bothActive: bothActiveCount,
          onlyHandler2: onlyHandler2Count,
          handler1Final: handler1Calls,
          handler2Final: handler2Calls
        };
      });

      expect(eventCallCounts.bothActive).toBe(2); // Both handlers fired
      expect(eventCallCounts.onlyHandler2).toBe(1); // Only handler2 fired
      expect(eventCallCounts.handler1Final).toBe(0); // handler1 was removed
      expect(eventCallCounts.handler2Final).toBe(1); // handler2 still active
    });

    test('off() method removes all handlers when no specific handler provided', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const eventCallCounts = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let handler1Calls = 0;
        let handler2Calls = 0;

        const handler1 = () => { handler1Calls++; };
        const handler2 = () => { handler2Calls++; };

        // Subscribe multiple handlers
        core.on('max', handler1);
        core.on('max', handler2);

        // Trigger event - both should fire
        core.emit('max');
        const beforeRemovalCount = handler1Calls + handler2Calls;

        // Remove ALL handlers for the event
        core.off('max'); // No specific handler provided

        // Reset counters
        handler1Calls = 0;
        handler2Calls = 0;

        // Trigger event again - no handlers should fire
        core.emit('max');
        const afterRemovalCount = handler1Calls + handler2Calls;

        return {
          beforeRemoval: beforeRemovalCount,
          afterRemoval: afterRemovalCount
        };
      });

      expect(eventCallCounts.beforeRemoval).toBe(2); // Both handlers fired
      expect(eventCallCounts.afterRemoval).toBe(0); // All handlers removed
    });

    test('off() method handles non-existent event gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        try {
          // Try to remove handlers from an event that was never subscribed to
          core.off('nonexistent');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      expect(result.success).toBe(true); // Should not throw error
    });

    test('off() method handles non-existent handler gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        const handler1 = () => {};
        const handler2 = () => {}; // This one won't be subscribed

        // Subscribe only handler1
        core.on('min', handler1);

        try {
          // Try to remove handler2 that was never subscribed
          core.off('min', handler2);
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      expect(result.success).toBe(true); // Should not throw error
    });
  });

  test.describe('Event Emission System', () => {
    test('emit() method triggers subscribed handlers with detail', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const emissionResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let receivedDetail: any = null;
        let handlerCallCount = 0;

        const handler = (detail: any) => {
          handlerCallCount++;
          receivedDetail = detail;
        };

        // Subscribe handler
        core.on('startspin', handler);

        // Emit event with detail
        const testDetail = { test: 'data', value: 42 };
        core.emit('startspin', testDetail);

        return {
          callCount: handlerCallCount,
          receivedDetail: receivedDetail
        };
      });

      expect(emissionResult.callCount).toBe(1);
      expect(emissionResult.receivedDetail).toEqual({ test: 'data', value: 42 });
    });

    test('emit() method triggers multiple handlers for same event', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const multiHandlerResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let handler1Calls = 0;
        let handler2Calls = 0;
        let handler3Calls = 0;

        const handler1 = () => { handler1Calls++; };
        const handler2 = () => { handler2Calls++; };
        const handler3 = () => { handler3Calls++; };

        // Subscribe multiple handlers
        core.on('stopspin', handler1);
        core.on('stopspin', handler2);
        core.on('stopspin', handler3);

        // Emit event once
        core.emit('stopspin');

        return {
          handler1: handler1Calls,
          handler2: handler2Calls,
          handler3: handler3Calls,
          total: handler1Calls + handler2Calls + handler3Calls
        };
      });

      expect(multiHandlerResult.handler1).toBe(1);
      expect(multiHandlerResult.handler2).toBe(1);
      expect(multiHandlerResult.handler3).toBe(1);
      expect(multiHandlerResult.total).toBe(3);
    });

    test('emit() method handles non-existent event gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        try {
          // Emit event that has no subscribers
          core.emit('nonexistent');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      expect(result.success).toBe(true); // Should not throw error
    });

    test('emit() method works without detail parameter', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const noDetailResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let receivedDetail: any = 'not-called';
        let handlerCalled = false;

        const handler = (detail: any) => {
          handlerCalled = true;
          receivedDetail = detail;
        };

        core.on('max', handler);
        core.emit('max'); // No detail parameter

        return {
          handlerCalled: handlerCalled,
          receivedDetail: receivedDetail
        };
      });

      expect(noDetailResult.handlerCalled).toBe(true);
      expect(noDetailResult.receivedDetail).toBeUndefined();
    });
  });

  test.describe('Teardown Callback System', () => {
    test('registerTeardown() registers and executes callback on destroy', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const teardownResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let callback1Called = false;
        let callback2Called = false;

        // Register teardown callbacks
        core.registerTeardown(() => { callback1Called = true; });
        core.registerTeardown(() => { callback2Called = true; });

        // Destroy the core
        core.destroy();

        return {
          callback1Called: callback1Called,
          callback2Called: callback2Called
        };
      });

      expect(teardownResult.callback1Called).toBe(true);
      expect(teardownResult.callback2Called).toBe(true);
    });

    test('registerTeardown() returns unregister function', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const unregisterResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let callback1Called = false;
        let callback2Called = false;

        // Register callbacks and get unregister functions
        const unregister1 = core.registerTeardown(() => { callback1Called = true; });
        const unregister2 = core.registerTeardown(() => { callback2Called = true; });

        // Unregister callback1
        unregister1();

        // Destroy the core
        core.destroy();

        return {
          callback1Called: callback1Called, // Should be false (unregistered)
          callback2Called: callback2Called  // Should be true (still registered)
        };
      });

      expect(unregisterResult.callback1Called).toBe(false); // Unregistered
      expect(unregisterResult.callback2Called).toBe(true); // Still registered
    });

    test('registerTeardown() throws error for non-function callback', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const errorResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        try {
          // Try to register non-function as callback
          core.registerTeardown('not-a-function');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toContain('Teardown callback must be a function');
    });

    test('teardown callback errors are caught and logged', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Capture console errors
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });

      await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let goodCallbackCalled = false;

        // Register a callback that throws an error
        core.registerTeardown(() => {
          throw new Error('Test teardown error');
        });

        // Register a callback that works fine
        core.registerTeardown(() => {
          goodCallbackCalled = true;
        });

        // Destroy should handle the error gracefully
        core.destroy();

        return { goodCallbackCalled: goodCallbackCalled };
      });

      // The good callback should still execute despite the error in the first one
      expect(consoleMessages.some(msg => msg.includes('TouchSpin teardown callback error'))).toBe(true);
    });

    test('teardown callbacks are cleared after destroy', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const callbackResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let callbackCount = 0;

        // Register callback
        core.registerTeardown(() => { callbackCount++; });

        // Destroy once
        core.destroy();
        const firstDestroyCount = callbackCount;

        // Try to destroy again (callbacks should be cleared)
        try {
          core.destroy();
          const secondDestroyCount = callbackCount;

          return {
            firstDestroy: firstDestroyCount,
            secondDestroy: secondDestroyCount,
            success: true
          };
        } catch (error) {
          return {
            firstDestroy: firstDestroyCount,
            secondDestroy: callbackCount,
            success: false,
            error: error.message
          };
        }
      });

      expect(callbackResult.firstDestroy).toBe(1); // Callback ran once
      expect(callbackResult.secondDestroy).toBe(1); // Callback didn't run again
    });

    test('unregister function handles callback not in array', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        const callback = () => {};
        const unregister = core.registerTeardown(callback);

        // Unregister twice (second time should be safe)
        unregister(); // First unregister

        try {
          unregister(); // Second unregister (callback no longer in array)
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      expect(result.success).toBe(true); // Should handle gracefully
    });
  });

  test.describe('Event System Integration', () => {
    test('on() method returns unsubscribe function that works with off()', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const unsubscribeResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let handlerCalled = false;
        const handler = () => { handlerCalled = true; };

        // Subscribe and get unsubscribe function
        const unsubscribe = core.on('startspin', handler);

        // Emit event - should call handler
        core.emit('startspin');
        const calledBeforeUnsubscribe = handlerCalled;

        // Unsubscribe using returned function
        unsubscribe();

        // Reset and emit again - should not call handler
        handlerCalled = false;
        core.emit('startspin');
        const calledAfterUnsubscribe = handlerCalled;

        return {
          beforeUnsubscribe: calledBeforeUnsubscribe,
          afterUnsubscribe: calledAfterUnsubscribe
        };
      });

      expect(unsubscribeResult.beforeUnsubscribe).toBe(true);
      expect(unsubscribeResult.afterUnsubscribe).toBe(false);
    });

    test('event system handles rapid subscribe/unsubscribe cycles', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const cycleResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let finalCallCount = 0;

        // Rapid subscribe/unsubscribe cycle
        for (let i = 0; i < 10; i++) {
          const handler = () => { finalCallCount++; };
          const unsubscribe = core.on('max', handler);

          if (i % 2 === 0) {
            // Unsubscribe even-numbered handlers
            unsubscribe();
          }
        }

        // Emit event - only odd-numbered handlers should respond
        core.emit('max');

        return { finalCallCount: finalCallCount };
      });

      expect(cycleResult.finalCallCount).toBe(5); // Only 5 odd-numbered handlers
    });

    test('event system survives settings updates', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const survivalResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let handlerCallCount = 0;
        const handler = () => { handlerCallCount++; };

        // Subscribe to event
        core.on('startspin', handler);

        // Update settings (might trigger internal changes)
        core.updateSettings({ step: 2, max: 100 });

        // Emit event - handler should still work
        core.emit('startspin');

        return { handlerCallCount: handlerCallCount };
      });

      expect(survivalResult.handlerCallCount).toBe(1);
    });
  });
});

// NOTE: This test file exercises the internal event system methods (off, emit, registerTeardown),
// covering event subscription management, emission system, teardown callback registration and execution,
// error handling, and integration scenarios with rapid cycles and settings updates.