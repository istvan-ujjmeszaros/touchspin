import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import { initializeTouchSpinCore, getCoreValue, setCoreValue, getInputValue, setInputValue } from '../test-helpers';

test.describe('Core TouchSpin Value Normalization', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/test-helpers/fixtures/minimal.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-value-normalization');
  });

  test.describe('getValue Method', () => {

    test('should return numeric value from input', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      const value = await getCoreValue(page, 'test-input');
      expect(value).toBe(50); // Default input value
    });

    test('should return NaN for empty input', async ({ page }) => {
      await setInputValue(page, 'test-input', '');
      await initializeTouchSpinCore(page, 'test-input', {});

      const value = await getCoreValue(page, 'test-input');
      expect(Number.isNaN(value)).toBe(true);
    });

    test('should return NaN for non-numeric input', async ({ page }) => {
      await setInputValue(page, 'test-input', 'abc');
      await initializeTouchSpinCore(page, 'test-input', {});

      const value = await getCoreValue(page, 'test-input');
      expect(Number.isNaN(value)).toBe(true);
    });

    test('should use replacement value when input is empty', async ({ page }) => {
      await setInputValue(page, 'test-input', '');
      await initializeTouchSpinCore(page, 'test-input', { replacementval: '25' });

      const value = await getCoreValue(page, 'test-input');
      expect(value).toBe(25);
    });

    test('should parse decimal values correctly', async ({ page }) => {
      await setInputValue(page, 'test-input', '12.75');
      await initializeTouchSpinCore(page, 'test-input', {});

      const value = await getCoreValue(page, 'test-input');
      expect(value).toBe(12.75);
    });

    test('should handle negative values', async ({ page }) => {
      await setInputValue(page, 'test-input', '-42');
      await initializeTouchSpinCore(page, 'test-input', {});

      const value = await getCoreValue(page, 'test-input');
      expect(value).toBe(-42);
    });

    test('should apply before calculation callback', async ({ page }) => {
      await setInputValue(page, 'test-input', '100');
      await initializeTouchSpinCore(page, 'test-input', {
        callback_before_calculation: (v) => String(parseFloat(v) * 2) // Double the value
      });

      const value = await getCoreValue(page, 'test-input');
      expect(value).toBe(200); // 100 * 2
    });

    test('should handle callback that returns non-numeric value', async ({ page }) => {
      await setInputValue(page, 'test-input', '50');
      await initializeTouchSpinCore(page, 'test-input', {
        callback_before_calculation: () => 'invalid'
      });

      const value = await getCoreValue(page, 'test-input');
      expect(Number.isNaN(value)).toBe(true);
    });
  });

  test.describe('setValue Method', () => {

    test('should set numeric value', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      await setCoreValue(page, 'test-input', 75);

      expect(await getInputValue(page, 'test-input')).toBe('75');
      expect(await getCoreValue(page, 'test-input')).toBe(75);
    });

    test('should set string numeric value', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      await setCoreValue(page, 'test-input', '85');

      expect(await getInputValue(page, 'test-input')).toBe('85');
      expect(await getCoreValue(page, 'test-input')).toBe(85);
    });

    test('should ignore invalid numeric values', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});
      const originalValue = await getInputValue(page, 'test-input');

      await setCoreValue(page, 'test-input', 'invalid');

      // Value should remain unchanged
      expect(await getInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should ignore infinite values', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});
      const originalValue = await getInputValue(page, 'test-input');

      await page.evaluate(() => {
        const api = window.touchSpinInstances?.get('test-input');
        api.setValue(Infinity);
      });

      // Value should remain unchanged
      expect(await getInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should respect disabled input', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });

      await initializeTouchSpinCore(page, 'test-input', {});
      const originalValue = await getInputValue(page, 'test-input');

      await setCoreValue(page, 'test-input', 99);

      // Value should remain unchanged for disabled input
      expect(await getInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should respect readonly input', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('readonly', '');
      });

      await initializeTouchSpinCore(page, 'test-input', {});
      const originalValue = await getInputValue(page, 'test-input');

      await setCoreValue(page, 'test-input', 99);

      // Value should remain unchanged for readonly input
      expect(await getInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should apply constraints when setting value', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 0, max: 100 });

      // Set value above max
      await setCoreValue(page, 'test-input', 150);

      expect(await getCoreValue(page, 'test-input')).toBe(100); // Clamped to max
    });

    test('should align to step when setting value', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { step: 5 });

      await setCoreValue(page, 'test-input', 23);

      expect(await getCoreValue(page, 'test-input')).toBe(25); // 23 rounded to nearest step (25)
    });

    test('should trigger change event', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      // Clear event log
      await page.evaluate(() => window.clearEventLog());

      await setCoreValue(page, 'test-input', 80);

      const changeEventCount = await page.evaluate(() => {
        const log = window.eventLog || [];
        return log.filter((entry: any) => entry.event === 'change' && entry.type === 'native').length;
      });

      expect(changeEventCount).toBe(1);
    });
  });

  test.describe('Value Constraints', () => {

    test('should clamp value to minimum boundary', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 10, max: 90 });

      await setCoreValue(page, 'test-input', 5);

      expect(await getCoreValue(page, 'test-input')).toBe(10); // Clamped to min
    });

    test('should clamp value to maximum boundary', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 10, max: 90 });

      await setCoreValue(page, 'test-input', 95);

      expect(await getCoreValue(page, 'test-input')).toBe(90); // Clamped to max
    });

    test('should handle null min/max boundaries', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: null, max: null });

      await setCoreValue(page, 'test-input', -1000);
      expect(await getCoreValue(page, 'test-input')).toBe(-1000); // No clamping

      await setCoreValue(page, 'test-input', 1000);
      expect(await getCoreValue(page, 'test-input')).toBe(1000); // No clamping
    });

    test('should handle both boundaries null', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: null, max: null });

      await setCoreValue(page, 'test-input', 12345);
      expect(await getCoreValue(page, 'test-input')).toBe(12345);
    });

    test('should handle minimum only', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 20, max: null });

      await setCoreValue(page, 'test-input', 15);
      expect(await getCoreValue(page, 'test-input')).toBe(20); // Clamped to min

      await setCoreValue(page, 'test-input', 1000);
      expect(await getCoreValue(page, 'test-input')).toBe(1000); // No max limit
    });

    test('should handle maximum only', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: null, max: 80 });

      await setCoreValue(page, 'test-input', 90);
      expect(await getCoreValue(page, 'test-input')).toBe(80); // Clamped to max

      await setCoreValue(page, 'test-input', -1000);
      expect(await getCoreValue(page, 'test-input')).toBe(-1000); // No min limit
    });
  });

  test.describe('firstclickvalueifempty', () => {

    test('should use firstclickvalueifempty when input is NaN', async ({ page }) => {
      await setInputValue(page, 'test-input', '');
      await initializeTouchSpinCore(page, 'test-input', { firstclickvalueifempty: 42 });

      // Simulate getting value when NaN
      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        // Directly call _valueIfIsNaN to test this path
        return core._valueIfIsNaN();
      });

      expect(result).toBe(42);
    });

    test('should use midpoint of min/max when firstclickvalueifempty not set', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 20, max: 80 });

      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core._valueIfIsNaN();
      });

      expect(result).toBe(50); // (20 + 80) / 2
    });

    test('should handle null min in _valueIfIsNaN', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: null, max: 100 });

      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core._valueIfIsNaN();
      });

      expect(result).toBe(50); // (0 + 100) / 2, where null min becomes 0
    });

    test('should handle null max in _valueIfIsNaN', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 10, max: null });

      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core._valueIfIsNaN();
      });

      expect(result).toBe(10); // (10 + 10) / 2, where null max becomes min
    });
  });

  test.describe('Display Formatting', () => {

    test('should format value with specified decimals', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { decimals: 2 });

      await setCoreValue(page, 'test-input', 42);

      expect(await getInputValue(page, 'test-input')).toBe('42.00');
    });

    test('should apply after calculation callback to display', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        decimals: 1,
        callback_after_calculation: (v) => `$${v}`
      });

      await setCoreValue(page, 'test-input', 25);

      expect(await getInputValue(page, 'test-input')).toBe('$25.0');
    });

    test('should handle zero decimals', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { decimals: 0 });

      await setCoreValue(page, 'test-input', 42.789);

      expect(await getInputValue(page, 'test-input')).toBe('43'); // Rounded to integer
    });
  });

  test.describe('Value Check on Blur', () => {

    test('should sanitize value on blur', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 0, max: 100, step: 5 });

      // Set invalid value directly in input
      await setInputValue(page, 'test-input', '123');

      // Trigger blur
      await page.focus('[data-testid="blur-target"]');

      // Value should be corrected
      expect(await getInputValue(page, 'test-input')).toBe('100'); // Clamped to max
    });

    test('should emit change event when value is corrected on blur', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { max: 50 });

      // Clear event log
      await page.evaluate(() => window.clearEventLog());

      // Set value above max directly
      await setInputValue(page, 'test-input', '75');

      // Trigger blur
      await page.focus('[data-testid="blur-target"]');

      const changeEvents = await page.evaluate(() => {
        const log = window.eventLog || [];
        return log.filter((entry: any) => entry.event === 'change' && entry.type === 'native').length;
      });

      expect(changeEvents).toBeGreaterThan(0);
      expect(await getInputValue(page, 'test-input')).toBe('50'); // Corrected value
    });

    test('should not emit change event when value is already correct', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {});

      // Set valid value
      await setInputValue(page, 'test-input', '75');

      // Clear event log after setting value
      await page.evaluate(() => window.clearEventLog());

      // Trigger blur
      await page.focus('[data-testid="blur-target"]');

      const changeEvents = await page.evaluate(() => {
        const log = window.eventLog || [];
        return log.filter((entry: any) => entry.event === 'change' && entry.type === 'native').length;
      });

      expect(changeEvents).toBe(0); // No correction needed, no change event
    });
  });
});