import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized
} from '../../..__tests__/helpers/touchspinApiHelpers';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = apiHelpers;

test.describe('Core TouchSpin Value Normalization', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/minimal.html');
    await apiHelpers.waitForCoreTestReady(page);

    // Set up event logging for Core tests (no jQuery needed)
    await page.evaluate(() => {
      if ((window as any).logEvent) {
        // Listen for change events on all inputs with data-testid
        document.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          if (target.getAttribute('data-testid')) {
            const testId = target.getAttribute('data-testid');
            (window as any).logEvent('change', { target: testId, value: target.value });
          }
        });
      }
    });
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-value-normalization');
  });

  test.describe('getValue Method', () => {
    test('should return numeric value from input', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(50); // Default input value
    });

    test('should display empty string for empty input', async ({ page }) => {
      await initializeCore(page, 'test-input', { initval: '' });
      // TouchSpin displays empty string in the input, even though getValue() returns NaN internally
      const displayValue = await readInputValue(page, 'test-input');
      expect(displayValue).toBe('');
    });

    test('should clear non-numeric input to empty string', async ({ page }) => {
      // Initialize first, then set non-numeric value
      await initializeCore(page, 'test-input', {});
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = 'abc';
      });
      // Core clears non-numeric values to empty string on initialization
      const displayValue = await readInputValue(page, 'test-input');
      expect(displayValue).toBe('');
    });

    test('should use replacement value when input is empty', async ({ page }) => {
      await fillWithValue(page, 'test-input', '');
      await initializeCore(page, 'test-input', { replacementval: '25' });
      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(25);
    });

    test('should parse decimal values correctly', async ({ page }) => {
      await fillWithValue(page, 'test-input', '12.75');
      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(12.75);
    });

    test('should handle negative values', async ({ page }) => {
      await fillWithValue(page, 'test-input', '-42');
      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(-42);
    });

    test('should handle callback that returns non-numeric value', async ({ page }) => {
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '50';
        const core = new TouchSpinCore(input, {
          callback_before_calculation: () => 'invalid'
        });
        input._touchSpinCore = core;
        core.initDOMEventHandling();
      });
      // TouchSpin preserves the display value even when callback returns non-numeric
      const displayValue = await readInputValue(page, 'test-input');
      expect(displayValue).toBe('50'); // Original value preserved in display
    });
  });

  test.describe('setValue Method', () => {
    test('should set numeric value', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      await setValueViaAPI(page, 'test-input', 75);
      expect(await readInputValue(page, 'test-input')).toBe('75');
      expect(await getNumericValue(page, 'test-input')).toBe(75);
    });

    test('should set string numeric value', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      await setValueViaAPI(page, 'test-input', '85');
      expect(await readInputValue(page, 'test-input')).toBe('85');
      expect(await getNumericValue(page, 'test-input')).toBe(85);
    });

    test('should ignore invalid numeric values', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      const originalValue = await readInputValue(page, 'test-input');
      await setValueViaAPI(page, 'test-input', 'invalid');
      // Value should remain unchanged
      expect(await readInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should ignore infinite values', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      const originalValue = await readInputValue(page, 'test-input');
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.setValue(Infinity);
      });
      // Value should remain unchanged
      expect(await readInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should respect disabled input', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });
      const originalValue = await readInputValue(page, 'test-input');
      await setValueViaAPI(page, 'test-input', 99);
      // Value should remain unchanged for disabled input
      expect(await readInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should respect readonly input', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('readonly', '');
      });
      const originalValue = await readInputValue(page, 'test-input');
      await setValueViaAPI(page, 'test-input', 99);
      // Value should remain unchanged for readonly input
      expect(await readInputValue(page, 'test-input')).toBe(originalValue);
    });

    test('should apply constraints when setting value', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 0, max: 100 });
      // Set value above max
      await setValueViaAPI(page, 'test-input', 150);
      expect(await getNumericValue(page, 'test-input')).toBe(100); // Clamped to max
    });

    test('should align to step when setting value', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 5 });
      await setValueViaAPI(page, 'test-input', 23);
      expect(await getNumericValue(page, 'test-input')).toBe(25); // 23 rounded to nearest step (25)
    });

    test('should NOT trigger change event when programmatic value is not sanitized', async ({ page }) => {
      await initializeCore(page, 'test-input', {});
      // Clear event log
      await page.evaluate(() => window.clearEventLog());
      await setValueViaAPI(page, 'test-input', 80);
      // Wait a moment for events to be processed
      await apiHelpers.waitForTimeout(50);
      const changeEventCount = await page.evaluate(() => {
        const log = window.eventLog || [];
        return log.filter((entry: any) => entry.event === 'change' && entry.type === 'native').length;
      });
      expect(changeEventCount).toBe(0); // No change event when value is accepted as-is
    });

    test('should trigger change event when programmatic value is sanitized', async ({ page }) => {
      await initializeCore(page, 'test-input', { max: 60 });
      // Clear event log
      await page.evaluate(() => window.clearEventLog());
      await setValueViaAPI(page, 'test-input', 80); // Will be clamped to 60
      // Wait a moment for events to be processed
      await apiHelpers.waitForTimeout(50);
      const changeEventCount = await page.evaluate(() => {
        const log = window.eventLog || [];
        return log.filter((entry: any) => entry.event === 'change' && entry.type === 'native').length;
      });
      expect(changeEventCount).toBeGreaterThanOrEqual(1); // Change event when sanitization alters value
      expect(await readInputValue(page, 'test-input')).toBe('60'); // Value was clamped
    });
  });

  test.describe('Value Constraints', () => {
    test('should clamp value to minimum boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 10, max: 90 });
      await setValueViaAPI(page, 'test-input', 5);
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Clamped to min
    });

    test('should clamp value to maximum boundary', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 10, max: 90 });
      await setValueViaAPI(page, 'test-input', 95);
      expect(await getNumericValue(page, 'test-input')).toBe(90); // Clamped to max
    });

    test('should handle null min/max boundaries', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: null, max: null });
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000); // No clamping
      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000); // No clamping
    });

    test('should handle both boundaries null', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: null, max: null });
      await setValueViaAPI(page, 'test-input', 12345);
      expect(await getNumericValue(page, 'test-input')).toBe(12345);
    });

    test('should handle minimum only', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 20, max: null });
      await setValueViaAPI(page, 'test-input', 15);
      expect(await getNumericValue(page, 'test-input')).toBe(20); // Clamped to min
      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000); // No max limit
    });

    test('should handle maximum only', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: null, max: 80 });
      await setValueViaAPI(page, 'test-input', 90);
      expect(await getNumericValue(page, 'test-input')).toBe(80); // Clamped to max
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000); // No min limit
    });
  });

  test.describe('firstclickvalueifempty', () => {
    test('should use firstclickvalueifempty when input is NaN', async ({ page }) => {
      await initializeCore(page, 'test-input', { firstclickvalueifempty: 42 });
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
      await initializeCore(page, 'test-input', { min: 20, max: 80 });
      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core._valueIfIsNaN();
      });
      expect(result).toBe(50); // (20 + 80) / 2
    });

    test('should handle null min in _valueIfIsNaN', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: null, max: 100 });
      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core._valueIfIsNaN();
      });
      expect(result).toBe(50); // (0 + 100) / 2, where null min becomes 0
    });

    test('should handle null max in _valueIfIsNaN', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 10, max: null });
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
      await initializeCore(page, 'test-input', { decimals: 2 });
      await setValueViaAPI(page, 'test-input', 42);
      expect(await readInputValue(page, 'test-input')).toBe('42.00');
    });

    test('should apply after calculation callback to display', async ({ page }) => {
      await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {
          decimals: 1,
          callback_after_calculation: (v) => `$${v}`
        });
        input._touchSpinCore = core;
        core.initDOMEventHandling();
        core.setValue(25);
      });
      expect(await readInputValue(page, 'test-input')).toBe('$25.0');
    });

    test('should handle zero decimals', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 0 });
      await setValueViaAPI(page, 'test-input', 42.789);
      expect(await readInputValue(page, 'test-input')).toBe('43'); // Rounded to integer
    });
  });

  test.describe('Value Check on Blur', () => {
    test('should sanitize value on blur', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 0, max: 100, step: 5 });
      // Set invalid value directly in input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '123';
      });
      // Trigger blur by pressing Tab to focus away
      await page.focus('[data-testid="test-input"]');
      await page.keyboard.press('Tab');
      // Wait for blur processing
      await apiHelpers.waitForTimeout(50);
      // Value should be corrected
      expect(await readInputValue(page, 'test-input')).toBe('100'); // Clamped to max
    });

    test('should emit change event when value is corrected on blur', async ({ page }) => {
      await initializeCore(page, 'test-input', { max: 50 });
      // Set value above max directly
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '75';
        window.clearEventLog();
      });
      // Trigger blur by pressing Tab to focus away
      await page.focus('[data-testid="test-input"]');
      await page.keyboard.press('Tab');
      // Wait for blur processing and events
      await apiHelpers.waitForTimeout(100);
      const changeEvents = await page.evaluate(() => {
        const log = window.eventLog || [];
        return log.filter((entry: any) => entry.event === 'change' && entry.type === 'native').length;
      });
      expect(changeEvents).toBeGreaterThanOrEqual(1); // Should fire when value is corrected
      expect(await readInputValue(page, 'test-input')).toBe('50'); // Corrected value
    });

    test('should not emit change event when value is already correct', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 0, max: 100 });
      // Set valid value
      await fillWithValue(page, 'test-input', '50');
      // Clear event log after setting value
      await page.evaluate(() => window.clearEventLog());
      // Trigger blur by pressing Tab to focus away
      await page.focus('[data-testid="test-input"]');
      await page.keyboard.press('Tab');
      const changeEvents = await page.evaluate(() => {
        const log = window.eventLog || [];
        return log.filter((entry: any) => entry.event === 'change' && entry.type === 'native').length;
      });
      expect(changeEvents).toBe(0); // No correction needed, no change event
    });
  });
});
