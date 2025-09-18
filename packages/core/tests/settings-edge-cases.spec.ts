import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Settings Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-settings-edge-cases');
  });

  test.describe('Global Default Options', () => {
    test('TouchSpinDefaultOptions global variable is used when available', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // Set global default options
        (globalThis as any).TouchSpinDefaultOptions = {
          step: 25,
          min: 100,
          max: 1000,
          decimals: 2
        };

        // Import and create core instance
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Create instance without explicit options (should use global defaults)
        const core = new TouchSpinCore(input, {});

        return {
          step: core.settings.step,
          min: core.settings.min,
          max: core.settings.max,
          decimals: core.settings.decimals
        };
      });

      expect(result.step).toBe(25);
      expect(result.min).toBe(100);
      expect(result.max).toBe(1000);
      expect(result.decimals).toBe(2);

      // Clean up global variable
      await page.evaluate(() => {
        delete (globalThis as any).TouchSpinDefaultOptions;
      });
    });

    test('TouchSpinDefaultRenderer global variable is used when available', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // Create mock renderer
        const mockRenderer = {
          init: () => {},
          teardown: () => {},
          finalizeWrapperAttributes: () => {}
        };

        // Set global default renderer
        (globalThis as any).TouchSpinDefaultRenderer = mockRenderer;

        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Create instance without explicit renderer
        const core = new TouchSpinCore(input, {});

        return {
          rendererIsGlobal: core.settings.renderer === mockRenderer
        };
      });

      expect(result.rendererIsGlobal).toBe(true);

      // Clean up global variable
      await page.evaluate(() => {
        delete (globalThis as any).TouchSpinDefaultRenderer;
      });
    });

    test('global defaults are sanitized before use', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // Set global defaults with invalid values
        (globalThis as any).TouchSpinDefaultOptions = {
          step: -5, // Invalid: negative
          min: Infinity, // Invalid: Infinity
          max: NaN, // Invalid: NaN
          decimals: -1, // Invalid: negative
          stepinterval: -100, // Invalid: negative
          stepintervaldelay: NaN // Invalid: NaN
        };

        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {});

        return {
          step: core.settings.step,
          min: core.settings.min,
          max: core.settings.max,
          decimals: core.settings.decimals,
          stepinterval: core.settings.stepinterval,
          stepintervaldelay: core.settings.stepintervaldelay
        };
      });

      // Invalid values should be sanitized to defaults
      expect(result.step).toBe(1); // Default for invalid step
      expect(result.min).toBe(null); // Default for invalid min
      expect(result.max).toBe(null); // Default for invalid max
      expect(result.decimals).toBe(0); // Default for invalid decimals
      expect(result.stepinterval).toBe(100); // Default for invalid stepinterval
      expect(result.stepintervaldelay).toBe(500); // Default for invalid stepintervaldelay

      // Clean up
      await page.evaluate(() => {
        delete (globalThis as any).TouchSpinDefaultOptions;
      });
    });
  });

  test.describe('Settings Sanitization Edge Cases', () => {
    test('step sanitization handles various invalid values', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          negativeStep: TouchSpinCore.sanitizePartialSettings({ step: -5 }, DEFAULTS).step,
          zeroStep: TouchSpinCore.sanitizePartialSettings({ step: 0 }, DEFAULTS).step,
          infinityStep: TouchSpinCore.sanitizePartialSettings({ step: Infinity }, DEFAULTS).step,
          nanStep: TouchSpinCore.sanitizePartialSettings({ step: NaN }, DEFAULTS).step,
          validStep: TouchSpinCore.sanitizePartialSettings({ step: 2.5 }, DEFAULTS).step
        };
      });

      expect(results.negativeStep).toBe(1); // Default
      expect(results.zeroStep).toBe(1); // Default
      expect(results.infinityStep).toBe(1); // Default
      expect(results.nanStep).toBe(1); // Default
      expect(results.validStep).toBe(2.5); // Valid value preserved
    });

    test('decimals sanitization handles various invalid values', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          negativeDecimals: TouchSpinCore.sanitizePartialSettings({ decimals: -3 }, DEFAULTS).decimals,
          floatDecimals: TouchSpinCore.sanitizePartialSettings({ decimals: 2.7 }, DEFAULTS).decimals,
          infinityDecimals: TouchSpinCore.sanitizePartialSettings({ decimals: Infinity }, DEFAULTS).decimals,
          nanDecimals: TouchSpinCore.sanitizePartialSettings({ decimals: NaN }, DEFAULTS).decimals,
          validDecimals: TouchSpinCore.sanitizePartialSettings({ decimals: 3 }, DEFAULTS).decimals
        };
      });

      expect(results.negativeDecimals).toBe(0); // Default
      expect(results.floatDecimals).toBe(2); // Floored to integer
      expect(results.infinityDecimals).toBe(0); // Default
      expect(results.nanDecimals).toBe(0); // Default
      expect(results.validDecimals).toBe(3); // Valid value preserved
    });

    test('stepinterval sanitization handles invalid values', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          negativeInterval: TouchSpinCore.sanitizePartialSettings({ stepinterval: -50 }, DEFAULTS).stepinterval,
          zeroInterval: TouchSpinCore.sanitizePartialSettings({ stepinterval: 0 }, DEFAULTS).stepinterval,
          nanInterval: TouchSpinCore.sanitizePartialSettings({ stepinterval: NaN }, DEFAULTS).stepinterval,
          validInterval: TouchSpinCore.sanitizePartialSettings({ stepinterval: 250 }, DEFAULTS).stepinterval
        };
      });

      expect(results.negativeInterval).toBe(100); // Default
      expect(results.zeroInterval).toBe(0); // Zero is valid (no interval)
      expect(results.nanInterval).toBe(100); // Default
      expect(results.validInterval).toBe(250); // Valid value preserved
    });

    test('stepintervaldelay sanitization handles invalid values', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');

        const DEFAULTS = { step: 1, decimals: 0, min: null, max: null, stepinterval: 100, stepintervaldelay: 500 };

        return {
          negativeDelay: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: -200 }, DEFAULTS).stepintervaldelay,
          zeroDelay: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: 0 }, DEFAULTS).stepintervaldelay,
          nanDelay: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: NaN }, DEFAULTS).stepintervaldelay,
          validDelay: TouchSpinCore.sanitizePartialSettings({ stepintervaldelay: 1000 }, DEFAULTS).stepintervaldelay
        };
      });

      expect(results.negativeDelay).toBe(500); // Default
      expect(results.zeroDelay).toBe(0); // Zero is valid (immediate)
      expect(results.nanDelay).toBe(500); // Default
      expect(results.validDelay).toBe(1000); // Valid value preserved
    });
  });

  test.describe('Runtime Min/Max Swapping', () => {
    test('min greater than max triggers swapping during initialization', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '50'; // Set initial value
      });

      // Initialize with min > max
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          min: 100, // min > max should trigger swap
          max: 10,
          initval: 50
        });

        return {
          min: core.settings.min,
          max: core.settings.max,
          initialValue: core.getValue()
        };
      });

      // Min and max should be swapped
      expect(result.min).toBe(10); // Original max becomes min
      expect(result.max).toBe(100); // Original min becomes max
      expect(result.initialValue).toBe(50); // Value within swapped bounds
    });

    test('min/max swapping works during settings updates', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 10,
        max: 90,
        initval: 50
      });

      // Update with inverted bounds
      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Update with min > max
        core.updateSettings({
          min: 80, // Greater than current max of 90... wait, let me fix this
          max: 20  // Less than current min of 10
        });

        return {
          min: core.settings.min,
          max: core.settings.max,
          currentValue: core.getValue()
        };
      });

      // Should swap the values
      expect(result.min).toBe(20); // Original max becomes min
      expect(result.max).toBe(80); // Original min becomes max

      // Current value should be adjusted if needed
      expect(result.currentValue).toBeGreaterThanOrEqual(20);
      expect(result.currentValue).toBeLessThanOrEqual(80);
    });

    test('equal min and max values are handled correctly', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          min: 42,
          max: 42, // Same as min
          initval: 50
        });

        return {
          min: core.settings.min,
          max: core.settings.max,
          value: core.getValue()
        };
      });

      expect(result.min).toBe(42);
      expect(result.max).toBe(42);
      expect(result.value).toBe(42); // Should be clamped to the single valid value
    });

    test('swap detection considers null boundaries', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Test various null boundary combinations
        const test1 = new TouchSpinCore(input, { min: null, max: 10 });
        const test2 = new TouchSpinCore(input, { min: 10, max: null });
        const test3 = new TouchSpinCore(input, { min: null, max: null });

        return {
          test1Min: test1.settings.min,
          test1Max: test1.settings.max,
          test2Min: test2.settings.min,
          test2Max: test2.settings.max,
          test3Min: test3.settings.min,
          test3Max: test3.settings.max
        };
      });

      // Null boundaries should not trigger swapping
      expect(results.test1Min).toBe(null);
      expect(results.test1Max).toBe(10);
      expect(results.test2Min).toBe(10);
      expect(results.test2Max).toBe(null);
      expect(results.test3Min).toBe(null);
      expect(results.test3Max).toBe(null);
    });
  });

  test.describe('Initialization Value Setting Edge Cases', () => {
    test('initval is set when input is empty', async ({ page }) => {
      // Clear the input first
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '';
      });

      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 99
        });

        return {
          inputValue: input.value,
          coreValue: core.getValue()
        };
      });

      expect(result.inputValue).toBe('99');
      expect(result.coreValue).toBe(99);
    });

    test('initval is not set when input has existing value', async ({ page }) => {
      // Set existing value in input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '42';
      });

      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 1,
          initval: 99 // Should be ignored
        });

        return {
          inputValue: input.value,
          coreValue: core.getValue()
        };
      });

      expect(result.inputValue).toBe('42'); // Original value preserved
      expect(result.coreValue).toBe(42);
    });

    test('initval with invalid value is sanitized', async ({ page }) => {
      // Clear the input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.value = '';
      });

      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, {
          step: 5,
          forcestepdivisibility: 'round',
          min: 0,
          max: 100,
          initval: 123 // Exceeds max and not divisible by step
        });

        return {
          inputValue: input.value,
          coreValue: core.getValue()
        };
      });

      expect(result.coreValue).toBe(100); // Clamped to max
      expect(result.inputValue).toBe('100');
    });
  });

  test.describe('Settings Update Edge Cases', () => {
    test('updateSettings sanitizes partial settings during runtime', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 0,
        max: 100,
        initval: 50
      });

      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        // Update with invalid settings
        core.updateSettings({
          step: -5, // Invalid
          decimals: -2, // Invalid
          stepinterval: NaN, // Invalid
          min: Infinity, // Invalid
          max: 'not-a-number' // Invalid
        });

        return {
          step: core.settings.step,
          decimals: core.settings.decimals,
          stepinterval: core.settings.stepinterval,
          min: core.settings.min,
          max: core.settings.max
        };
      });

      // Invalid values should be sanitized
      expect(result.step).toBe(1); // Sanitized to default
      expect(result.decimals).toBe(0); // Sanitized to default
      expect(result.stepinterval).toBe(100); // Sanitized to default
      expect(result.min).toBe(null); // Invalid min becomes null
      expect(result.max).toBe(null); // Invalid max becomes null
    });

    test('updateSettings handles empty/null partial settings', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        min: 10,
        max: 90,
        decimals: 2,
        initval: 50
      });

      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        const originalSettings = { ...core.settings };

        // Update with empty object
        core.updateSettings({});

        return {
          settingsUnchanged: (
            core.settings.step === originalSettings.step &&
            core.settings.min === originalSettings.min &&
            core.settings.max === originalSettings.max &&
            core.settings.decimals === originalSettings.decimals
          )
        };
      });

      expect(result.settingsUnchanged).toBe(true);
    });

    test('updateSettings with null parameter uses empty object', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 5,
        initval: 50
      });

      const result = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        const originalStep = core.settings.step;

        try {
          // Pass null as settings
          core.updateSettings(null);
          return {
            success: true,
            stepUnchanged: core.settings.step === originalStep
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });

      expect(result.success).toBe(true);
      expect(result.stepUnchanged).toBe(true); // Should treat null as empty object
    });
  });

  test.describe('Settings Observer Integration', () => {
    test('setting observers are notified during sanitization changes', async ({ page }) => {
      await initializeCore(page, 'test-input', {
        step: 1,
        min: 10,
        max: 90,
        initval: 50
      });

      const observerResult = await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        const core = (input as any)._touchSpinCore;

        let minObserverCalls = 0;
        let maxObserverCalls = 0;
        let lastMinValue: any = undefined;
        let lastMaxValue: any = undefined;

        // Observe min and max changes
        core.observeSetting('min', (newVal: any) => {
          minObserverCalls++;
          lastMinValue = newVal;
        });

        core.observeSetting('max', (newVal: any) => {
          maxObserverCalls++;
          lastMaxValue = newVal;
        });

        // Update with swapped min/max
        core.updateSettings({
          min: 100, // Will become max
          max: 5    // Will become min
        });

        return {
          minObserverCalls: minObserverCalls,
          maxObserverCalls: maxObserverCalls,
          lastMinValue: lastMinValue,
          lastMaxValue: lastMaxValue,
          actualMin: core.settings.min,
          actualMax: core.settings.max
        };
      });

      expect(observerResult.minObserverCalls).toBeGreaterThan(0);
      expect(observerResult.maxObserverCalls).toBeGreaterThan(0);
      expect(observerResult.actualMin).toBe(5); // Swapped
      expect(observerResult.actualMax).toBe(100); // Swapped
    });
  });
});

// NOTE: This test file exercises settings edge cases including global default options/renderer handling,
// sanitization of invalid step/decimals/interval values, min/max swapping logic, initval setting behavior,
// runtime settings updates with sanitization, and integration with the settings observer system.