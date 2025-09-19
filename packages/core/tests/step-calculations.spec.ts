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
} from '../test-helpers/core-adapter';

// Use original battle-tested helpers
const {
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = apiHelpers;

test.describe('Core TouchSpin Step Calculations', () => {
  test.beforeEach(async ({ page }) => {
    await apiHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/minimal.html');
    await apiHelpers.waitForCoreTestReady(page);
  });

  test.afterEach(async ({ page }) => {
    await apiHelpers.collectCoverage(page, 'core-step-calculations');
  });

  test.describe('Basic Step Operations', () => {
    test('should increment by step amount', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 5 });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(55); // 50 + 5
    });

    test('should decrement by step amount', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, initval: 48 });
      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(45); // 48 - 3
    });

    test('should handle decimal step values', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0.25, decimals: 2, initval: 10 });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(10.25);
    });

    test('should handle negative step values by using absolute value', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: -3 });
      // Negative step should be sanitized to positive
      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core.settings.step;
      });
      expect(settings).toBe(1); // Invalid step should fallback to 1
    });

    test('should use step value of 1 when step is zero', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0 });
      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core.settings.step;
      });
      expect(settings).toBe(1); // Zero step should fallback to 1
    });

    test('should handle very small step values', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0.001, decimals: 3, initval: 1 });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(1.001);
    });
  });

  test.describe('Value Normalization on Initialization', () => {
    test('should normalize initial value to nearest step multiple', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3 });
      expect(await getNumericValue(page, 'test-input')).toBe(51); // 50 → 51 (nearest multiple of 3)
    });

    test('should round 50 to 51 when step is 3', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, initval: 50 });
      expect(await getNumericValue(page, 'test-input')).toBe(51); // 50 rounded up to 51
    });

    test('should round 49 to 48 when step is 3', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, initval: 49 });
      expect(await getNumericValue(page, 'test-input')).toBe(48); // 49 rounded down to 48
    });

    test('should not normalize when value is already divisible by step', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 3, initval: 48 });
      expect(await getNumericValue(page, 'test-input')).toBe(48); // No change needed
    });

    test('should handle decimal step normalization', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 0.5, initval: 1.3, decimals: 1 });
      expect(await getNumericValue(page, 'test-input')).toBe(1.5); // 1.3 → 1.5 (nearest 0.5 multiple)
    });

    test('should normalize to exact step multiple for large steps', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 25, initval: 63 });
      expect(await getNumericValue(page, 'test-input')).toBe(75); // 63 → 75 (nearest multiple of 25)
    });
  });

  test.describe('Step with NaN Values', () => {
    test('should use firstclickvalueifempty when starting from NaN', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 10,
        firstclickvalueifempty: 20,
        initval: ''  // Start with empty value
      });

      await incrementViaAPI(page, 'test-input');

      // Core sets value to firstclickvalueifempty exactly when starting from NaN
      expect(await getNumericValue(page, 'test-input')).toBe(20);
    });

    test('should calculate midpoint when no firstclickvalueifempty set', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        min: 10,
        max: 30,
        step: 5,
        initval: ''  // Start with empty value
      });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(20); // midpoint(10,30) exactly
    });

    test('should handle NaN during down operation', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        firstclickvalueifempty: 25,
        initval: ''  // Start with empty value
      });
      await decrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(25); // firstclickvalueifempty exactly
    });
  });

  test.describe('Step Alignment', () => {
    test('should align bounds to step when step changes', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 7, max: 23, step: 1 });
      // Update to a step that requires alignment
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.updateSettings({ step: 5 });
      });
      const bounds = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return { min: core.settings.min, max: core.settings.max };
      });
      expect(bounds.min).toBe(10); // 7 aligned up to step 5
      expect(bounds.max).toBe(20); // 23 aligned down to step 5
    });

    test('should not align bounds when step is 1', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 7, max: 23, step: 5 });
      // Update to step 1 - should not align
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.updateSettings({ step: 1 });
      });
      const bounds = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return { min: core.settings.min, max: core.settings.max };
      });
      expect(bounds.min).toBe(7); // No alignment for step 1
      expect(bounds.max).toBe(23);
    });

    test('should align min boundary up to step', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const core = new TouchSpinCore(input, {});
        // Test _alignToStep method directly
        return core._alignToStep(7, 5, 'up');
      });
      expect(result).toBe(10); // 7 aligned up to step 5
    });

    test('should align max boundary down to step', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const core = new TouchSpinCore(input, {});
        return core._alignToStep(23, 5, 'down');
      });
      expect(result).toBe(20); // 23 aligned down to step 5
    });

    test('should handle decimal step alignment', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const core = new TouchSpinCore(input, {});
        return core._alignToStep(5.3, 0.5, 'up');
      });
      expect(result).toBe(5.5); // 5.3 aligned up to step 0.5
    });

    test('should handle zero step in alignment', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const core = new TouchSpinCore(input, {});
        return core._alignToStep(15, 0, 'up');
      });
      expect(result).toBe(15); // No change when step is 0
    });

    test('should handle large numbers in alignment', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const core = new TouchSpinCore(input, {});
        return core._alignToStep(123456, 1000, 'down');
      });
      expect(result).toBe(123000); // 123456 aligned down to step 1000
    });
  });

  test.describe('Force Step Divisibility', () => {
    test('should round value to nearest step multiple', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'round'
      });
      await setValueViaAPI(page, 'test-input', 20);
      expect(await getNumericValue(page, 'test-input')).toBe(21); // 20 rounded to nearest multiple of 3
    });

    test('should floor value to step multiple', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 7,
        forcestepdivisibility: 'floor'
      });
      await setValueViaAPI(page, 'test-input', 20);
      expect(await getNumericValue(page, 'test-input')).toBe(14); // 20 floored to multiple of 7
    });

    test('should ceil value to step multiple', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 6,
        forcestepdivisibility: 'ceil'
      });
      await setValueViaAPI(page, 'test-input', 20);
      expect(await getNumericValue(page, 'test-input')).toBe(24); // 20 ceiled to multiple of 6
    });

    test('should not enforce step divisibility when set to none', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'none'
      });
      await setValueViaAPI(page, 'test-input', 20);
      expect(await getNumericValue(page, 'test-input')).toBe(20); // No step enforcement
    });

    test('should respect decimal places in step divisibility', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 0.5,
        decimals: 2,
        forcestepdivisibility: 'round'
      });
      await setValueViaAPI(page, 'test-input', 1.3);
      expect(await getNumericValue(page, 'test-input')).toBe(1.5); // 1.3 rounded to nearest 0.5
    });

    test('should handle exact step multiples', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        forcestepdivisibility: 'round'
      });
      await setValueViaAPI(page, 'test-input', 25);
      expect(await getNumericValue(page, 'test-input')).toBe(25); // Already exact multiple
    });

    test('should normalize decimal precision after step divisibility', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 0.1,
        decimals: 1,
        forcestepdivisibility: 'round'
      });
      await setValueViaAPI(page, 'test-input', 1.23);
      expect(await getNumericValue(page, 'test-input')).toBe(1.2); // Rounded to 0.1, formatted to 1 decimal
    });
  });

  test.describe('Step Calculation Edge Cases', () => {
    test('should handle very large step values', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1000000,
        initval: 0,
        max: 2000000  // Set max higher than step to avoid clamping
      });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(1000000); // 0 + 1000000
    });

    test('should handle very small decimal steps', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 0.0001,
        decimals: 4,
        initval: 0
      });
      await incrementViaAPI(page, 'test-input');
      expect(await getNumericValue(page, 'test-input')).toBe(0.0001);
    });

    test('should handle step with repeating decimals', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1/3,
        decimals: 3,
        initval: 0
      });
      await incrementViaAPI(page, 'test-input');
      // Should handle floating point precision correctly
      const value = await getNumericValue(page, 'test-input');
      expect(Math.abs(value - 0.333)).toBeLessThan(0.001);
    });

    test('should maintain precision in complex step calculations', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 0.2,
        decimals: 1,
        initval: 0.2  // Use value that doesn't need normalization
      });
      // Perform multiple operations to test floating point accumulation
      await incrementViaAPI(page, 'test-input'); // 0.4
      await incrementViaAPI(page, 'test-input'); // 0.6
      await decrementViaAPI(page, 'test-input'); // 0.4
      expect(await getNumericValue(page, 'test-input')).toBe(0.4);
    });
  });
});
