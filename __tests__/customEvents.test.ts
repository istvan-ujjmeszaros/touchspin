import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Custom TouchSpin Events Tests', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'customEvents');
  });

  test.describe('Programmatic Event Triggers', () => {
    test('should handle touchspin.uponce event', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Trigger the uponce event programmatically
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.uponce');
      }, testid);

      // Should increment by one step
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe((initialValue + 1).toString());
    });

    test('should handle touchspin.downonce event', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Trigger the downonce event programmatically
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.downonce');
      }, testid);

      // Should decrement by one step
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe((initialValue - 1).toString());
    });

    test('should handle touchspin.startupspin event', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Trigger the startupspin event programmatically
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.startupspin');
      }, testid);

      // Wait longer for spinning to occur (spinning has delays before starting)
      await touchspinHelpers.waitForTimeout(800);

      // Should have incremented at least once due to spinning
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      expect(finalValue).toBeGreaterThanOrEqual(initialValue + 1);

      // Stop the spinning
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.stopspin');
      }, testid);

      await touchspinHelpers.waitForTimeout(100);
    });

    test('should handle touchspin.startdownspin event', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Trigger the startdownspin event programmatically
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.startdownspin');
      }, testid);

      // Wait longer for spinning to occur (spinning has delays before starting)
      await touchspinHelpers.waitForTimeout(800);

      // Should have decremented at least once due to spinning
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      expect(finalValue).toBeLessThanOrEqual(initialValue - 1);

      // Stop the spinning
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.stopspin');
      }, testid);

      await touchspinHelpers.waitForTimeout(100);
    });

    test('should handle touchspin.stopspin event', async ({ page }) => {
      const testid = 'touchspin-default';

      // Start spinning first
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.startupspin');
      }, testid);

      await touchspinHelpers.waitForTimeout(100);

      // Get value after spinning starts
      const valueAfterStart = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Stop spinning
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.stopspin');
      }, testid);

      await touchspinHelpers.waitForTimeout(200);

      // Value should not change further after stop
      const valueAfterStop = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      
      // Wait a bit more to ensure spinning really stopped
      await touchspinHelpers.waitForTimeout(300);
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      
      // Final value should equal the value when we stopped (no further changes)
      expect(finalValue).toBe(valueAfterStop);
    });

    test('should handle multiple uponce events in sequence', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Trigger multiple uponce events
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.uponce');
      }, testid);

      // Should increment by 3 steps
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe((initialValue + 3).toString());
    });

    test('should handle multiple downonce events in sequence', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Trigger multiple downonce events
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.downonce');
        $input.trigger('touchspin.downonce');
        $input.trigger('touchspin.downonce');
      }, testid);

      // Should decrement by 3 steps
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe((initialValue - 3).toString());
    });

    test('should handle spin direction changes', async ({ page }) => {
      const testid = 'touchspin-default';

      // Test that we can trigger different spin directions
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        
        // Start up spin then immediately change to down spin
        $input.trigger('touchspin.startupspin');
        $input.trigger('touchspin.startdownspin');
        
        // Stop after a moment
        setTimeout(() => {
          $input.trigger('touchspin.stopspin');
        }, 100);
      }, testid);

      await touchspinHelpers.waitForTimeout(500);

      // Just verify no errors occurred and input is still functional
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.uponce');
      }, testid);

      await touchspinHelpers.waitForTimeout(100);

      // Should still work normally after spin direction changes
      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      expect(finalValue).toBeGreaterThanOrEqual(50);
    });

    test('should handle events on input with step constraints', async ({ page }) => {
      const testid = 'touchspin-step10-min';

      // This input has step=10 and min=0
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.uponce');
      }, testid);

      // Should increment by step amount (10)
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe('10');

      // Test downonce to go back to min
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.downonce');
      }, testid);

      // Should be back at minimum (0)
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe('0');
    });

    test('should handle events on disabled input gracefully', async ({ page }) => {
      const testid = 'touchspin-disabled';
      const initialValue = await touchspinHelpers.readInputValue(page, testid);

      // Try to trigger events on disabled input
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.downonce');
        $input.trigger('touchspin.startupspin');
      }, testid);

      // Value should remain unchanged for disabled input
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe(initialValue);

      // Stop any potential spinning
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        $input.trigger('touchspin.stopspin');
      }, testid);
    });

    test('should handle rapid event triggering', async ({ page }) => {
      const testid = 'touchspin-default';
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Rapidly trigger mixed events
      await page.evaluate((testId) => {
        const $ = (window as any).jQuery;
        const $input = $(`[data-testid="${testId}"]`);
        
        // Rapid sequence of different events
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.stopspin');
        $input.trigger('touchspin.downonce');
        $input.trigger('touchspin.uponce');
        $input.trigger('touchspin.startupspin');
        $input.trigger('touchspin.stopspin');
        $input.trigger('touchspin.downonce');
      }, testid);

      // Should handle rapid events without errors
      // Net effect should be: +1 -1 +1 -1 = 0, so should equal initial
      await expect.poll(
        async () => parseInt(await touchspinHelpers.readInputValue(page, testid) || '50')
      ).toBe(initialValue);
    });
  });
});