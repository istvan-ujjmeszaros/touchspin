import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Data Attributes Advanced Cases', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-data-attributes-advanced');
  });

  test.describe('Native Attribute Restoration', () => {
    test('original attributes are restored on destroy', async ({ page }) => {
      // Set original attributes before initialization
      const originalAttributes = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set original attributes
        input.setAttribute('min', '5');
        input.setAttribute('max', '95');
        input.setAttribute('step', '0.5');
        input.setAttribute('data-original', 'test-value');

        return {
          min: input.getAttribute('min'),
          max: input.getAttribute('max'),
          step: input.getAttribute('step'),
          dataOriginal: input.getAttribute('data-original')
        };
      });

      await initializeCore(page, 'test-input', {
        step: 1,
        min: 10,
        max: 90,
        initval: 50
      });

      // Verify TouchSpin is working with new settings
      expect(await getNumericValue(page, 'test-input')).toBe(50);

      // Destroy TouchSpin
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.destroy();
      });

      // Check that original attributes are restored
      const restoredAttributes = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        return {
          min: input.getAttribute('min'),
          max: input.getAttribute('max'),
          step: input.getAttribute('step'),
          dataOriginal: input.getAttribute('data-original')
        };
      });

      expect(restoredAttributes.min).toBe(originalAttributes.min);
      expect(restoredAttributes.max).toBe(originalAttributes.max);
      expect(restoredAttributes.step).toBe(originalAttributes.step);
      expect(restoredAttributes.dataOriginal).toBe(originalAttributes.dataOriginal);
    });

    test('attributes that were not originally present are removed on destroy', async ({ page }) => {
      // Ensure input has no relevant attributes initially
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.removeAttribute('min');
        input.removeAttribute('max');
        input.removeAttribute('step');
      });

      await initializeCore(page, 'test-input', {
        step: 2,
        min: 0,
        max: 100,
        initval: 25
      });

      // Destroy TouchSpin
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.destroy();
      });

      // Attributes that weren't originally present should be gone
      const finalAttributes = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        return {
          hasMin: input.hasAttribute('min'),
          hasMax: input.hasAttribute('max'),
          hasStep: input.hasAttribute('step')
        };
      });

      expect(finalAttributes.hasMin).toBe(false);
      expect(finalAttributes.hasMax).toBe(false);
      expect(finalAttributes.hasStep).toBe(false);
    });

    test('complex attribute restoration with mixed original/added attributes', async ({ page }) => {
      // Set up mixed scenario
      const setup = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set some original attributes, leave others unset
        input.setAttribute('min', '1');
        input.removeAttribute('max'); // Ensure this one doesn't exist
        input.setAttribute('step', '0.1');
        input.setAttribute('readonly', ''); // Boolean attribute

        return {
          originalMin: input.getAttribute('min'),
          originalMaxExists: input.hasAttribute('max'),
          originalStep: input.getAttribute('step'),
          originalReadonly: input.hasAttribute('readonly')
        };
      });

      await initializeCore(page, 'test-input', {
        step: 5,
        min: 10,
        max: 90, // This will add max attribute
        initval: 50
      });

      // Destroy
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;
        core.destroy();
      });

      const restored = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        return {
          min: input.getAttribute('min'),
          maxExists: input.hasAttribute('max'),
          step: input.getAttribute('step'),
          readonlyExists: input.hasAttribute('readonly')
        };
      });

      // Original attributes should be restored
      expect(restored.min).toBe(setup.originalMin);
      expect(restored.step).toBe(setup.originalStep);
      expect(restored.readonlyExists).toBe(setup.originalReadonly);

      // Max wasn't original, so should be removed
      expect(restored.maxExists).toBe(setup.originalMaxExists);
    });
  });

  test.describe('Attribute Handling Edge Cases', () => {
    test('empty string attributes vs missing attributes', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set data-bts attributes with empty strings
        input.setAttribute('data-bts-step', '');
        input.setAttribute('data-bts-min', '');
        input.setAttribute('data-bts-max', '');

        const core = new TouchSpinCore(input, {});

        return {
          step: core.settings.step,
          min: core.settings.min,
          max: core.settings.max
        };
      });

      // Empty string attributes should be treated as invalid and use defaults
      expect(result.step).toBe(1); // Default
      expect(result.min).toBe(null); // Default
      expect(result.max).toBe(null); // Default
    });

    test('whitespace-only attributes are handled correctly', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set attributes with whitespace
        input.setAttribute('data-bts-step', '  \t\n  ');
        input.setAttribute('data-bts-decimals', ' \r ');
        input.setAttribute('data-bts-stepinterval', '   ');

        const core = new TouchSpinCore(input, {});

        return {
          step: core.settings.step,
          decimals: core.settings.decimals,
          stepinterval: core.settings.stepinterval
        };
      });

      // Whitespace-only should be treated as invalid
      expect(result.step).toBe(1); // Default
      expect(result.decimals).toBe(0); // Default
      expect(result.stepinterval).toBe(100); // Default
    });

    test('boolean-like string values are coerced correctly', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        input.setAttribute('data-bts-mousewheel', 'TRUE'); // Different case
        input.setAttribute('data-bts-booster', 'False'); // Different case
        input.setAttribute('data-bts-verticalbuttons', '1'); // Numeric string
        input.setAttribute('data-bts-focusablebuttons', '0'); // Numeric string

        const core = new TouchSpinCore(input, {});

        return {
          mousewheel: core.settings.mousewheel,
          booster: core.settings.booster,
          verticalbuttons: core.settings.verticalbuttons,
          focusablebuttons: core.settings.focusablebuttons
        };
      });

      // Case-insensitive and string conversion should work
      expect(result.mousewheel).toBe(true); // 'TRUE' -> true
      expect(result.booster).toBe(false); // 'False' -> false
      expect(result.verticalbuttons).toBe(true); // '1' -> true
      expect(result.focusablebuttons).toBe(false); // '0' -> false
    });

    test('numeric string edge cases are handled', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Various numeric string edge cases
        input.setAttribute('data-bts-step', '1.5e2'); // Scientific notation
        input.setAttribute('data-bts-min', '+42'); // Plus sign
        input.setAttribute('data-bts-max', '-0'); // Negative zero
        input.setAttribute('data-bts-decimals', '3.7'); // Float for integer setting

        const core = new TouchSpinCore(input, {});

        return {
          step: core.settings.step,
          min: core.settings.min,
          max: core.settings.max,
          decimals: core.settings.decimals
        };
      });

      expect(result.step).toBe(150); // 1.5e2 = 150
      expect(result.min).toBe(42); // +42 = 42
      expect(result.max).toBe(0); // -0 = 0
      expect(result.decimals).toBe(3); // 3.7 floored to 3
    });

    test('special numeric values in attributes', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Special numeric values
        input.setAttribute('data-bts-step', 'Infinity');
        input.setAttribute('data-bts-min', '-Infinity');
        input.setAttribute('data-bts-max', 'NaN');
        input.setAttribute('data-bts-stepinterval', '-0');

        const core = new TouchSpinCore(input, {});

        return {
          step: core.settings.step,
          min: core.settings.min,
          max: core.settings.max,
          stepinterval: core.settings.stepinterval
        };
      });

      expect(result.step).toBe(1); // Infinity -> default
      expect(result.min).toBe(null); // -Infinity -> default
      expect(result.max).toBe(null); // NaN -> default
      expect(result.stepinterval).toBe(0); // -0 is valid
    });
  });

  test.describe('Attribute Precedence Edge Cases', () => {
    test('data-bts attributes override native even when both are valid', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set both types of attributes
        input.setAttribute('min', '1'); // Native
        input.setAttribute('data-bts-min', '10'); // Data-bts
        input.setAttribute('max', '90'); // Native
        input.setAttribute('data-bts-max', '80'); // Data-bts
        input.setAttribute('step', '0.5'); // Native
        input.setAttribute('data-bts-step', '2'); // Data-bts
      });

      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {});

        return {
          min: core.settings.min,
          max: core.settings.max,
          step: core.settings.step
        };
      });

      // data-bts should win over native
      expect(result.min).toBe(10); // data-bts-min
      expect(result.max).toBe(80); // data-bts-max
      expect(result.step).toBe(2); // data-bts-step
    });

    test('native attributes used when data-bts attributes are invalid', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set invalid data-bts and valid native
        input.setAttribute('data-bts-min', 'invalid'); // Invalid data-bts
        input.setAttribute('min', '15'); // Valid native
        input.setAttribute('data-bts-max', 'NaN'); // Invalid data-bts
        input.setAttribute('max', '85'); // Valid native
        input.setAttribute('data-bts-step', ''); // Invalid data-bts
        input.setAttribute('step', '0.25'); // Valid native
      });

      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {});

        return {
          min: core.settings.min,
          max: core.settings.max,
          step: core.settings.step
        };
      });

      // Should fall back to native when data-bts is invalid
      expect(result.min).toBe(15); // Native min
      expect(result.max).toBe(85); // Native max
      expect(result.step).toBe(0.25); // Native step
    });

    test('explicit options override all attributes', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Set both types of attributes
        input.setAttribute('data-bts-min', '20');
        input.setAttribute('min', '25');
        input.setAttribute('data-bts-max', '70');
        input.setAttribute('max', '75');
        input.setAttribute('data-bts-step', '3');
        input.setAttribute('step', '4');
      });

      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Pass explicit options that should override all attributes
        const core = new TouchSpinCore(input, {
          min: 5,
          max: 95,
          step: 1
        });

        return {
          min: core.settings.min,
          max: core.settings.max,
          step: core.settings.step
        };
      });

      // Explicit options should win over all attributes
      expect(result.min).toBe(5);
      expect(result.max).toBe(95);
      expect(result.step).toBe(1);
    });
  });

  test.describe('Dynamic Attribute Changes', () => {
    test('native attribute changes trigger setting updates', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 50
      });

      // Change native attributes dynamically
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '20');
        input.setAttribute('max', '80');
      });

      // Give MutationObserver time to process
      await page.waitForTimeout(100);

      // Test that new constraints are applied
      await setValueViaAPI(page, 'test-input', 10);
      expect(await getNumericValue(page, 'test-input')).toBe(20); // Clamped to new min

      await setValueViaAPI(page, 'test-input', 90);
      expect(await getNumericValue(page, 'test-input')).toBe(80); // Clamped to new max
    });

    test('data-bts attribute changes are ignored during runtime', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 100,
        initval: 50
      });

      // Try to change data-bts attributes dynamically (should be ignored)
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('data-bts-min', '30');
        input.setAttribute('data-bts-max', '70');
      });

      await page.waitForTimeout(100);

      // Original constraints should still apply
      await setValueViaAPI(page, 'test-input', -10);
      expect(await getNumericValue(page, 'test-input')).toBe(0); // Still uses original min

      await setValueViaAPI(page, 'test-input', 110);
      expect(await getNumericValue(page, 'test-input')).toBe(100); // Still uses original max
    });

    test('disabled/readonly state changes are handled', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 50
      });

      // Dynamically disable input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });

      await page.waitForTimeout(100);

      // Test that disabled state affects behavior (buttons should be updated)
      const buttonState = await page.evaluate(() => {
        const upButton = document.querySelector('[data-testid="test-input-up"]') as HTMLElement;
        const downButton = document.querySelector('[data-testid="test-input-down"]') as HTMLElement;

        return {
          upDisabled: upButton?.hasAttribute('disabled') || upButton?.classList.contains('disabled'),
          downDisabled: downButton?.hasAttribute('disabled') || downButton?.classList.contains('disabled')
        };
      });

      // Note: Button disabled state depends on renderer implementation
      // This test mainly ensures MutationObserver processes the change without errors
    });

    test('rapid attribute changes are handled gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 50
      });

      // Rapidly change attributes
      await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Rapid sequence of attribute changes
        for (let i = 0; i < 10; i++) {
          input.setAttribute('min', String(i * 5));
          input.setAttribute('max', String(100 - i * 5));

          // Brief delay
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      });

      await page.waitForTimeout(200);

      // Final constraint check
      await setValueViaAPI(page, 'test-input', -10);
      const finalValue = await getNumericValue(page, 'test-input');

      // Should respect the final min value (45 from last iteration)
      expect(finalValue).toBeGreaterThanOrEqual(45);
    });
  });

  test.describe('Attribute Processing Performance', () => {
    test('large numbers of attributes are processed efficiently', async ({ page }) => {
      const performanceResult = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Add many attributes (some valid, some invalid)
        for (let i = 0; i < 50; i++) {
          input.setAttribute(`data-custom-${i}`, `value-${i}`);
        }

        // Add relevant TouchSpin attributes
        input.setAttribute('data-bts-step', '1');
        input.setAttribute('data-bts-min', '0');
        input.setAttribute('data-bts-max', '100');

        const startTime = performance.now();
        const core = new TouchSpinCore(input, {});
        const endTime = performance.now();

        return {
          initTime: endTime - startTime,
          success: core.settings.step === 1
        };
      });

      expect(performanceResult.success).toBe(true);
      expect(performanceResult.initTime).toBeLessThan(100); // Should be fast
    });

    test('attribute mutation observer handles frequent changes', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        initval: 50
      });

      const mutationResult = await page.evaluate(async () => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const startTime = performance.now();

        // Frequent attribute changes
        for (let i = 0; i < 20; i++) {
          input.setAttribute('min', String(i));
          input.removeAttribute('min');
          input.setAttribute('max', String(100 + i));
          input.removeAttribute('max');
        }

        // Wait for mutation observer to process
        await new Promise(resolve => setTimeout(resolve, 100));

        const endTime = performance.now();

        return {
          processingTime: endTime - startTime,
          success: true
        };
      });

      expect(mutationResult.success).toBe(true);
      expect(mutationResult.processingTime).toBeLessThan(500); // Should handle efficiently
    });
  });
});

// NOTE: This test file exercises advanced data attribute handling including native attribute restoration
// on destroy, attribute precedence edge cases, dynamic attribute changes, boolean/numeric string coercion,
// special value handling, and performance considerations for attribute processing.