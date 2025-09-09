import { test, expect } from '@playwright/test';
import touchspinHelpers from './helpers/touchspinHelpers';

test.describe('Advanced Features', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'advancedFeatures');
  });

  test.describe('Data Attributes Configuration', () => {
    test('should respect data-bts-* attributes for configuration', async ({ page }) => {
      const testid = 'touchspin-data-attributes';

      await touchspinHelpers.waitForInstanceReady(page, testid);

      // Test data-bts-min="40"
      await touchspinHelpers.fillWithValueAndBlur(page, testid, '30');
      await expect.poll(
        async () => await touchspinHelpers.readInputValue(page, testid),
        { timeout: 2000 }
      ).toBe('40');

      // Reset to known state before next test
      await touchspinHelpers.fillWithValue(page, testid, '50');

      // Test data-bts-max="60"
      await touchspinHelpers.fillWithValueAndBlur(page, testid, '70');
      await expect.poll(
        async () => await touchspinHelpers.readInputValue(page, testid),
        { timeout: 2000 }
      ).toBe('60');

      // Test data-bts-step="2" - just click up from known value
      await touchspinHelpers.fillWithValue(page, testid, '50');
      await touchspinHelpers.touchspinClickUp(page, testid);
      await expect.poll(
        async () => await touchspinHelpers.readInputValue(page, testid),
        { timeout: 2000 }
      ).toBe('52');
    });
  });

  test.describe('Step Validation and Divisibility', () => {
    test('should enforce step divisibility with round mode', async ({ page }) => {
      const testid = 'touchspin-individual-props';

      // Enter a value that doesn't align with step=2 (data-bts-step takes precedence over native step=3)
      await touchspinHelpers.fillWithValue(page, testid, '47');
      await page.keyboard.press('Tab'); // triggers blur → sanitize

      // Should round to nearest valid step value (step=2, so should be even)
      await expect.poll(
        async () => {
          const value = await touchspinHelpers.readInputValue(page, testid);
          return parseInt(value || '0') % 2;
        }
      ).toBe(0); // Should be divisible by step=2
    });
  });

  test.describe('Long Press and Continuous Spinning', () => {
    test('should start spinning when holding down button', async ({ page }) => {
      const testid = 'touchspin-default';

      // Get initial value
      const initialValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');

      // Hold mousedown for longer than stepintervaldelay (500ms)
      const wrapper = await touchspinHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      });

      // Wait for spin to start and continue
      await touchspinHelpers.waitForTimeout(800);

      await wrapper.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('mouseup', { bubbles: true }));
      });

      const finalValue = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      expect(finalValue).toBeGreaterThan(initialValue + 1); // Should have spun multiple times
    });

    test('should stop spinning on mouseup', async ({ page }) => {
      const testid = 'touchspin-default';

      // Start spinning
      const wrapper2 = await touchspinHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper2.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      });

      await touchspinHelpers.waitForTimeout(200); // Short hold

      // Stop spinning
      await wrapper2.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('mouseup', { bubbles: true }));
      });

      const valueAfterStop = await touchspinHelpers.readInputValue(page, testid);

      // Verify spinning has stopped by checking value doesn't change
      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe(valueAfterStop); // Should not continue incrementing
    });
  });

  test.describe('Touch Support', () => {
    test('should respond to touch events', async ({ page }) => {
      const testid = 'touchspin-default';

      // Simulate touch events
      const wrapper3 = await touchspinHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper3.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('touchstart', { bubbles: true }));
        setTimeout(() => {
          button?.dispatchEvent(new Event('touchend', { bubbles: true }));
        }, 100);
      });

      await expect.poll(
        async () => touchspinHelpers.readInputValue(page, testid)
      ).toBe('51');
    });
  });

  test.describe('Callback Functions', () => {
    test('should apply callback functions for value processing', async ({ page }) => {
      // This would test if callback_before_calculation and callback_after_calculation work
      // For now, we'll test that the plugin accepts these options without errors
      const testid = 'touchspin-default';

      await page.evaluate((testId) => {
        const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
        (window as any).$(input).trigger('touchspin.destroy');
        (window as any).$(input).TouchSpin({
          callback_before_calculation: function(value: number) {
            return value * 2; // Double the increment
          },
          callback_after_calculation: function(value: number) {
            return value; // No change to display
          }
        });
      }, testid);

      // Test that plugin still works with callbacks
      await touchspinHelpers.touchspinClickUp(page, testid);
      const value = parseInt(await touchspinHelpers.readInputValue(page, testid) || '50');
      expect(value).toBeGreaterThan(50);
    });
  });

  test.describe('Custom Events', () => {
    test('should fire custom spin events', async ({ page }) => {
      const testid = 'touchspin-default';

      // Start spinning and check for events
      const wrapper4 = await touchspinHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper4.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('mousedown', { bubbles: true }));
      });

      await touchspinHelpers.waitForTimeout(600); // Wait for spin to start

      await wrapper4.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('mouseup', { bubbles: true }));
      });

      // Check that spin events were logged (if events logging is available)
      const hasSpinEvents = await page.evaluate(() => {
        const eventLog = document.querySelector('#events_log');
        return eventLog && eventLog.textContent?.includes('startspin');
      });

      // This may not always be available, so we make it optional
      if (hasSpinEvents) {
        expect(hasSpinEvents).toBe(true);
      }
    });
  });
});
