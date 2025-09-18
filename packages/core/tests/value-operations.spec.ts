import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  incrementViaAPI,
  decrementViaAPI,
  incrementViaKeyboard,
  decrementViaKeyboard
} from '../test-helpers/core-adapter';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = touchspinHelpers;

test.describe('Core TouchSpin Value Operations', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    // Load core test fixture
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    // Core tests will use TouchSpin core directly, not through jQuery plugin
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-value-operations');
  });

  test.describe('API Value Operations', () => {
    test('should get current numeric value', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 42 });

      expect(await getNumericValue(page, 'test-input')).toBe(42);
    });

    test('should set value via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      await setValueViaAPI(page, 'test-input', 25);

      expect(await getNumericValue(page, 'test-input')).toBe(25);
    });

    test('should increment value via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 5, initval: 10 });

      await incrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(15); // 10 + 5
    });

    test('should decrement value via API', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, initval: 18 }); // Use step-aligned init value

      await decrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(15); // 18 - 3
    });
  });

  test.describe('Step Calculations', () => {
    test('should increment by exact step amount', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 7, initval: 14 }); // Use step-aligned init value

      await incrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(21); // 14 + 7
    });

    test('should decrement by exact step amount', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 4, initval: 20 });

      await decrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(16); // 20 - 4
    });

    test('should handle fractional steps correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0.25, decimals: 2, initval: 5.00 });

      await incrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(5.25); // 5.00 + 0.25
    });

    test('should handle very large step values', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1000, min: 0, max: 500, initval: 100 });

      await incrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(500); // Clamped to max
    });

    test('should handle zero step value', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0, initval: 10 });

      await incrementViaAPI(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(11); // Zero step defaults to 1
    });
  });

  test.describe('Value Normalization', () => {
    test('should normalize string values to numbers', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 5 });

      await setValueViaAPI(page, 'test-input', '25');

      expect(await getNumericValue(page, 'test-input')).toBe(25); // String converted to number
    });

    test('should handle invalid string values', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      await setValueViaAPI(page, 'test-input', 'invalid');

      expect(await getNumericValue(page, 'test-input')).toBe(10); // Retains previous value
    });

    test('should handle null and undefined values', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 15 });

      await setValueViaAPI(page, 'test-input', null);

      expect(await getNumericValue(page, 'test-input')).toBe(0); // Number(null) = 0
    });

    test('should handle NaN values', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 20 });

      await setValueViaAPI(page, 'test-input', NaN);

      expect(await getNumericValue(page, 'test-input')).toBe(20); // Retains previous value
    });

    test('should handle empty string values', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 30 });

      await setValueViaAPI(page, 'test-input', '');

      expect(await getNumericValue(page, 'test-input')).toBe(0); // Number('') = 0
    });
  });

  test.describe('Initial Value Processing', () => {
    test('should use provided initial value when valid', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 42 });

      expect(await getNumericValue(page, 'test-input')).toBe(42); // Uses initval
    });

    test('should use input value when no initval provided', async ({ page }) => {
      // Set initial value in the input element before initialization
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '75';
      });

      await initializeCore(page, 'test-input', { step: 1 }); // No initval

      expect(await getNumericValue(page, 'test-input')).toBe(75); // Uses input.value
    });

    test('should use default when no value available', async ({ page }) => {
      // Ensure input is empty before initialization
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '';
      });

      await initializeCore(page, 'test-input', { step: 1, min: 10, max: 50 }); // No initval, empty input

      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(0); // Empty input value defaults to 0
    });
  });

  test.describe('Keyboard Operations', () => {
    test('should increment via arrow up key', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 2, initval: 10 });

      await incrementViaKeyboard(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(12); // 10 + 2
    });

    test('should decrement via arrow down key', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, initval: 15 });

      await decrementViaKeyboard(page, 'test-input');

      expect(await getNumericValue(page, 'test-input')).toBe(12); // 15 - 3
    });
  });

  test.describe('Value Constraints', () => {
    test('should apply forcestepdivisibility on setValue', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 5, forcestepdivisibility: 'round', initval: 10 });

      await setValueViaAPI(page, 'test-input', 17); // Not divisible by 5

      expect(await getNumericValue(page, 'test-input')).toBe(15); // Rounded to nearest step multiple
    });

    test('should clamp values to min/max boundaries', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 5, max: 25, initval: 15 });

      await setValueViaAPI(page, 'test-input', 100); // Above max
      expect(await getNumericValue(page, 'test-input')).toBe(25); // Clamped to max

      await setValueViaAPI(page, 'test-input', -10); // Below min
      expect(await getNumericValue(page, 'test-input')).toBe(5); // Clamped to min
    });
  });
});

// NOTE: This test file covers all core value operations for TouchSpin core.
// These tests verify the mathematical and logical operations that form the foundation
// of the TouchSpin functionality.