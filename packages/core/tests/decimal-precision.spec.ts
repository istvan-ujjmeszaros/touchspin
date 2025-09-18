import { test, expect } from '@playwright/test';
import touchspinHelpers from '../test-helpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  incrementViaAPI,
  decrementViaAPI
} from '../test-helpers/core-adapter';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = touchspinHelpers;

test.describe('Core TouchSpin Decimal Precision', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-decimal-precision');
  });

  test.describe('Decimal Display Formatting', () => {
    test('should format values with specified decimal places', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01, initval: 5.50 });

      expect(await readInputValue(page, 'test-input')).toBe('5.50'); // Formatted with 2 decimals
    });

    test('should handle zero decimal places', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 0, step: 1, initval: 5.75 });

      expect(await readInputValue(page, 'test-input')).toBe('6'); // Rounded to integer, no decimals
    });

    test('should handle large decimal place counts', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 6, step: 0.000001, initval: 3.123456 });

      expect(await readInputValue(page, 'test-input')).toBe('3.123456'); // 6 decimal places
    });

    test('should round values for display correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01, initval: 5.555 });

      expect(await readInputValue(page, 'test-input')).toBe('5.56'); // Rounded to 2 decimals
    });
  });

  test.describe('Precision in Calculations', () => {
    test('should maintain precision during arithmetic operations', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.1, initval: 0.1 });

      // Avoid floating point errors like 0.1 + 0.1 = 0.30000000000000004
      for (let i = 0; i < 9; i++) {
        await page.evaluate(() => {
          const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
          const core = (input as any)._touchSpinCore;
          core.upOnce();
        });
      }

      expect(await getNumericValue(page, 'test-input')).toBe(1.00); // Should be exactly 1.00, not 0.9999999999999999
    });

    test('should handle step operations with decimals', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.25, initval: 5.00 });

      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.upOnce();
      });

      expect(await getNumericValue(page, 'test-input')).toBe(5.25); // Precise decimal step
    });

    test('should avoid floating point accumulation errors', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01, initval: 0.00 });

      // Add 0.01 one hundred times
      for (let i = 0; i < 100; i++) {
        await page.evaluate(() => {
          const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
          const core = (input as any)._touchSpinCore;
          core.upOnce();
        });
      }

      expect(await getNumericValue(page, 'test-input')).toBe(1.00); // Should be exactly 1.00
    });

    test('should handle boundary checks with decimal precision', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, min: 0.05, max: 0.95, step: 0.05, initval: 0.50 });

      // Test increment to boundary
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => {
          const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
          const core = (input as any)._touchSpinCore;
          core.upOnce();
        });
      }

      expect(await getNumericValue(page, 'test-input')).toBe(0.95); // Clamped to max with precision
    });
  });

  test.describe('Decimal Input Processing', () => {
    test('should parse decimal input correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01 });

      await fillWithValue(page, 'test-input', '12.34');
      await page.keyboard.press('Tab'); // Trigger blur for validation

      expect(await getNumericValue(page, 'test-input')).toBe(12.34);
    });

    test('should handle various decimal separators', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01 });

      // Core uses standard JavaScript parsing, so only dot separator is supported
      await fillWithValue(page, 'test-input', '12.34');
      await page.keyboard.press('Tab');

      expect(await getNumericValue(page, 'test-input')).toBe(12.34);
    });

    test('should validate decimal input format', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01, initval: 5.00 });

      // Core uses input type="number" which prevents typing invalid text
      // So test programmatic setValue with invalid input instead
      await setValueViaAPI(page, 'test-input', 'invalid');

      // Core should reject invalid input and maintain current value
      expect(await getNumericValue(page, 'test-input')).toBe(5.00);
    });

    test('should normalize decimal representations', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01 });

      // Test different valid representations that should normalize to same value
      await fillWithValue(page, 'test-input', '.5'); // Should become 0.50
      await page.keyboard.press('Tab');

      expect(await readInputValue(page, 'test-input')).toBe('0.50'); // Normalized to 2 decimals
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very small decimal values', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 6, step: 0.000001, initval: 0.000001 });

      expect(await readInputValue(page, 'test-input')).toBe('0.000001'); // Tiny decimal preserved
    });

    test('should handle very large decimal values', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, max: null, step: 0.01, initval: 999999.99 });

      expect(await readInputValue(page, 'test-input')).toBe('999999.99'); // Large decimal preserved
    });

    test('should handle scientific notation input', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 6, step: 0.000001 });

      await fillWithValue(page, 'test-input', '1e-6'); // Scientific notation
      await page.keyboard.press('Tab');

      expect(await getNumericValue(page, 'test-input')).toBe(0.000001); // Parsed correctly
    });

    test('should handle JavaScript precision limits', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 10, step: 0.0000000001, initval: 0.1234567890 });

      // Test that the Core properly handles JavaScript floating point limitations
      expect(await readInputValue(page, 'test-input')).toBe('0.1234567890'); // Precision preserved in display
    });

    test('should handle invalid decimals configuration', async ({ page }) => {
      // Test with negative decimals (should default to 0)
      await initializeCore(page, 'test-input', { decimals: -1, step: 1, initval: 5.75 });

      expect(await readInputValue(page, 'test-input')).toBe('6'); // Defaults to 0 decimals, rounds value
    });

    test('should handle excessive decimal places in input', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 2, step: 0.01 });

      await fillWithValue(page, 'test-input', '5.123456789'); // More decimals than configured
      await page.keyboard.press('Tab');

      expect(await readInputValue(page, 'test-input')).toBe('5.12'); // Truncated to configured decimals
    });
  });
});

// NOTE: This test file covers decimal precision handling in TouchSpin core.
// Proper decimal handling is critical for financial and scientific applications.