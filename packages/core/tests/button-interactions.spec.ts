import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Button Mouse/Touch Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-button-interactions');
  });

  test.describe('Up Button Mouse Events', () => {
    test('mousedown on up button starts spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      const upButton = page.locator('[data-testid="test-input-up"]');
      await apiHelpers.clearEventLog(page);

      // Mouse down on up button
      await upButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(50);

      // Should increment immediately
      expect(await getNumericValue(page, 'test-input')).toBe(11);

      // Should emit start spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);

      // Clean up
      await upButton.dispatchEvent('mouseup');
    });

    test('mousedown preventDefault behavior on up button', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      const wasEventPrevented = await page.evaluate(async () => {
        const upBtn = document.querySelector('[data-testid="test-input-up"]') as HTMLElement;
        let prevented = false;

        // Create mousedown event
        const mouseEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true
        });

        // Override preventDefault to track if it was called
        const originalPreventDefault = mouseEvent.preventDefault;
        mouseEvent.preventDefault = function() {
          prevented = true;
          originalPreventDefault.call(this);
        };

        upBtn.dispatchEvent(mouseEvent);
        return prevented;
      });

      expect(wasEventPrevented).toBe(true);
    });

    test('mouseup stops spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 50 // Fast for testing
      });

      const upButton = page.locator('[data-testid="test-input-up"]');

      // Start spinning
      await upButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(150); // Let it spin a few times

      const valueBeforeStop = await getNumericValue(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Stop spinning
      await upButton.dispatchEvent('mouseup');
      await apiHelpers.waitForTimeout(50);

      // Should emit stop spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopupspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);

      // Should stop changing value
      await apiHelpers.waitForTimeout(100);
      expect(await getNumericValue(page, 'test-input')).toBe(valueBeforeStop);
    });

    test('mouseleave on document stops spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 50
      });

      const upButton = page.locator('[data-testid="test-input-up"]');

      // Start spinning
      await upButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(100);

      const valueBeforeLeave = await getNumericValue(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Simulate mouse leave document
      await page.evaluate(() => {
        const mouseleaveEvent = new MouseEvent('mouseleave', {
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(mouseleaveEvent);
      });
      await apiHelpers.waitForTimeout(50);

      // Should stop spinning
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);

      // Should stop changing value
      await apiHelpers.waitForTimeout(100);
      expect(await getNumericValue(page, 'test-input')).toBe(valueBeforeLeave);
    });

    test('continuous mouse hold creates multiple increments', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 30, // Very fast for testing
        stepintervaldelay: 50 // Short delay
      });

      const upButton = page.locator('[data-testid="test-input-up"]');

      // Hold mouse down for continuous spinning
      await upButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(200); // Let it spin multiple times

      const finalValue = await getNumericValue(page, 'test-input');
      await upButton.dispatchEvent('mouseup');

      // Should have incremented multiple times
      expect(finalValue).toBeGreaterThan(12); // At least 2+ increments
    });
  });

  test.describe('Down Button Mouse Events', () => {
    test('mousedown on down button starts spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 2,
        initval: 20
      });

      const downButton = page.locator('[data-testid="test-input-down"]');
      await apiHelpers.clearEventLog(page);

      // Mouse down on down button
      await downButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(50);

      // Should decrement immediately
      expect(await getNumericValue(page, 'test-input')).toBe(18); // 20 - 2

      // Should emit start spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);

      // Clean up
      await downButton.dispatchEvent('mouseup');
    });

    test('mousedown preventDefault behavior on down button', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      const wasEventPrevented = await page.evaluate(async () => {
        const downBtn = document.querySelector('[data-testid="test-input-down"]') as HTMLElement;
        let prevented = false;

        // Create mousedown event
        const mouseEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true
        });

        // Override preventDefault to track if it was called
        const originalPreventDefault = mouseEvent.preventDefault;
        mouseEvent.preventDefault = function() {
          prevented = true;
          originalPreventDefault.call(this);
        };

        downBtn.dispatchEvent(mouseEvent);
        return prevented;
      });

      expect(wasEventPrevented).toBe(true);
    });

    test('mouseup on down button stops spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 50
      });

      const downButton = page.locator('[data-testid="test-input-down"]');

      // Start spinning down
      await downButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(150);

      const valueBeforeStop = await getNumericValue(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // Stop spinning
      await downButton.dispatchEvent('mouseup');
      await apiHelpers.waitForTimeout(50);

      // Should emit stop spin events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopdownspin', 'touchspin')).toBe(true);
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);

      // Should stop changing value
      await apiHelpers.waitForTimeout(100);
      expect(await getNumericValue(page, 'test-input')).toBe(valueBeforeStop);
    });
  });

  test.describe('Touch Events', () => {
    test('touchstart on up button starts spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 15
      });

      const upButton = page.locator('[data-testid="test-input-up"]');
      await apiHelpers.clearEventLog(page);

      // Dispatch touchstart event
      await upButton.dispatchEvent('touchstart', { touches: [{ clientX: 0, clientY: 0 }] });
      await apiHelpers.waitForTimeout(50);

      // Should increment
      expect(await getNumericValue(page, 'test-input')).toBe(16);

      // Should emit start events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startupspin', 'touchspin')).toBe(true);

      // Clean up
      await upButton.dispatchEvent('touchend');
    });

    test('touchstart preventDefault behavior', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      const wasEventPrevented = await page.evaluate(async () => {
        const upBtn = document.querySelector('[data-testid="test-input-up"]') as HTMLElement;
        let prevented = false;

        // Create touchstart event
        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [{
            identifier: 0,
            target: upBtn,
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            screenX: 0,
            screenY: 0,
            radiusX: 0,
            radiusY: 0,
            rotationAngle: 0,
            force: 1
          }] as any
        });

        // Override preventDefault to track if it was called
        const originalPreventDefault = touchEvent.preventDefault;
        touchEvent.preventDefault = function() {
          prevented = true;
          originalPreventDefault.call(this);
        };

        upBtn.dispatchEvent(touchEvent);
        return prevented;
      });

      expect(wasEventPrevented).toBe(true);
    });

    test('touchstart on down button starts spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        initval: 30
      });

      const downButton = page.locator('[data-testid="test-input-down"]');
      await apiHelpers.clearEventLog(page);

      // Dispatch touchstart event
      await downButton.dispatchEvent('touchstart', { touches: [{ clientX: 0, clientY: 0 }] });
      await apiHelpers.waitForTimeout(50);

      // Should decrement
      expect(await getNumericValue(page, 'test-input')).toBe(27); // 30 - 3

      // Should emit start events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startdownspin', 'touchspin')).toBe(true);

      // Clean up
      await downButton.dispatchEvent('touchend');
    });

    test('touchend stops spinning', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        stepinterval: 50
      });

      const upButton = page.locator('[data-testid="test-input-up"]');

      // Start touch spinning
      await upButton.dispatchEvent('touchstart', { touches: [{ clientX: 0, clientY: 0 }] });
      await apiHelpers.waitForTimeout(150);

      const valueBeforeStop = await getNumericValue(page, 'test-input');
      await apiHelpers.clearEventLog(page);

      // End touch
      await page.evaluate(() => {
        const touchEvent = new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(touchEvent);
      });
      await apiHelpers.waitForTimeout(50);

      // Should emit stop events
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.stopspin', 'touchspin')).toBe(true);

      // Should stop changing value
      await apiHelpers.waitForTimeout(100);
      expect(await getNumericValue(page, 'test-input')).toBe(valueBeforeStop);
    });
  });

  test.describe('Mouse/Touch Integration with Boundaries', () => {
    test('mouse spinning stops at max boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 2,
        initval: 1,
        stepinterval: 30
      });

      const upButton = page.locator('[data-testid="test-input-up"]');
      await apiHelpers.clearEventLog(page);

      // Start spinning up
      await upButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(200); // Let it hit boundary and potentially try to continue

      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue).toBe(2); // Should stop at max

      // Should emit max event
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.max', 'touchspin')).toBe(true);

      // Clean up
      await upButton.dispatchEvent('mouseup');
    });

    test('mouse spinning stops at min boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 10,
        initval: 1,
        stepinterval: 30
      });

      const downButton = page.locator('[data-testid="test-input-down"]');
      await apiHelpers.clearEventLog(page);

      // Start spinning down
      await downButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(200); // Let it hit boundary

      const finalValue = await getNumericValue(page, 'test-input');
      expect(finalValue).toBe(0); // Should stop at min

      // Should emit min event
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.min', 'touchspin')).toBe(true);

      // Clean up
      await downButton.dispatchEvent('mouseup');
    });
  });

  test.describe('Button Event Handler Edge Cases', () => {
    test('button handlers work with disabled renderer buttons', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      // Disable the input (not the buttons directly)
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });
      await apiHelpers.waitForTimeout(50);

      const upButton = page.locator('[data-testid="test-input-up"]');
      await apiHelpers.clearEventLog(page);

      // Try to click disabled input's button
      await upButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(50);

      // Value should not change when input is disabled
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      // No spin events should be emitted
      expect(await apiHelpers.hasEventInLog(page, 'touchspin.on.startspin', 'touchspin')).toBe(false);
    });

    test('multiple rapid button clicks are handled correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      const upButton = page.locator('[data-testid="test-input-up"]');

      // Rapid fire clicks
      await upButton.dispatchEvent('mousedown');
      await upButton.dispatchEvent('mouseup');
      await apiHelpers.waitForTimeout(10);

      await upButton.dispatchEvent('mousedown');
      await upButton.dispatchEvent('mouseup');
      await apiHelpers.waitForTimeout(10);

      await upButton.dispatchEvent('mousedown');
      await upButton.dispatchEvent('mouseup');
      await apiHelpers.waitForTimeout(50);

      // Should handle all clicks (at least 3 increments)
      expect(await getNumericValue(page, 'test-input')).toBeGreaterThanOrEqual(13);
    });

    test('button events work after DOM rebuild', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10,
        verticalbuttons: false
      });

      // First click should work
      const upButton1 = page.locator('[data-testid="test-input-up"]');
      await upButton1.dispatchEvent('mousedown');
      await upButton1.dispatchEvent('mouseup');
      await apiHelpers.waitForTimeout(50);
      expect(await getNumericValue(page, 'test-input')).toBe(11);

      // Change settings to trigger DOM rebuild
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.updateSettings({ verticalbuttons: true });
      });
      await apiHelpers.waitForTimeout(100);

      // Click should still work after DOM rebuild
      const upButton2 = page.locator('[data-testid="test-input-up"]');
      await upButton2.dispatchEvent('mousedown');
      await upButton2.dispatchEvent('mouseup');
      await apiHelpers.waitForTimeout(50);
      expect(await getNumericValue(page, 'test-input')).toBe(12);
    });

    test('global mouse events are properly cleaned up on destroy', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 10
      });

      const upButton = page.locator('[data-testid="test-input-up"]');

      // Start spinning
      await upButton.dispatchEvent('mousedown');
      await apiHelpers.waitForTimeout(50);

      // Destroy TouchSpin
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.destroy();
      });

      const valueAfterDestroy = await getNumericValue(page, 'test-input');

      // Global mouseup should not affect the destroyed instance
      await page.evaluate(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });
      await apiHelpers.waitForTimeout(50);

      // Value should remain the same (no spinning stopped)
      expect(await getNumericValue(page, 'test-input')).toBe(valueAfterDestroy);
    });
  });
});

// NOTE: This test file exercises the button mouse/touch event handlers (_handleUpMouseDown,
// _handleDownMouseDown, _handleMouseUp) covering mousedown, mouseup, touchstart, touchend,
// mouseleave events and their preventDefault behavior, continuous spinning, and boundary interactions.
