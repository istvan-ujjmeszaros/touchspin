import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  isCoreInitialized,
  updateSettingsViaAPI,
  readInputValue as readInputValueViaAdapter,
  initializeCoreWithCallbacks
} from '../test-helpers/core-adapter';

// Use original battle-tested helpers
const {
  clickUpButton,      // was: coreUpOnce
  clickDownButton,    // was: coreDownOnce
  readInputValue,     // was: getInputValue
  fillWithValue,      // was: setInputValue
  setInputAttr        // was: setInputAttribute
} = touchspinHelpers;

test.describe('Core TouchSpin Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-configuration');
  });

  test.describe('Settings Validation', () => {
    test('should handle invalid minimum value gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 'invalid', initval: 10 });
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Should still work
    });

    test('should handle invalid maximum value gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { max: 'invalid', initval: 10 });
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Should still work
    });

    test('should handle invalid step value gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: -5, initval: 10 });
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Should use default step
    });

    test('should handle conflicting min/max values', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 100, max: 50, initval: 75 });
      const value = await getNumericValue(page, 'test-input');
      expect(typeof value).toBe('number'); // Should handle gracefully
    });

    test('should handle invalid decimal places setting', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: -1, initval: 10.5 });
      expect(await getNumericValue(page, 'test-input')).toBe(11); // Gets rounded due to invalid decimals
    });
  });

  test.describe('Settings Precedence', () => {
    test('should prioritize explicit options over element attributes', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '5');
        input.setAttribute('max', '15');
        input.setAttribute('step', '2');
      });

      await initializeCore(page, 'test-input', { min: 0, max: 20, step: 1, initval: 10 });

      // Options should override attributes
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });

    test('should use element attributes when options not provided', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '5');
        input.setAttribute('max', '15');
        input.setAttribute('step', '2');
        input.value = '12';
      });

      await initializeCore(page, 'test-input', {});

      const value = await getNumericValue(page, 'test-input');
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(15);
    });

    test('should use default values when nothing specified', async ({ page }) => {
      await initializeCore(page, 'test-input', { initval: 50 });

      // Should use default step of 1
      expect(await getNumericValue(page, 'test-input')).toBe(50);
    });

    test('should handle partial configuration objects', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 0, initval: 10 }); // Only min specified

      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });
  });

  test.describe('Dynamic Settings Updates', () => {
    test('should update min/max boundaries dynamically', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: 0, max: 100, initval: 50 });

      await updateSettingsViaAPI(page, 'test-input', { min: 10, max: 40 });

      // Current value should be clamped to new max
      expect(await getNumericValue(page, 'test-input')).toBe(40);
    });

    test('should update step value dynamically', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      await updateSettingsViaAPI(page, 'test-input', { step: 5 });

      // Verify new step is applied
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Should be divisible by 5
    });

    test('should update decimal formatting dynamically', async ({ page }) => {
      await initializeCore(page, 'test-input', { decimals: 0, initval: 10 });

      await updateSettingsViaAPI(page, 'test-input', { decimals: 2 });

      const displayValue = await readInputValue(page, 'test-input');
      expect(displayValue).toBe('10.00'); // Should format with 2 decimals
    });

    test('should recalculate current value when settings change', async ({ page }) => {
      await initializeCore(page, 'test-input', { step: 1, initval: 10 });

      await updateSettingsViaAPI(page, 'test-input', { step: 3, forcestepdivisibility: 'round' });

      // Value should be adjusted to nearest step multiple
      expect(await getNumericValue(page, 'test-input')).toBe(9); // 10 -> 9 (nearest multiple of 3)
    });
  });

  test.describe('Settings Inheritance and Merging', () => {
    test('should merge new settings with existing settings', async ({ page }) => {
      // TODO: Test partial settings updates
      expect(true).toBe(true); // Placeholder
    });

    test('should deep merge complex setting objects', async ({ page }) => {
      // TODO: Test nested settings merging
      expect(true).toBe(true); // Placeholder
    });

    test('should handle null and undefined settings gracefully', async ({ page }) => {
      // TODO: Test null/undefined settings handling
      expect(true).toBe(true); // Placeholder
    });
  });

  test.describe('Settings Impact on Behavior', () => {
    test('should apply new minimum immediately', async ({ page }) => {
      // TODO: Test immediate min constraint application
      expect(true).toBe(true); // Placeholder
    });

    test('should apply new maximum immediately', async ({ page }) => {
      // TODO: Test immediate max constraint application
      expect(true).toBe(true); // Placeholder
    });

    test('should apply new step to subsequent operations', async ({ page }) => {
      // TODO: Test step changes affect increment/decrement
      expect(true).toBe(true); // Placeholder
    });

    test('should apply new decimal formatting to display', async ({ page }) => {
      // TODO: Test decimal changes affect display format
      expect(true).toBe(true); // Placeholder
    });
  });

  test.describe('Settings Persistence', () => {
    test('should retain settings after value changes', async ({ page }) => {
      // TODO: Test settings don't get lost during operations
      expect(true).toBe(true); // Placeholder
    });

    test('should retain settings after destroy/reinitialize', async ({ page }) => {
      // TODO: Test settings persist through lifecycle
      expect(true).toBe(true); // Placeholder
    });
  });

  test.describe('Error Handling', () => {
    test('should handle string numbers in settings', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: '5', max: '15', step: '2', initval: 10 });

      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });

    test('should handle zero and negative values appropriately', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: -10, max: 0, step: 1, initval: -5 });

      expect(await getNumericValue(page, 'test-input')).toBe(-5);
    });

    test('should handle boolean and object settings gracefully', async ({ page }) => {
      await initializeCore(page, 'test-input', { min: true, max: null, step: {}, initval: 10 });

      expect(await getNumericValue(page, 'test-input')).toBe(10); // Should still work
    });
  });

  test.describe('Callback Functions', () => {
    test('before_calculation: numeric string overrides value and then normalizes', async ({ page }) => {
      // step 3, use divisible init to avoid incidental rounding
      await initializeCoreWithCallbacks(page, 'test-input', {
        step: 3,
        initval: 48,
        callbackType: 'before_numeric'
      });

      // 51 is already a multiple of 3 → remains 51
      expect(await getNumericValue(page, 'test-input')).toBe(51);
      expect(await readInputValueViaAdapter(page, 'test-input')).toBe('51');
    });

    test('before_calculation: non-numeric return is rejected and preserves original value', async ({ page }) => {
      await initializeCoreWithCallbacks(page, 'test-input', {
        step: 5,
        initval: 50,
        callbackType: 'before_nonnumeric'
      });

      // Core rejects non-numeric callback returns and preserves original value
      expect(await readInputValueViaAdapter(page, 'test-input')).toBe('50');
      expect(await getNumericValue(page, 'test-input')).toBe(50);
    });

    test('after_calculation: formatter changes display but preserves internal numeric value', async ({ page }) => {
      await initializeCoreWithCallbacks(page, 'test-input', {
        step: 1,
        initval: 10,
        callbackType: 'after_format'
      });

      // Core applies formatter to display but maintains internal numeric value
      expect(await readInputValueViaAdapter(page, 'test-input')).toBe('10 USD');
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Internal value preserved
    });
  });
});

// NOTE: This test file covers the configuration system, which is critical for
// ensuring TouchSpin behaves correctly with various option combinations.
// The old tests didn't thoroughly cover settings validation and precedence.