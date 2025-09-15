/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';

test.describe('jQuery TouchSpin Callable Events', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
    await touchspinHelpers.installJqueryPlugin(page);
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'jquery-callable-events');
  });

  test.describe('Increment/Decrement Events', () => {

    test('should respond to touchspin.uponce event', async ({ page }) => {
      const testId = 'call-1';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, testId);

      const initialValue = await touchspinHelpers.readInputValue(page, testId);

      // Trigger uponce event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.uponce');
      }, testId);

      const newValue = await touchspinHelpers.readInputValue(page, testId);
      expect(parseInt(newValue)).toBe(parseInt(initialValue) + 5);
    });

    test('should respond to touchspin.downonce event', async ({ page }) => {
      const testId = 'call-2';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 3 });
      }, testId);

      const initialValue = await touchspinHelpers.readInputValue(page, testId);

      // Trigger downonce event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.downonce');
      }, testId);

      const newValue = await touchspinHelpers.readInputValue(page, testId);
      expect(parseInt(newValue)).toBe(parseInt(initialValue) - 3);
    });

    test('should handle multiple uponce events', async ({ page }) => {
      const testId = 'call-3';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 2 });
      }, testId);

      // Trigger multiple uponce events
      await page.evaluate((id) => {
        const $input = (window as any).$(`#${id}`);
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('56'); // 50 + 2 + 2 + 2
    });

    test('should respect boundaries with callable events', async ({ page }) => {
      const testId = 'call-4';

      // Initialize with value near max
      await page.evaluate((id) => {
        (window as any).$(`#${id}`)
          .TouchSpin({ min: 0, max: 52, step: 5 })
          .TouchSpin('set', 50);
      }, testId);

      // Try to increment beyond max
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.uponce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('52'); // Should be clamped to max
    });
  });

  test.describe('Continuous Spinning Events', () => {

    test('should respond to touchspin.startupspin event', async ({ page }) => {
      const testId = 'call-5';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 200, step: 10 });
      }, testId);

      const initialValue = await touchspinHelpers.readInputValue(page, testId);

      // Trigger startupspin event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.startupspin');
      }, testId);

      // Wait for spinning
      await touchspinHelpers.waitForTimeout(touchspinHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.stopspin');
      }, testId);

      const finalValue = await touchspinHelpers.readInputValue(page, testId);
      expect(parseInt(finalValue)).toBeGreaterThan(parseInt(initialValue));
    });

    test('should respond to touchspin.startdownspin event', async ({ page }) => {
      const testId = 'call-6';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 200, step: 10 });
      }, testId);

      const initialValue = await touchspinHelpers.readInputValue(page, testId);

      // Trigger startdownspin event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.startdownspin');
      }, testId);

      // Wait for spinning
      await touchspinHelpers.waitForTimeout(touchspinHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.stopspin');
      }, testId);

      const finalValue = await touchspinHelpers.readInputValue(page, testId);
      expect(parseInt(finalValue)).toBeLessThan(parseInt(initialValue));
    });

    test('should respond to touchspin.stopspin event', async ({ page }) => {
      const testId = 'call-7';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 200, step: 5 });
      }, testId);

      // Start spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.startupspin');
      }, testId);

      // Wait briefly
      await touchspinHelpers.waitForTimeout(300);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.stopspin');
      }, testId);

      const valueAfterStop = await touchspinHelpers.readInputValue(page, testId);

      // Wait to ensure it really stopped
      await touchspinHelpers.waitForTimeout(500);

      const valueAfterWait = await touchspinHelpers.readInputValue(page, testId);
      expect(valueAfterWait).toBe(valueAfterStop); // Should not have changed
    });

    test('should handle switching between up and down spin', async ({ page }) => {
      const testId = 'call-8';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 200, step: 10 });
      }, testId);

      // Start up spin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.startupspin');
      }, testId);

      await touchspinHelpers.waitForTimeout(400);

      // Switch to down spin (should stop up and start down)
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.startdownspin');
      }, testId);

      const valueBefore = await touchspinHelpers.readInputValue(page, testId);

      await touchspinHelpers.waitForTimeout(400);

      // Stop spinning
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.stopspin');
      }, testId);

      const valueAfter = await touchspinHelpers.readInputValue(page, testId);
      expect(parseInt(valueAfter)).toBeLessThan(parseInt(valueBefore));
    });
  });

  test.describe('Update Settings Event', () => {

    test('should respond to touchspin.updatesettings event', async ({ page }) => {
      const testId = 'call-9';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, testId);

      // Update settings via event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.updatesettings', [{
          min: -50,
          max: 50,
          step: 10
        }]);
      }, testId);

      // Test new min
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', -30);
      }, testId);

      let value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('-30');

      // Test new step
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', 0);
        (window as any).$(`#${id}`).trigger('touchspin.uponce');
      }, testId);

      value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('10'); // Step is now 10
    });

    test('should update prefix and postfix via event', async ({ page }) => {
      const testId = 'call-10';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 1000 });
      }, testId);

      // Update prefix/postfix via event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.updatesettings', [{
          prefix: '€',
          postfix: ' EUR'
        }]);
      }, testId);

      // Check prefix
      const hasPrefix = await page.evaluate((id) => {
        const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
        return wrapper?.querySelector('.bootstrap-touchspin-prefix')?.textContent === '€';
      }, testId);

      expect(hasPrefix).toBe(true);

      // Check postfix
      const hasPostfix = await page.evaluate((id) => {
        const wrapper = document.querySelector(`#${id}`).closest('[data-touchspin-injected]');
        return wrapper?.querySelector('.bootstrap-touchspin-postfix')?.textContent === ' EUR';
      }, testId);

      expect(hasPostfix).toBe(true);
    });

    test('should handle empty settings object', async ({ page }) => {
      const testId = 'call-11';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, testId);

      const valueBefore = await touchspinHelpers.readInputValue(page, testId);

      // Update with empty settings (should not break)
      const noError = await page.evaluate((id) => {
        try {
          (window as any).$(`#${id}`).trigger('touchspin.updatesettings', [{}]);
          return true;
        } catch {
          return false;
        }
      }, testId);

      expect(noError).toBe(true);

      const valueAfter = await touchspinHelpers.readInputValue(page, testId);
      expect(valueAfter).toBe(valueBefore); // Value should not change
    });
  });

  test.describe('Destroy Event', () => {

    test('should respond to touchspin.destroy event', async ({ page }) => {
      const testId = 'call-12';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Verify it's initialized
      let hasWrapper = await page.evaluate((id) => {
        const input = document.querySelector(`#${id}`);
        return input?.closest('[data-touchspin-injected]') !== null;
      }, testId);

      expect(hasWrapper).toBe(true);

      // Trigger destroy event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.destroy');
      }, testId);

      // Verify it's destroyed
      hasWrapper = await page.evaluate((id) => {
        const input = document.querySelector(`#${id}`);
        return input?.closest('[data-touchspin-injected]') !== null;
      }, testId);

      expect(hasWrapper).toBe(false);
    });

    test('should allow reinitializing after destroy via event', async ({ page }) => {
      const testId = 'call-13';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, testId);

      // Destroy via event
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.destroy');
      }, testId);

      // Reinitialize with different settings
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: -50, max: 50, step: 10 });
      }, testId);

      // Test that new settings work
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin('set', -20);
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('-20');
    });
  });

  test.describe('Combined Events', () => {

    test('should handle multiple events in sequence', async ({ page }) => {
      const testId = 'call-14';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 2 });
      }, testId);

      // Chain multiple events
      await page.evaluate((id) => {
        const $input = (window as any).$(`#${id}`);

        // Update settings
        $input.trigger('touchspin.updatesettings', [{ step: 5 }]);

        // Increment twice
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');

        // Then decrement once
        $input.trigger('touchspin.downonce');
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('65'); // 60 + 5 + 5 - 5
    });

    test('should handle rapid event triggering', async ({ page }) => {
      const testId = 'call-15';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100, step: 1 });
      }, testId);

      // Rapidly trigger events
      await page.evaluate((id) => {
        const $input = (window as any).$(`#${id}`);
        for (let i = 0; i < 10; i++) {
          $input.trigger('touchspin.uponce');
        }
      }, testId);

      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('70'); // 60 + 10
    });
  });

  test.describe('Multiple Instances', () => {

    test('should handle events on multiple instances independently', async ({ page }) => {
      const testId1 = 'call-16a';
      const testId2 = 'call-16b';

      // Initialize both inputs
      await page.evaluate(({ id1, id2 }) => {
        (window as any).$(`#${id1}`).TouchSpin({ min: 0, max: 100, step: 2 });
        (window as any).$(`#${id2}`).TouchSpin({ min: 0, max: 100, step: 3 });
      }, { id1: testId1, id2: testId2 });

      // Trigger events on first input
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.uponce');
      }, testId1);

      // Trigger events on second input
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).trigger('touchspin.downonce');
      }, testId2);

      const value1 = await touchspinHelpers.readInputValue(page, testId1);
      const value2 = await touchspinHelpers.readInputValue(page, testId2);

      expect(value1).toBe('12'); // 10 + 2
      expect(value2).toBe('17'); // 20 - 3
    });

    test('should handle same event on multiple instances', async ({ page }) => {
      const testId1 = 'call-17a';
      const testId2 = 'call-17b';

      // Initialize both inputs
      await page.evaluate(({ id1, id2 }) => {
        (window as any).$(`#${id1}`).TouchSpin({ min: 0, max: 100, step: 5 });
        (window as any).$(`#${id2}`).TouchSpin({ min: 0, max: 100, step: 5 });
      }, { id1: testId1, id2: testId2 });

      // Trigger same event on both using jQuery selector
      await page.evaluate(({ id1, id2 }) => {
        (window as any).$(`#${id1}, #${id2}`).trigger('touchspin.uponce');
      }, { id1: testId1, id2: testId2 });

      const value1 = await touchspinHelpers.readInputValue(page, testId1);
      const value2 = await touchspinHelpers.readInputValue(page, testId2);

      expect(value1).toBe('15'); // 10 + 5
      expect(value2).toBe('25'); // 20 + 5
    });
  });

  test.describe('Event Safety', () => {

    test('should safely ignore events on non-initialized inputs', async ({ page }) => {
      const testId = 'call-18';

      // Don't initialize TouchSpin

      // Try to trigger events (should not throw)
      const noError = await page.evaluate((id) => {
        try {
          const $input = (window as any).$(`#${id}`);
          $input.trigger('touchspin.uponce');
          $input.trigger('touchspin.downonce');
          $input.trigger('touchspin.stopspin');
          $input.trigger('touchspin.destroy');
          return true;
        } catch {
          return false;
        }
      }, testId);

      expect(noError).toBe(true);

      // Value should remain unchanged
      const value = await touchspinHelpers.readInputValue(page, testId);
      expect(value).toBe('30');
    });

    test('should handle events with invalid parameters gracefully', async ({ page }) => {
      const testId = 'call-19';

      // Initialize TouchSpin
      await page.evaluate((id) => {
        (window as any).$(`#${id}`).TouchSpin({ min: 0, max: 100 });
      }, testId);

      // Try events with invalid parameters
      const noError = await page.evaluate((id) => {
        try {
          const $input = (window as any).$(`#${id}`);

          // updatesettings with invalid types
          $input.trigger('touchspin.updatesettings', [null]);
          $input.trigger('touchspin.updatesettings', ['string']);
          $input.trigger('touchspin.updatesettings', [123]);
          $input.trigger('touchspin.updatesettings'); // No parameters

          return true;
        } catch {
          return false;
        }
      }, testId);

      expect(noError).toBe(true);
    });
  });
});