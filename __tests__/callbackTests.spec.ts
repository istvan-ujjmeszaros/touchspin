import { test, expect } from '@playwright/test';
import * as apiHelpers from './helpers/touchspinApiHelpers';
import './coverage.hooks';

test.describe('TouchSpin Callback Tests', () => {

  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('/__tests__/html/index-bs4.html');

    // Clear events log before each test
    await page.evaluate(() => {
      const eventsLog = document.getElementById('events_log');
      if (eventsLog) eventsLog.textContent = '';
    });
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'callbackTests');
  });

  test.describe('Currency Callback Tests (testinput_callbacks)', () => {
    const testid = 'touchspin-callbacks'; // First touchspin-callbacks element

    test('should apply initial currency formatting callback on load', async ({ page }) => {
      // The initial value should be formatted as currency
      const value = await apiHelpers.readInputValue(page, testid);
      expect(value).toBe('$5,000.00');
    });

    test('should apply callbacks when clicking up button', async ({ page }) => {
      const initialValue = await apiHelpers.readInputValue(page, testid);
      expect(initialValue).toBe('$5,000.00');

      // Click up button
      await apiHelpers.clickUpButton(page, testid);

      // Should increment by step (0.1) and format as currency
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$5,000.10');
    });

    test('should apply callbacks when clicking down button', async ({ page }) => {
      const initialValue = await apiHelpers.readInputValue(page, testid);
      expect(initialValue).toBe('$5,000.00');

      // Click down button
      await apiHelpers.clickDownButton(page, testid);

      // Should decrement by step (0.1) and format as currency
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$4,999.90');
    });

    test('should apply callbacks on value update via blur/navigation', async ({ page }) => {
      // Fill with a raw numeric value (will be rounded to nearest 0.1)
      await apiHelpers.fillWithValue(page, testid, '2500.75');

      // Navigate away to trigger blur
      await page.keyboard.press('Tab');

      // Value should be rounded to nearest step (0.1) and formatted as currency
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$2,500.80'); // 2500.75 rounds to 2500.8 with step=0.1

      // Should fire change event with the decorated value
      expect(await apiHelpers.countChangeWithValue(page, '$2,500.80')).toBe(1);
    });

    test('should handle spinning up to max value with callbacks', async ({ page }) => {
      // Set value close to max (5500) to test max boundary
      await apiHelpers.fillWithValue(page, testid, '5499.9');
      await page.keyboard.press('Tab');

      // Verify it formatted correctly
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$5,499.90');

      // Start spinning up (hold down for enough time to reach max)
      const wrapper = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        if (button) {
          button.dispatchEvent(new Event('mousedown', { bubbles: true }));
        }
      });

      // Hold for enough time to reach max value (step is 0.1, so need at least 1 increment)
      await apiHelpers.waitForTimeout(800);

      // Stop spinning
      await wrapper.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        if (button) {
          button.dispatchEvent(new Event('mouseup', { bubbles: true }));
        }
      });

      // Should reach max value and be properly formatted
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$5,500.00');

      // Check that max event fired
      const elementId = await apiHelpers.getElementIdFromTestId(page, testid);
      expect(await apiHelpers.countEvent(page, elementId, 'touchspin.on.max')).toBeGreaterThanOrEqual(1);
    });

    test('should handle spinning down to min value with callbacks', async ({ page }) => {
      // Set value close to min to test boundary
      await apiHelpers.fillWithValue(page, testid, '1.0');
      await page.keyboard.press('Tab');

      // Verify it formatted correctly
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$1.00');

      // Use arrow keys to spin down to minimum (10 decrements of 0.1 each)
      for (let i = 0; i < 10; i++) {
        await apiHelpers.pressDownArrowKeyOnInput(page, testid);
      }

      // Should reach min value (0) and be properly formatted
      const finalValue = await apiHelpers.readInputValue(page, testid);
      expect(finalValue).toBe('$0.00');

      // Check that min event fired
      const elementId = await apiHelpers.getElementIdFromTestId(page, testid);
      expect(await apiHelpers.countEvent(page, elementId, 'touchspin.on.min')).toBeGreaterThanOrEqual(1);
    });

    test('should handle invalid input with callbacks gracefully', async ({ page }) => {
      // Try entering invalid characters that should be stripped by before_calculation
      await apiHelpers.fillWithValue(page, testid, '$1,500.37 extra text');

      // Navigate away to trigger callbacks
      await page.keyboard.press('Tab');

      // Should strip invalid characters, round to step=0.1, and format properly
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$1,500.40'); // 1500.37 rounds to 1500.4 with step=0.1
    });
  });

  test.describe('Numeral.js Callback Tests (input_callbacks)', () => {
    const testid = 'touchspin-callbacks-numeral'; // Now using the unique test ID

    test('should apply numeral.js callbacks on initial load', async ({ page }) => {
      // The numeral.js callbacks element uses initval '$5,000.00'
      const value = await apiHelpers.readInputValue(page, testid);
      expect(value).toBe('$5,000.00');
    });

    test('should apply numeral.js callbacks when clicking up button', async ({ page }) => {
      const initialValue = await apiHelpers.readInputValue(page, testid);
      expect(initialValue).toBe('$5,000.00');

      // Click up button
      await apiHelpers.clickUpButton(page, testid);

      // Should increment by step (0.1) and format with numeral.js
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$5,000.10');
    });

    test('should apply numeral.js callbacks when clicking down button', async ({ page }) => {
      const initialValue = await apiHelpers.readInputValue(page, testid);
      expect(initialValue).toBe('$5,000.00');

      // Click down button
      await apiHelpers.clickDownButton(page, testid);

      // Should decrement by step (0.1) and format with numeral.js
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$4,999.90');
    });

    test('should handle manual entry with numeral.js callbacks', async ({ page }) => {
      // Fill with raw numeric value (will be rounded to nearest 0.1)
      await apiHelpers.fillWithValue(page, testid, '4500.37');

      // Navigate away to trigger callbacks
      await page.keyboard.press('Tab');

      // Should be rounded to step=0.1 and formatted by numeral.js
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$4,500.40'); // 4500.37 rounds to 4500.4 with step=0.1
    });

    test('should handle spinning up to max with numeral.js callbacks', async ({ page }) => {
      // Set value close to max (5500)
      await apiHelpers.fillWithValue(page, testid, '5499.9');
      await page.keyboard.press('Tab');

      // Verify formatting
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$5,499.90');

      // Start spinning up
      const wrapper2 = await apiHelpers.getWrapperInstanceWhenReady(page, testid);
      await wrapper2.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        if (button) {
          button.dispatchEvent(new Event('mousedown', { bubbles: true }));
        }
      });

      // Hold long enough to reach max
      await apiHelpers.waitForTimeout(800);

      // Stop spinning
      await wrapper2.evaluate((container) => {
        const button = container.querySelector('[data-touchspin-injected="up"]') as HTMLElement | null;
        if (button) {
          button.dispatchEvent(new Event('mouseup', { bubbles: true }));
        }
      });

      // Should reach max value with proper numeral.js formatting
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$5,500.00');
    });
  });

  test.describe('Callback Change Event Integration', () => {
    const testid = 'touchspin-callbacks';

    test('should fire change events with decorated values during continuous operations', async ({ page }) => {
      // Clear events log
      await page.evaluate(() => {
        const eventsLog = document.getElementById('events_log');
        if (eventsLog) eventsLog.textContent = '';
      });

      // Start from a known value
      await apiHelpers.fillWithValue(page, testid, '100');
      await page.keyboard.press('Tab');

      // Wait for value to be formatted
      await expect.poll(
        async () => apiHelpers.readInputValue(page, testid)
      ).toBe('$100.00');

      // Clear events after initial setup
      await page.evaluate(() => {
        const eventsLog = document.getElementById('events_log');
        if (eventsLog) eventsLog.textContent = '';
      });

      // Perform multiple up clicks
      for (let i = 0; i < 3; i++) {
        await apiHelpers.clickUpButton(page, testid);
      }

      // Should have multiple change events, all with decorated values (currency format)
      const changeEventCount = await apiHelpers.changeEventCounter(page);
      expect(changeEventCount).toBeGreaterThanOrEqual(3);

      // Check that the events contain currency-formatted values
      const hasDecoratedValues = await page.evaluate(() => {
        const eventsLog = document.getElementById('events_log');
        const content = eventsLog?.textContent || '';
        return content.includes('$100.10') || content.includes('$100.20') || content.includes('$100.30');
      });

      expect(hasDecoratedValues).toBe(true);
    });
  });
});
