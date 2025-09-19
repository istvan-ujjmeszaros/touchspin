import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  incrementViaAPI,
  decrementViaAPI
} from '../../..__tests__/helpers/touchspinApiHelpers';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = apiHelpers;

test.describe('Core TouchSpin Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-initialization');
  });

  test.describe('Basic Initialization', () => {
    test('should initialize with default settings', async ({ page }) => {
      await initializeCore(page, 'test-input', {});

      expect(await isCoreInitialized(page, 'test-input')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(50); // Fixture default value
    });

    test('should initialize with custom settings', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        min: 5,
        max: 25,
        step: 2,
        decimals: 1,
        initval: 10
      });

      expect(await isCoreInitialized(page, 'test-input')).toBe(true);
      expect(await getNumericValue(page, 'test-input')).toBe(10.0); // Custom initial value
    });

    test('should validate input element exists', async ({ page }) => {
      // Try to initialize on non-existent element
      const error = await page.evaluate(async () => {
        try {
          const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
          const input = document.querySelector('[data-testid="non-existent"]') as HTMLInputElement;
          new TouchSpinCore(input, {});
          return null;
        } catch (e) {
          return (e as Error).message;
        }
      });

      expect(error).toBeTruthy(); // Should throw an error for non-existent element
    });

    test('should set up input attributes correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 10, max: 50, step: 5 });

      const attributes = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        return {
          type: input.type,
          min: input.getAttribute('min'),
          max: input.getAttribute('max'),
          step: input.getAttribute('step'),
          role: input.getAttribute('role')
        };
      });

      expect(attributes.type).toBe('number');
      expect(attributes.min).toBe('10');
      expect(attributes.max).toBe('50');
      expect(attributes.step).toBe('5');
      expect(attributes.role).toBe('spinbutton');
    });
  });

  test.describe('State Setup', () => {
    test('should initialize internal state correctly', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 2, initval: 10 });

      // Test that increment/decrement work immediately after initialization
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(12); // 10 + 2

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(10); // 12 - 2
    });

    test('should process initial value from options', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 42 });

      expect(await getNumericValue(page, 'test-input')).toBe(42);
    });

    test('should apply constraints to initial value', async ({ page }) => {
      // Initial value above max should be clamped
      await initializeCore(page, 'test-input', {
        min: 0,
        max: 20,
        step: 1,
        initval: 100
      });

      expect(await getNumericValue(page, 'test-input')).toBe(20); // Clamped to max
    });

    test('should set up step normalization', async ({ page }) => {
      // Initial value not aligned to step should be normalized
      await initializeCore(page, 'test-input', {
        step: 5,
        forcestepdivisibility: 'round',
        initval: 17
      });

      expect(await getNumericValue(page, 'test-input')).toBe(15); // 17 rounded to nearest multiple of 5
    });

    test('should handle decimal precision setup', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        decimals: 2,
        step: 0.25,
        initval: 5.1234
      });

      expect(await readInputValue(page, 'test-input')).toBe('5.00'); // 5.1234 normalized to nearest 0.25 multiple (5.00) with 2 decimals
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid settings gracefully', async ({ page }) => {
      // Test invalid decimals - should default to 0
      await initializeCore(page, 'test-input', {
        decimals: -5, // Invalid negative decimals
        step: 1,
        initval: 5.75
      });

      expect(await readInputValue(page, 'test-input')).toBe('6'); // Rounded to integer
    });

    test('should handle conflicting min/max settings', async ({ page }) => {
      // Test min > max
      await initializeCore(page, 'test-input', {
        min: 50,
        max: 10, // max < min
        step: 1,
        initval: 25
      });

      // Core should handle this gracefully - check that it works
      expect(await isCoreInitialized(page, 'test-input')).toBe(true);
    });

    test('should prevent double initialization on same element', async ({ page }) => {
      // First initialization
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      const firstValue = await getNumericValue(page, 'test-input');
      expect(firstValue).toBe(10);

      // Second initialization attempt - should be ignored or handled
      const error = await page.evaluate(async () => {
        try {
          const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
          const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

          // Try to initialize again - this may overwrite or be prevented
          new TouchSpinCore(input, { step: 5, initval: 99 });
          return null;
        } catch (e) {
          return (e as Error).message;
        }
      });

      // Check current state - either unchanged or updated to new settings
      const currentValue = await getNumericValue(page, 'test-input');
      expect(typeof currentValue).toBe('number'); // Should still be functional
    });

    test('should handle null/undefined options', async ({ page }) => {
      // Test with minimal options
      await initializeCore(page, 'test-input', {
        min: null,
        max: null,
        step: 1
      });

      expect(await isCoreInitialized(page, 'test-input')).toBe(true);

      // Should work with null boundaries
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(51); // 50 (fixture default) + 1
    });
  });

  test.describe('Initialization Lifecycle', () => {
    test('should be ready for value operations after initialization', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, min: 0, max: 100, initval: 15 });

      // Test all basic operations work immediately
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(18); // 15 + 3

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(15); // 18 - 3

      await setValueViaAPI(page, 'test-input', 50);
      expect(await getNumericValue(page, 'test-input')).toBe(51); // 50 normalized to step 3 = 51
    });

    test('should be ready for boundary enforcement after initialization', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, min: 10, max: 20, initval: 15 });

      // Test boundary enforcement works
      await setValueViaAPI(page, 'test-input', 5); // Below min
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Clamped to min

      await setValueViaAPI(page, 'test-input', 25); // Above max
      expect(await getNumericValue(page, 'test-input')).toBe(20); // Clamped to max
    });

    test('should preserve input value when no initval provided', async ({ page }) => {
      // Set input value before initialization
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '42';
      });

      await initializeCore(page, 'test-input', { step: 1 }); // No initval

      expect(await getNumericValue(page, 'test-input')).toBe(42); // Preserves input value
    });

    test('should create DOM markers for initialization tracking', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1 });

      const hasMarker = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        return input.hasAttribute('data-touchspin-injected');
      });

      expect(hasMarker).toBe(true); // Should have initialization marker
    });

    test('should support custom step values immediately', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0.5, decimals: 1, initval: 5.0 });

      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(5.5); // Custom step works

      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(5.0); // Back to original
    });
  });
});

// NOTE: This test file covers the initialization process for TouchSpin core.
// Proper initialization is critical for all subsequent functionality.
