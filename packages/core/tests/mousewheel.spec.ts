import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../../..__tests__/helpers/touchspinApiHelpers';

test.describe('Core TouchSpin Mousewheel Handling', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-mousewheel');
  });

  test.describe('Mousewheel Configuration', () => {
    test('disabled mousewheel ignores wheel events', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: false, // Disabled
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');
      const initialValue = await getNumericValue(page, 'test-input');

      // Try wheel up
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Value should not change
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);

      // Try wheel down
      await apiHelpers.wheelDownOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Value should still not change
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);
    });

    test('enabled mousewheel responds when input is focused', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: true, // Enabled
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');
      const initialValue = await getNumericValue(page, 'test-input');

      // Wheel up (negative deltaY)
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      const afterWheelUp = await getNumericValue(page, 'test-input');
      expect(afterWheelUp).toBeGreaterThan(initialValue);

      // Wheel down (positive deltaY)
      await apiHelpers.wheelDownOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      const afterWheelDown = await getNumericValue(page, 'test-input');
      expect(afterWheelDown).toBeLessThan(afterWheelUp);
    });

    test('mousewheel requires focus to work', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: true,
        initval: 10
      });

      // Don't focus the input
      const initialValue = await getNumericValue(page, 'test-input');

      // Try wheel without focus
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Value should not change without focus
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);

      // Now focus and try again
      await page.focus('[data-testid="test-input"]');
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Now it should work
      expect(await getNumericValue(page, 'test-input')).toBeGreaterThan(initialValue);
    });

    test('mousewheel events are prevented when enabled and focused', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: true,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');

      // Track whether the wheel event was prevented
      const wasEventPrevented = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        let prevented = false;

        const originalPreventDefault = Event.prototype.preventDefault;
        Event.prototype.preventDefault = function() {
          if (this instanceof WheelEvent) {
            prevented = true;
          }
          originalPreventDefault.call(this);
        };

        // Trigger wheel event
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -100,
          bubbles: true,
          cancelable: true
        });

        input.dispatchEvent(wheelEvent);

        // Restore original preventDefault
        Event.prototype.preventDefault = originalPreventDefault;

        return prevented;
      });

      expect(wasEventPrevented).toBe(true);
    });
  });

  test.describe('Mousewheel Direction Detection', () => {
    test('negative deltaY triggers upOnce', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 2,
        mousewheel: true,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Wheel up (negative deltaY)
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Should increment by step amount
      expect(await getNumericValue(page, 'test-input')).toBe(12);

      // Should emit appropriate events
      expect(await apiHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('positive deltaY triggers downOnce', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        mousewheel: true,
        initval: 15
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Wheel down (positive deltaY)
      await apiHelpers.wheelDownOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Should decrement by step amount
      expect(await getNumericValue(page, 'test-input')).toBe(12);

      // Should emit appropriate events
      expect(await apiHelpers.hasEventInLog(page, 'change', 'native')).toBe(true);
    });

    test('zero deltaY is ignored', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: true,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');
      const initialValue = await getNumericValue(page, 'test-input');

      // Wheel with zero delta
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: 0,
          bubbles: true,
          cancelable: true
        });
        input.dispatchEvent(wheelEvent);
      });

      await apiHelpers.waitForTimeout(50);

      // Value should not change
      expect(await getNumericValue(page, 'test-input')).toBe(initialValue);
    });
  });

  test.describe('Mousewheel with Boundaries', () => {
    test('mousewheel respects min boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        mousewheel: true,
        initval: 1
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Wheel down to reach minimum
      await apiHelpers.wheelDownOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      expect(await getNumericValue(page, 'test-input')).toBe(0);

      // Try to go below minimum
      await apiHelpers.wheelDownOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Should stay at minimum
      expect(await getNumericValue(page, 'test-input')).toBe(0);

      // Should emit min event
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);
    });

    test('mousewheel respects max boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        max: 10,
        mousewheel: true,
        initval: 9
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.clearEventLog(page);

      // Wheel up to reach maximum
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      expect(await getNumericValue(page, 'test-input')).toBe(10);

      // Try to go above maximum
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Should stay at maximum
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      // Should emit max event
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);
    });
  });

  test.describe('Mousewheel Integration', () => {
    test('mousewheel works with decimal steps', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 0.5,
        decimals: 1,
        mousewheel: true,
        initval: 10.0
      });

      await page.focus('[data-testid="test-input"]');

      // Wheel up
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      expect(await getNumericValue(page, 'test-input')).toBe(10.5);
      expect(await readInputValue(page, 'test-input')).toBe('10.5');

      // Wheel down
      await apiHelpers.wheelDownOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      expect(await getNumericValue(page, 'test-input')).toBe(10.0);
      expect(await readInputValue(page, 'test-input')).toBe('10.0');
    });

    test('mousewheel triggers value normalization', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'round',
        mousewheel: true,
        initval: 10 // Will be normalized to 9 (nearest multiple of 3)
      });

      await page.focus('[data-testid="test-input"]');

      // Start with normalized value
      expect(await getNumericValue(page, 'test-input')).toBe(9);

      // Wheel up should maintain step divisibility
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      expect(await getNumericValue(page, 'test-input')).toBe(12);
    });

    test('multiple rapid wheel events work correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: true,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');

      // Multiple rapid wheel events
      await page.mouse.wheel(0, -50);
      await page.mouse.wheel(0, -50);
      await page.mouse.wheel(0, -50);
      await apiHelpers.waitForTimeout(100);

      // Should handle all events
      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue).toBeGreaterThan(10);
      expect(finalValue).toBeLessThanOrEqual(13); // Should not exceed reasonable bounds
    });

    test('mousewheel disabled after destroy', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: true,
        initval: 10
      });

      await page.focus('[data-testid="test-input"]');

      // Verify mousewheel works before destroy
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);
      expect(await getNumericValue(page, 'test-input')).toBe(11);

      // Destroy and try again
      await destroyCore(page, 'test-input');
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Should not change after destroy
      expect(await getNumericValue(page, 'test-input')).toBe(11);
    });
  });

  test.describe('Focus Integration', () => {
    test('focus changes during wheel events', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        mousewheel: true,
        initval: 10
      });

      // Create another focusable element
      await page.evaluate(() => {
        const otherInput = document.createElement('input');
        otherInput.id = 'other-input';
        document.body.appendChild(otherInput);
      });

      await page.focus('[data-testid="test-input"]');
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      expect(await getNumericValue(page, 'test-input')).toBe(11);

      // Focus away and try wheel
      await page.focus('#other-input');
      await apiHelpers.wheelUpOnInput(page, 'test-input');
      await apiHelpers.waitForTimeout(50);

      // Should not change when not focused
      expect(await getNumericValue(page, 'test-input')).toBe(11);
    });
  });
});

// NOTE: This test file exercises the _handleWheel function and mousewheel configuration,
// covering focus requirements, direction detection, boundary respect, and integration scenarios.
