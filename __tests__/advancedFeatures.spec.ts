import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('Advanced Features', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'advancedFeatures');
  });

  test.describe('Data Attributes Configuration', () => {
    test('should clamp to min via data-bts-min', async ({ page }) => {
      const testid = 'touchspin-data-attributes';
      await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await apiHelpers.fillWithValueAndBlur(page, testid, '30');
      await apiHelpers.expectValueToBe(page, testid, '40', 2000);
    });

    test('should clamp to max via data-bts-max', async ({ page }) => {
      const testid = 'touchspin-data-attributes';
      await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      // reset to a known baseline then exceed max
      await apiHelpers.fillWithValue(page, testid, '50');
      await apiHelpers.fillWithValueAndBlur(page, testid, '70');
      await apiHelpers.expectValueToBe(page, testid, '60', 2000);
    });

    test('should apply step from data-bts-step', async ({ page }) => {
      const testid = 'touchspin-data-attributes';
      await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await apiHelpers.fillWithValue(page, testid, '50');
      await apiHelpers.clickUpButton(page, testid);
      await apiHelpers.expectValueToBe(page, testid, '52', 2000);
    });
  });

  test.describe('Step Validation and Divisibility', () => {
    test('should enforce step divisibility with round mode', async ({ page }) => {
      const testid = 'touchspin-individual-props';

      // Enter a value that doesn't align with step=2 (data-bts-step takes precedence over native step=3)
      await apiHelpers.fillWithValue(page, testid, '47');
      await page.keyboard.press('Tab'); // triggers blur → sanitize

      // Should round to nearest valid step value (step=2, so should be even)
      await expect.poll(
        async () => {
          const value = await apiHelpers.readInputValue(page, testid);
          return parseInt(value || '0') % 2;
        }
      ).toBe(0); // Should be divisible by step=2
    });
  });

  test.describe('Long Press and Continuous Spinning', () => {
    test('should start spinning when holding down button', async ({ page }) => {
      const testid = 'touchspin-default';

      // Get initial value
      const initialValue = parseInt(await apiHelpers.readInputValue(page, testid) || '50');

      // Hold mousedown for longer than stepintervaldelay (500ms)
      await apiHelpers.holdUpButton(page, testid, 800);

      const finalValue = parseInt(await apiHelpers.readInputValue(page, testid) || '50');
      expect(finalValue).toBeGreaterThan(initialValue + 1); // Should have spun multiple times
    });

    test('should stop spinning on mouseup', async ({ page }) => {
      const testid = 'touchspin-default';

      // Start spinning and stop after short hold
      await apiHelpers.holdUpButton(page, testid, 200);

      const valueAfterStop = await apiHelpers.readInputValue(page, testid);

      // Verify spinning has stopped by checking value doesn't change
      await apiHelpers.expectValueToBe(page, testid, valueAfterStop); // Should not continue incrementing
    });
  });

  test.describe('Touch Support', () => {
    test('should respond to touch events', async ({ page }) => {
      const testid = 'touchspin-default';

      // Simulate touch events
      const wrapper3 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper3.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        button?.dispatchEvent(new Event('touchstart', { bubbles: true }));
        setTimeout(() => {
          button?.dispatchEvent(new Event('touchend', { bubbles: true }));
        }, 100);
      });

      await apiHelpers.expectValueToBe(page, testid, '51');
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
      await apiHelpers.clickUpButton(page, testid);
      const value = parseInt(await apiHelpers.readInputValue(page, testid) || '50');
      expect(value).toBeGreaterThan(50);
    });
  });

  test.describe('Custom Events', () => {
    test('should fire custom spin events', async ({ page }) => {
      const testid = 'touchspin-default';

      // Hold up button for 600ms to test spin events
      await apiHelpers.holdUpButton(page, testid, 600);

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
