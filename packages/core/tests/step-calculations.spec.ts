import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import { initializeTouchSpinCore, coreUpOnce, coreDownOnce, getCoreValue, setCoreValue } from '../test-helpers';

test.describe('Core TouchSpin Step Calculations', () => {

  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/test-helpers/fixtures/minimal.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-step-calculations');
  });

  test.describe('Basic Step Operations', () => {

    test('should increment by step amount', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { step: 5 });

      await coreUpOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(55); // 50 + 5
    });

    test('should decrement by step amount', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { step: 3 });

      await coreDownOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(47); // 50 - 3
    });

    test('should handle decimal step values', async ({ page }) => {
      await setCoreValue(page, 'test-input', 10);
      await initializeTouchSpinCore(page, 'test-input', { step: 0.25, decimals: 2 });

      await coreUpOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(10.25);
    });

    test('should handle negative step values by using absolute value', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { step: -3 });

      // Negative step should be sanitized to positive
      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core.settings.step;
      });

      expect(settings).toBe(1); // Invalid step should fallback to 1
    });

    test('should use step value of 1 when step is zero', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { step: 0 });

      const settings = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        return core.settings.step;
      });

      expect(settings).toBe(1); // Zero step should fallback to 1
    });

    test('should handle very small step values', async ({ page }) => {
      await setCoreValue(page, 'test-input', 1);
      await initializeTouchSpinCore(page, 'test-input', { step: 0.001, decimals: 3 });

      await coreUpOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(1.001);
    });
  });

  test.describe('Step with NaN Values', () => {

    test('should use firstclickvalueifempty when starting from NaN', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '';
      });

      await initializeTouchSpinCore(page, 'test-input', {
        step: 10,
        firstclickvalueifempty: 20
      });

      await coreUpOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(30); // 20 + 10
    });

    test('should calculate midpoint when no firstclickvalueifempty set', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '';
      });

      await initializeTouchSpinCore(page, 'test-input', {
        min: 10,
        max: 30,
        step: 5
      });

      await coreUpOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(25); // midpoint(10,30) + 5
    });

    test('should handle NaN during down operation', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '';
      });

      await initializeTouchSpinCore(page, 'test-input', {
        step: 5,
        firstclickvalueifempty: 25
      });

      await coreDownOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(20); // 25 - 5
    });
  });

  test.describe('Step Alignment', () => {

    test('should align bounds to step when step changes', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { min: 7, max: 23, step: 1 });

      // Update to a step that requires alignment
      await page.evaluate(() => {
        const api = window.touchSpinInstances?.get('test-input');
        api.updateSettings({ step: 5 });
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
      await initializeTouchSpinCore(page, 'test-input', { min: 7, max: 23, step: 5 });

      // Update to step 1 - should not align
      await page.evaluate(() => {
        const api = window.touchSpinInstances?.get('test-input');
        api.updateSettings({ step: 1 });
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
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {});

        // Test _alignToStep method directly
        return core._alignToStep(7, 5, 'up');
      });

      expect(result).toBe(10); // 7 aligned up to step 5
    });

    test('should align max boundary down to step', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {});

        return core._alignToStep(23, 5, 'down');
      });

      expect(result).toBe(20); // 23 aligned down to step 5
    });

    test('should handle decimal step alignment', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {});

        return core._alignToStep(5.3, 0.5, 'up');
      });

      expect(result).toBe(5.5); // 5.3 aligned up to step 0.5
    });

    test('should handle zero step in alignment', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {});

        return core._alignToStep(15, 0, 'up');
      });

      expect(result).toBe(15); // No change when step is 0
    });

    test('should handle large numbers in alignment', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = new TouchSpinCore(input, {});

        return core._alignToStep(123456, 1000, 'down');
      });

      expect(result).toBe(123000); // 123456 aligned down to step 1000
    });
  });

  test.describe('Force Step Divisibility', () => {

    test('should round value to nearest step multiple', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'round'
      });

      await setCoreValue(page, 'test-input', 20);

      expect(await getCoreValue(page, 'test-input')).toBe(21); // 20 rounded to nearest multiple of 3
    });

    test('should floor value to step multiple', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        step: 7,
        forcestepdivisibility: 'floor'
      });

      await setCoreValue(page, 'test-input', 20);

      expect(await getCoreValue(page, 'test-input')).toBe(14); // 20 floored to multiple of 7
    });

    test('should ceil value to step multiple', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        step: 6,
        forcestepdivisibility: 'ceil'
      });

      await setCoreValue(page, 'test-input', 20);

      expect(await getCoreValue(page, 'test-input')).toBe(24); // 20 ceiled to multiple of 6
    });

    test('should not enforce step divisibility when set to none', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        step: 3,
        forcestepdivisibility: 'none'
      });

      await setCoreValue(page, 'test-input', 20);

      expect(await getCoreValue(page, 'test-input')).toBe(20); // No step enforcement
    });

    test('should respect decimal places in step divisibility', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        step: 0.5,
        decimals: 2,
        forcestepdivisibility: 'round'
      });

      await setCoreValue(page, 'test-input', 1.3);

      expect(await getCoreValue(page, 'test-input')).toBe(1.5); // 1.3 rounded to nearest 0.5
    });

    test('should handle exact step multiples', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        step: 5,
        forcestepdivisibility: 'round'
      });

      await setCoreValue(page, 'test-input', 25);

      expect(await getCoreValue(page, 'test-input')).toBe(25); // Already exact multiple
    });

    test('should normalize decimal precision after step divisibility', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', {
        step: 0.1,
        decimals: 1,
        forcestepdivisibility: 'round'
      });

      await setCoreValue(page, 'test-input', 1.23);

      expect(await getCoreValue(page, 'test-input')).toBe(1.2); // Rounded to 0.1, formatted to 1 decimal
    });
  });

  test.describe('Step Calculation Edge Cases', () => {

    test('should handle very large step values', async ({ page }) => {
      await initializeTouchSpinCore(page, 'test-input', { step: 1000000 });

      await coreUpOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(1000050); // 50 + 1000000
    });

    test('should handle very small decimal steps', async ({ page }) => {
      await setCoreValue(page, 'test-input', 0);
      await initializeTouchSpinCore(page, 'test-input', {
        step: 0.0001,
        decimals: 4
      });

      await coreUpOnce(page, 'test-input');

      expect(await getCoreValue(page, 'test-input')).toBe(0.0001);
    });

    test('should handle step with repeating decimals', async ({ page }) => {
      await setCoreValue(page, 'test-input', 0);
      await initializeTouchSpinCore(page, 'test-input', {
        step: 1/3,
        decimals: 3
      });

      await coreUpOnce(page, 'test-input');

      // Should handle floating point precision correctly
      const value = await getCoreValue(page, 'test-input');
      expect(Math.abs(value - 0.333)).toBeLessThan(0.001);
    });

    test('should maintain precision in complex step calculations', async ({ page }) => {
      await setCoreValue(page, 'test-input', 0.1);
      await initializeTouchSpinCore(page, 'test-input', {
        step: 0.2,
        decimals: 1
      });

      // Perform multiple operations to test floating point accumulation
      await coreUpOnce(page, 'test-input'); // 0.3
      await coreUpOnce(page, 'test-input'); // 0.5
      await coreDownOnce(page, 'test-input'); // 0.3

      expect(await getCoreValue(page, 'test-input')).toBe(0.3);
    });
  });
});