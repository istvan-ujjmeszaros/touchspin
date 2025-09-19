import { test, expect } from '@playwright/test';
import * as apiHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue,
  updateSettingsViaAPI
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Settings Sanitization', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await apiHelpers.waitForCoreTestReady(page);
    await apiHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-settings-sanitization');
  });

  test.describe('Static sanitizePartialSettings Function', () => {
    test('sanitizes invalid step values to 1', async ({ page }) => {
      // Test static function directly
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        // Test various invalid step values
        return {
          infinity: TouchSpinCore.sanitizePartialSettings({ step: Infinity }, DEFAULTS).step,
          negInfinity: TouchSpinCore.sanitizePartialSettings({ step: -Infinity }, DEFAULTS).step,
          nan: TouchSpinCore.sanitizePartialSettings({ step: NaN }, DEFAULTS).step,
          negative: TouchSpinCore.sanitizePartialSettings({ step: -5 }, DEFAULTS).step,
          zero: TouchSpinCore.sanitizePartialSettings({ step: 0 }, DEFAULTS).step,
          string: TouchSpinCore.sanitizePartialSettings({ step: 'invalid' as any }, DEFAULTS).step
        };
      });

      expect(result.infinity).toBe(1);
      expect(result.negInfinity).toBe(1);
      expect(result.nan).toBe(1);
      expect(result.negative).toBe(1);
      expect(result.zero).toBe(1);
      expect(result.string).toBe(1);
    });

    test('sanitizes invalid decimals values to 0', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          infinity: TouchSpinCore.sanitizePartialSettings({ decimals: Infinity }, DEFAULTS).decimals,
          negative: TouchSpinCore.sanitizePartialSettings({ decimals: -2 }, DEFAULTS).decimals,
          nan: TouchSpinCore.sanitizePartialSettings({ decimals: NaN }, DEFAULTS).decimals,
          float: TouchSpinCore.sanitizePartialSettings({ decimals: 2.7 }, DEFAULTS).decimals,
          string: TouchSpinCore.sanitizePartialSettings({ decimals: 'invalid' as any }, DEFAULTS).decimals
        };
      });

      expect(result.infinity).toBe(0);
      expect(result.negative).toBe(0);
      expect(result.nan).toBe(0);
      expect(result.float).toBe(2); // Should be floored
      expect(result.string).toBe(0);
    });

    test('sanitizes invalid min values to null', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          infinity: TouchSpinCore.sanitizePartialSettings({ min: Infinity }, DEFAULTS).min,
          negInfinity: TouchSpinCore.sanitizePartialSettings({ min: -Infinity }, DEFAULTS).min,
          nan: TouchSpinCore.sanitizePartialSettings({ min: NaN }, DEFAULTS).min,
          string: TouchSpinCore.sanitizePartialSettings({ min: 'invalid' as any }, DEFAULTS).min,
          null: TouchSpinCore.sanitizePartialSettings({ min: null }, DEFAULTS).min,
          undefined: TouchSpinCore.sanitizePartialSettings({ min: undefined as any }, DEFAULTS).min,
          emptyString: TouchSpinCore.sanitizePartialSettings({ min: '' as any }, DEFAULTS).min
        };
      });

      expect(result.infinity).toBeNull();
      expect(result.negInfinity).toBeNull();
      expect(result.nan).toBeNull();
      expect(result.string).toBeNull();
      expect(result.null).toBeNull();
      expect(result.undefined).toBeNull();
      expect(result.emptyString).toBeNull();
    });

    test('sanitizes invalid max values to null', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          infinity: TouchSpinCore.sanitizePartialSettings({ max: Infinity }, DEFAULTS).max,
          negInfinity: TouchSpinCore.sanitizePartialSettings({ max: -Infinity }, DEFAULTS).max,
          nan: TouchSpinCore.sanitizePartialSettings({ max: NaN }, DEFAULTS).max,
          string: TouchSpinCore.sanitizePartialSettings({ max: 'invalid' as any }, DEFAULTS).max,
          null: TouchSpinCore.sanitizePartialSettings({ max: null }, DEFAULTS).max,
          undefined: TouchSpinCore.sanitizePartialSettings({ max: undefined as any }, DEFAULTS).max,
          emptyString: TouchSpinCore.sanitizePartialSettings({ max: '' as any }, DEFAULTS).max
        };
      });

      expect(result.infinity).toBeNull();
      expect(result.negInfinity).toBeNull();
      expect(result.nan).toBeNull();
      expect(result.string).toBeNull();
      expect(result.null).toBeNull();
      expect(result.undefined).toBeNull();
      expect(result.emptyString).toBeNull();
    });

    test('swaps min and max when min > max', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        // Test min > max scenario
        const sanitized = TouchSpinCore.sanitizePartialSettings({ min: 100, max: 50 }, DEFAULTS);
        return {
          min: sanitized.min,
          max: sanitized.max
        };
      });

      // Values should be swapped
      expect(result.min).toBe(50);
      expect(result.max).toBe(100);
    });

    test('handles null min with valid max (no swap)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        const sanitized = TouchSpinCore.sanitizePartialSettings({ min: null, max: 50 }, DEFAULTS);
        return {
          min: sanitized.min,
          max: sanitized.max
        };
      });

      // No swap should occur with null values
      expect(result.min).toBeNull();
      expect(result.max).toBe(50);
    });

    test('sanitizes invalid stepinterval values', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          negative: TouchSpinCore.sanitizePartialSettings({ stepinterval: -50 }, DEFAULTS).stepinterval,
          nan: TouchSpinCore.sanitizePartialSettings({ stepinterval: NaN }, DEFAULTS).stepinterval,
          infinity: TouchSpinCore.sanitizePartialSettings({ stepinterval: Infinity }, DEFAULTS).stepinterval,
          string: TouchSpinCore.sanitizePartialSettings({ stepinterval: 'invalid' as any }, DEFAULTS).stepinterval
        };
      });

      expect(result.negative).toBe(100); // Uses default
      expect(result.nan).toBe(100);
      expect(result.infinity).toBe(100);
      expect(result.string).toBe(100);
    });

    test('sanitizes invalid stepintervaldelay values', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          negative: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: -200 }, DEFAULTS).stepintervaldelay,
          nan: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: NaN }, DEFAULTS).stepintervaldelay,
          infinity: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: Infinity }, DEFAULTS).stepintervaldelay,
          string: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: 'invalid' as any }, DEFAULTS).stepintervaldelay
        };
      });

      expect(result.negative).toBe(500); // Uses default
      expect(result.nan).toBe(500);
      expect(result.infinity).toBe(500);
      expect(result.string).toBe(500);
    });

    test('preserves valid values unchanged', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        const validSettings = {
          step: 5,
          decimals: 2,
          min: 0,
          max: 100,
          stepinterval: 200,
          stepintervaldelay: 1000
        };

        return TouchSpinCore.sanitizePartialSettings(validSettings, DEFAULTS);
      });

      expect(result.step).toBe(5);
      expect(result.decimals).toBe(2);
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(result.stepinterval).toBe(200);
      expect(result.stepintervaldelay).toBe(1000);
    });

    test('handles partial settings objects', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        // Only provide step, others shouldn't be included in output
        return TouchSpinCore.sanitizePartialSettings({ step: 3 }, DEFAULTS);
      });

      expect(result.step).toBe(3);
      expect(result.decimals).toBeUndefined();
      expect(result.min).toBeUndefined();
      expect(result.max).toBeUndefined();
    });
  });

  test.describe('Settings Sanitization During Initialization', () => {
    test('applies sanitization during core initialization', async ({ page }) => {
      // Initialize with invalid values that should be sanitized
      await initializeCore(page, 'test-input', {
        step: Infinity,
        decimals: -1,
        min: 'invalid',
        max: NaN,
        initval: 10
      });

      // Test that sanitization was applied
      await setValueViaAPI(page, 'test-input', 15);

      // Should use step=1 (sanitized from Infinity)
      const value1 = await getNumericValue(page, 'test-input');
      expect(value1).toBe(15);

      // Should have decimals=0 (sanitized from -1)
      expect(await readInputValue(page, 'test-input')).toBe('15');

      // Should have no constraints (min/max sanitized to null)
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000);

      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000);
    });

    test('handles min/max swapping during initialization', async ({ page }) => {
      // Initialize with min > max
      await initializeCore(page, 'test-input', {
        min: 100,
        max: 50,
        initval: 75
      });

      // Value should be clamped to swapped range (min=50, max=100)
      await setValueViaAPI(page, 'test-input', 25);
      expect(await getNumericValue(page, 'test-input')).toBe(50); // Clamped to new min

      await setValueViaAPI(page, 'test-input', 150);
      expect(await getNumericValue(page, 'test-input')).toBe(100); // Clamped to new max
    });
  });

  test.describe('Runtime Settings Sanitization', () => {
    test('sanitizes settings during updateSettings calls', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      // Update with invalid values
      await updateSettingsViaAPI(page, 'test-input', {
        step: -5,
        decimals: NaN,
        min: Infinity,
        max: 'invalid'
      });

      // Verify sanitization occurred
      await setValueViaAPI(page, 'test-input', 15);

      // Should use sanitized step=1
      const value = await getNumericValue(page, 'test-input');
      expect(value).toBe(15);

      // Should use sanitized decimals=0
      expect(await readInputValue(page, 'test-input')).toBe('15');

      // Should have no constraints (min/max sanitized to null)
      await setValueViaAPI(page, 'test-input', -500);
      expect(await getNumericValue(page, 'test-input')).toBe(-500);
    });

    test('applies min/max swapping during runtime updates', async ({ page }) => {
      await initializeCore(page, 'test-input', { initval: 10 });

      // Update with swapped min/max
      await updateSettingsViaAPI(page, 'test-input', {
        min: 80,
        max: 20
      });

      // Should swap to min=20, max=80 and clamp current value
      expect(await getNumericValue(page, 'test-input')).toBe(20); // Clamped to new min

      // Verify the swap worked
      await setValueViaAPI(page, 'test-input', 100);
      expect(await getNumericValue(page, 'test-input')).toBe(80); // Clamped to swapped max
    });
  });
});

// NOTE: This test file exercises the static sanitizePartialSettings function
// and verifies sanitization is applied during both initialization and runtime updates.
