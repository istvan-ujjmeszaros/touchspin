/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';

test.describe('jQuery TouchSpin Callable Events', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    // Reload page for each test to ensure clean state
    await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).testPageReady === true);
    await touchspinHelpers.installJqueryPlugin(page);
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'jquery-callable-events');
  });

  test.describe('Increment/Decrement Events', () => {

    test('should respond to touchspin.uponce event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 5 });

      const initialValue = await touchspinHelpers.readInputValue(page, 'test-input');

      // Trigger uponce event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      const newValue = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(parseInt(newValue)).toBe(parseInt(initialValue) + 5);
    });

    test('should respond to touchspin.downonce event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 3 });

      const initialValue = await touchspinHelpers.readInputValue(page, 'test-input');

      // Trigger downonce event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.downonce');
      });

      const newValue = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(parseInt(newValue)).toBe(parseInt(initialValue) - 3);
    });

    test('should handle multiple uponce events', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 2 });

      // Trigger multiple uponce events
      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
      });

      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('56'); // 50 + 2 + 2 + 2
    });

    test('should respect boundaries with callable events', async ({ page }) => {
      // Initialize with value near max
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 52, step: 5, initval: 50 });

      // Try to increment beyond max
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('52'); // Should be clamped to max
    });
  });

  test.describe('Continuous Spinning Events', () => {

    test('should respond to touchspin.startupspin event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 200, step: 10 });

      const initialValue = await touchspinHelpers.readInputValue(page, 'test-input');

      // Trigger startupspin event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startupspin');
      });

      // Wait for spinning
      await touchspinHelpers.waitForTimeout(touchspinHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const finalValue = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(parseInt(finalValue)).toBeGreaterThan(parseInt(initialValue));
    });

    test('should respond to touchspin.startdownspin event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 200, step: 10 });

      const initialValue = await touchspinHelpers.readInputValue(page, 'test-input');

      // Trigger startdownspin event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startdownspin');
      });

      // Wait for spinning
      await touchspinHelpers.waitForTimeout(touchspinHelpers.TOUCHSPIN_EVENT_WAIT);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const finalValue = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(parseInt(finalValue)).toBeLessThan(parseInt(initialValue));
    });

    test('should respond to touchspin.stopspin event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 200, step: 5 });

      // Start spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startupspin');
      });

      // Wait briefly
      await touchspinHelpers.waitForTimeout(300);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const valueAfterStop = await touchspinHelpers.readInputValue(page, 'test-input');

      // Wait to ensure it really stopped
      await touchspinHelpers.waitForTimeout(500);

      const valueAfterWait = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(valueAfterWait).toBe(valueAfterStop); // Should not have changed
    });

    test('should handle switching between up and down spin', async ({ page }) => {
      // Initialize TouchSpin on the default test input with initial value
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {
        min: 0,
        max: 200,
        step: 10,
        initval: 50
      });

      const initialValue = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(initialValue).toBe('50');

      // Start up spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startupspin');
      });

      await touchspinHelpers.waitForTimeout(400);

      // Get value after up spin (should be higher than initial)
      const valueAfterUp = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(parseInt(valueAfterUp)).toBeGreaterThan(parseInt(initialValue));

      // Switch to down spin (should stop up and start down)
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startdownspin');
      });

      await touchspinHelpers.waitForTimeout(400);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const finalValue = await touchspinHelpers.readInputValue(page, 'test-input');
      // Final value should be less than after up spin but could be equal or greater than initial
      expect(parseInt(finalValue)).toBeLessThan(parseInt(valueAfterUp));
    });
  });

  test.describe('Update Settings Event', () => {

    test('should respond to touchspin.updatesettings event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 5 });

      // Update settings via event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{
          min: -50,
          max: 50,
          step: 10
        }]);
      });

      // Test new min
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', -30);
      });

      let value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('-30');

      // Test new step
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 0);
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('10'); // Step is now 10
    });

    test('should update prefix and postfix via event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 1000 });

      // Update prefix/postfix via event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{
          prefix: '€',
          postfix: ' EUR'
        }]);
      });

      // Wait for DOM update
      await page.waitForTimeout(100);

      // Check prefix using helper
      const hasPrefixResult = await touchspinHelpers.hasPrefix(page, 'test-input', '€');
      expect(hasPrefixResult).toBe(true);

      // Check postfix using helper
      const hasPostfixResult = await touchspinHelpers.hasPostfix(page, 'test-input', ' EUR');
      expect(hasPostfixResult).toBe(true);
    });

    test('should handle empty settings object', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 5 });

      const valueBefore = await touchspinHelpers.readInputValue(page, 'test-input');

      // Update with empty settings (should not break)
      const noError = await page.evaluate(() => {
        try {
          (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{}]);
          return true;
        } catch {
          return false;
        }
      });

      expect(noError).toBe(true);

      const valueAfter = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(valueAfter).toBe(valueBefore); // Value should not change
    });
  });

  test.describe('Destroy Event', () => {

    test('should respond to touchspin.destroy event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Verify it's initialized
      let hasWrapper = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]');
        return input?.closest('[data-touchspin-injected]') !== null;
      });

      expect(hasWrapper).toBe(true);

      // Trigger destroy event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.destroy');
      });

      // Verify it's destroyed
      hasWrapper = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]');
        return input?.closest('[data-touchspin-injected]') !== null;
      });

      expect(hasWrapper).toBe(false);
    });

    test('should allow reinitializing after destroy via event', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 5 });

      // Destroy via event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.destroy');
      });

      // Reinitialize with different settings
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: -50, max: 50, step: 10 });

      // Test that new settings work
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', -20);
      });

      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('-20');
    });
  });

  test.describe('Combined Events', () => {

    test('should handle multiple events in sequence', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 2, initval: 60 });

      // Chain multiple events
      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');

        // Update settings
        $input.trigger('touchspin.updatesettings', [{ step: 5 }]);

        // Increment twice
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');

        // Then decrement once
        $input.trigger('touchspin.downonce');
      });

      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('65'); // 60 + 5 + 5 - 5
    });

    test('should handle rapid event triggering', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 1, initval: 60 });

      // Rapidly trigger events
      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        for (let i = 0; i < 10; i++) {
          $input.trigger('touchspin.uponce');
        }
      });

      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('70'); // 60 + 10
    });
  });

  test.describe('Multiple Instances', () => {

    test('should handle events on multiple instances independently', async ({ page }) => {
      // Create additional input with value that's divisible by step
      await touchspinHelpers.createAdditionalInput(page, 'input-2', { value: '21' });

      // Initialize both inputs
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 2, initval: 10 });
      await touchspinHelpers.initializeTouchSpin(page, 'input-2', { min: 0, max: 100, step: 3 });

      // Note: input-2 value of 21 is already divisible by step 3, so no correction needed

      // Trigger events on first input
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      // Trigger events on second input
      await page.evaluate(() => {
        (window as any).$('[data-testid="input-2"]').trigger('touchspin.downonce');
      });

      const value1 = await touchspinHelpers.readInputValue(page, 'test-input');
      const value2 = await touchspinHelpers.readInputValue(page, 'input-2');

      expect(value1).toBe('12'); // 10 + 2
      expect(value2).toBe('18'); // 21 - 3
    });

    test('should handle same event on multiple instances', async ({ page }) => {
      // Create additional input
      await touchspinHelpers.createAdditionalInput(page, 'input-2', { value: '20' });

      // Initialize both inputs
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100, step: 5, initval: 10 });
      await touchspinHelpers.initializeTouchSpin(page, 'input-2', { min: 0, max: 100, step: 5 });

      // Trigger same event on both using jQuery selector
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"], [data-testid="input-2"]').trigger('touchspin.uponce');
      });

      const value1 = await touchspinHelpers.readInputValue(page, 'test-input');
      const value2 = await touchspinHelpers.readInputValue(page, 'input-2');

      expect(value1).toBe('15'); // 10 + 5
      expect(value2).toBe('25'); // 20 + 5
    });
  });

  test.describe('Event Safety', () => {

    test('should safely ignore events on non-initialized inputs', async ({ page }) => {
      // Don't initialize TouchSpin

      // Try to trigger events (should not throw)
      const noError = await page.evaluate(() => {
        try {
          const $input = (window as any).$('[data-testid="test-input"]');
          $input.trigger('touchspin.uponce');
          $input.trigger('touchspin.downonce');
          $input.trigger('touchspin.stopspin');
          $input.trigger('touchspin.destroy');
          return true;
        } catch {
          return false;
        }
      });

      expect(noError).toBe(true);

      // Value should remain unchanged
      const value = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(value).toBe('50'); // Default test input value
    });

    test('should handle events with invalid parameters gracefully', async ({ page }) => {
      // Initialize TouchSpin on the default test input
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 100 });

      // Try events with invalid parameters
      const noError = await page.evaluate(() => {
        try {
          const $input = (window as any).$('[data-testid="test-input"]');

          // updatesettings with invalid types
          $input.trigger('touchspin.updatesettings', [null]);
          $input.trigger('touchspin.updatesettings', ['string']);
          $input.trigger('touchspin.updatesettings', [123]);
          $input.trigger('touchspin.updatesettings'); // No parameters

          return true;
        } catch {
          return false;
        }
      });

      expect(noError).toBe(true);
    });
  });
});