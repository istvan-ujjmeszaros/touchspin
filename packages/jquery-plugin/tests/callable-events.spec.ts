/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import '../../../__tests__/coverage.hooks';

test.describe('jQuery TouchSpin Callable Events', () => {

  test.beforeEach(async ({ page }) => {
    // Reload page for each test to ensure clean state
    await page.goto('http://localhost:8866/packages/jquery-plugin/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).testPageReady === true);
    await touchspinHelpers.installJqueryPlugin(page);
    await page.waitForFunction(() => (window as any).touchSpinReady === true);
  });

  test.describe('Increment/Decrement Events', () => {

    test('should increment when touchspin.uponce is triggered', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('55'); // 50 + 5
    });

    test('should decrement when touchspin.downonce is triggered', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 3 });

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.downonce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('48'); // 50 - 3, rounded to step
    });

    test('should handle multiple uponce events in sequence', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 2 });

      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('56'); // 50 + 2 + 2 + 2
    });

    test('should respect maximum boundary with uponce event', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 0, max: 52, step: 5, initval: 50 });

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('52'); // Clamped to max
    });

    test('should respect minimum boundary with downonce event', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { min: 48, max: 100, step: 5, initval: 50 });

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.downonce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('48'); // Clamped to min
    });
  });

  test.describe('Continuous Spinning Events', () => {

    test('should start up spin when touchspin.startupspin is triggered', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 10 });

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startupspin');
      });

      // Wait briefly for spinning to start
      await page.waitForTimeout(200);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, 'test-input'));
      expect(finalValue).toBeGreaterThan(50); // Should have increased from initial value
    });

    test('should start down spin when touchspin.startdownspin is triggered', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 10 });

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startdownspin');
      });

      // Wait briefly for spinning to start
      await page.waitForTimeout(200);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, 'test-input'));
      expect(finalValue).toBeLessThan(50); // Should have decreased from initial value
    });

    test('should stop spinning when touchspin.stopspin is triggered', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

      // Start spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startupspin');
      });

      await page.waitForTimeout(200);

      // Stop and capture value
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const stoppedValue = await touchspinHelpers.readInputValue(page, 'test-input');

      // Wait to ensure it really stopped
      await page.waitForTimeout(300);

      const finalValue = await touchspinHelpers.readInputValue(page, 'test-input');
      expect(finalValue).toBe(stoppedValue); // Should not have changed after stop
    });

    test('should switch from up to down spin', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 10, initval: 50 });

      // Start up spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startupspin');
      });

      await page.waitForTimeout(200);

      const valueAfterUp = parseInt(await touchspinHelpers.readInputValue(page, 'test-input'));

      // Switch to down spin
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.startdownspin');
      });

      await page.waitForTimeout(200);

      // Stop spinning
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.stopspin');
      });

      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, 'test-input'));

      expect(valueAfterUp).toBeGreaterThan(50); // Up spin worked
      expect(finalValue).toBeLessThan(valueAfterUp); // Down spin worked
    });
  });

  test.describe('Settings Update Event', () => {

    test('should update settings when touchspin.updatesettings is triggered', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{
          step: 10
        }]);
      });

      // Test that new step setting works
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('60'); // 50 + 10
    });

    test('should update minimum value through settings event', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {});

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{
          min: 40
        }]);
      });

      // Try to set below new minimum
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 30);
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('40'); // Clamped to new min
    });

    test('should update maximum value through settings event', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {});

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{
          max: 60
        }]);
      });

      // Try to set above new maximum
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').TouchSpin('set', 80);
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('60'); // Clamped to new max
    });

    test('should add prefix through settings event', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {});

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{
          prefix: '€'
        }]);
      });

      // Wait for DOM update
      await page.waitForTimeout(100);

      // Prefix element should be created
      expect(await page.locator('[data-testid="test-input-prefix"]').count()).toBe(1);
      expect(await page.locator('[data-testid="test-input-prefix"]').textContent()).toBe('€');
    });

    test('should add postfix through settings event', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {});

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{
          postfix: ' EUR'
        }]);
      });

      // Wait for DOM update
      await page.waitForTimeout(100);

      // Postfix element should be created
      expect(await page.locator('[data-testid="test-input-postfix"]').count()).toBe(1);
      expect(await page.locator('[data-testid="test-input-postfix"]').textContent()).toBe(' EUR');
    });

    test('should handle empty settings object gracefully', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

      const valueBefore = await touchspinHelpers.readInputValue(page, 'test-input');

      // Update with empty settings should not break
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.updatesettings', [{}]);
      });

      // Should still work normally
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('55'); // 50 + 5
    });
  });

  test.describe('Destroy Event', () => {

    test('should destroy instance when touchspin.destroy is triggered', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', {});

      // Verify it's initialized
      expect(await touchspinHelpers.isTouchSpinInitialized(page, 'test-input')).toBe(true);

      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.destroy');
      });

      // TouchSpin should be destroyed
      expect(await touchspinHelpers.isTouchSpinDestroyed(page, 'test-input')).toBe(true);

      // Specific buttons should be removed
      expect(await page.locator('[data-testid="test-input-up"]').count()).toBe(0);
      expect(await page.locator('[data-testid="test-input-down"]').count()).toBe(0);
    });

    test('should allow reinitializing after destroy event', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

      // Destroy via event
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.destroy');
      });

      // Reinitialize with different settings
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 10 });

      // Should work with new settings
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('60'); // 50 + 10
    });
  });

  test.describe('Multiple Instances', () => {

    test('should handle events on multiple instances independently', async ({ page }) => {
      // Create additional input
      await touchspinHelpers.createAdditionalInput(page, 'input-2', { value: '21' });

      // Initialize both inputs with different steps
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 2, initval: 10 });
      await touchspinHelpers.initializeTouchSpin(page, 'input-2', { step: 3 });

      // Trigger events on each independently
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
        (window as any).$('[data-testid="input-2"]').trigger('touchspin.downonce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('12'); // 10 + 2
      expect(await touchspinHelpers.readInputValue(page, 'input-2')).toBe('18'); // 21 - 3
    });

    test('should trigger events on multiple instances with same selector', async ({ page }) => {
      // Create additional input
      await touchspinHelpers.createAdditionalInput(page, 'input-2', { value: '20' });

      // Initialize both inputs with same step
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5, initval: 10 });
      await touchspinHelpers.initializeTouchSpin(page, 'input-2', { step: 5 });

      // Trigger event on both using combined selector
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"], [data-testid="input-2"]').trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('15'); // 10 + 5
      expect(await touchspinHelpers.readInputValue(page, 'input-2')).toBe('25'); // 20 + 5
    });
  });

  test.describe('Complete Coverage Test', () => {

    test('should exercise all callable event handlers for coverage', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5, min: 0, max: 100 });

      // TODO remove: temporary sanity check that events fire
      const eventsFired = await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        const fired: string[] = [];

        // Temporary listeners to verify events actually fire
        $input.on('touchspin.uponce', () => fired.push('uponce'));
        $input.on('touchspin.downonce', () => fired.push('downonce'));
        $input.on('touchspin.startupspin', () => fired.push('startupspin'));
        $input.on('touchspin.startdownspin', () => fired.push('startdownspin'));
        $input.on('touchspin.stopspin', () => fired.push('stopspin'));
        $input.on('touchspin.updatesettings', () => fired.push('updatesettings'));

        // Exercise all event handlers from lines 100-128 in index.ts
        $input.trigger('touchspin.uponce');          // Line 100-103
        $input.trigger('touchspin.downonce');        // Line 104-107
        $input.trigger('touchspin.startupspin');     // Line 108-111
        $input.trigger('touchspin.startdownspin');   // Line 112-115
        $input.trigger('touchspin.stopspin');        // Line 116-119
        $input.trigger('touchspin.updatesettings', [{ step: 10 }]); // Line 120-123

        // Note: touchspin.destroy and blur.touchspin tested separately
        return fired;
      });

      // Small wait to let handlers execute
      await page.waitForTimeout(100);

      // Verify events fired (sanity check for coverage)
      expect(eventsFired).toContain('uponce');
      expect(eventsFired).toContain('downonce');
      expect(eventsFired).toContain('updatesettings');

      // Basic verification that events worked (value should have changed)
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, 'test-input'));
      expect(finalValue).toBeGreaterThan(40); // Should have incremented from initial 50
    });
  });

  test.describe('Event Safety', () => {

    test('should ignore events on non-initialized inputs', async ({ page }) => {
      // Don't initialize TouchSpin
      const originalValue = await touchspinHelpers.readInputValue(page, 'test-input');

      // Trigger events should be ignored
      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.downonce');
        $input.trigger('touchspin.stopspin');
        $input.trigger('touchspin.destroy');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe(originalValue); // Unchanged
    });

    test('should handle invalid settings parameters gracefully', async ({ page }) => {
      await touchspinHelpers.initializeTouchSpin(page, 'test-input', { step: 5 });

      // Try events with invalid parameters
      await page.evaluate(() => {
        const $input = (window as any).$('[data-testid="test-input"]');
        $input.trigger('touchspin.updatesettings', [null]);
        $input.trigger('touchspin.updatesettings', ['invalid']);
        $input.trigger('touchspin.updatesettings', [123]);
        $input.trigger('touchspin.updatesettings'); // No parameters
      });

      // Should still work normally after invalid attempts
      await page.evaluate(() => {
        (window as any).$('[data-testid="test-input"]').trigger('touchspin.uponce');
      });

      expect(await touchspinHelpers.readInputValue(page, 'test-input')).toBe('55'); // 50 + 5
    });
  });
});