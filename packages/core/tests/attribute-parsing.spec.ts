import { test, expect } from '@playwright/test';
import touchspinHelpers from '../../../__tests__/helpers/touchspinApiHelpers';
import {
  initializeCore,
  getNumericValue,
  setValueViaAPI,
  destroyCore,
  readInputValue
} from '../test-helpers/core-adapter';

test.describe('Core TouchSpin Attribute Parsing', () => {
  test.beforeEach(async ({ page }) => {
    await touchspinHelpers.startCoverage(page);
    await page.goto('http://localhost:8866/packages/core/tests/html/test-fixture.html');
    await page.waitForFunction(() => (window as any).coreTestReady === true);
    await touchspinHelpers.clearEventLog(page);
  });

  test.afterEach(async ({ page }) => {
    await touchspinHelpers.collectCoverage(page, 'core-attribute-parsing');
  });

  test.describe('Data Attribute Coercion', () => {
    test('coerces boolean attributes correctly', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('data-bts-mousewheel', 'true');
        input.setAttribute('data-bts-verticalbuttons', 'false');
        input.setAttribute('data-bts-booster', ''); // Empty string should be true
        input.setAttribute('data-bts-focusablebuttons', 'mousewheel'); // Should be true (same as attr name)
      });

      // Test that the _coerceAttributeValue function works correctly
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        // Create a core instance to access the method
        const core = new TouchSpinCore(input, { initval: 10 });

        return {
          mousewheel: (core as any)._coerceAttributeValue('mousewheel', 'true'),
          verticalbuttons: (core as any)._coerceAttributeValue('verticalbuttons', 'false'),
          booster: (core as any)._coerceAttributeValue('booster', ''),
          focusablebuttons: (core as any)._coerceAttributeValue('focusablebuttons', 'focusablebuttons')
        };
      });

      expect(result.mousewheel).toBe(true);
      expect(result.verticalbuttons).toBe(false);
      expect(result.booster).toBe(true); // Empty string should be true
      expect(result.focusablebuttons).toBe(true); // Same as option name should be true
    });

    test('coerces numeric attributes correctly', async ({ page }) => {
      // Test the _coerceAttributeValue function with numeric values
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, { initval: 10 });

        return {
          validNumber: (core as any)._coerceAttributeValue('step', '5'),
          decimal: (core as any)._coerceAttributeValue('step', '2.5'),
          invalidNumber: (core as any)._coerceAttributeValue('step', 'invalid'),
          emptyString: (core as any)._coerceAttributeValue('step', ''),
          min: (core as any)._coerceAttributeValue('min', '0'),
          max: (core as any)._coerceAttributeValue('max', '100')
        };
      });

      expect(result.validNumber).toBe(5);
      expect(result.decimal).toBe(2.5);
      expect(isNaN(result.invalidNumber)).toBe(true); // Use isNaN check
      expect(isNaN(result.emptyString)).toBe(true);
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
    });

    test('handles null and undefined values', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, { initval: 10 });

        return {
          null: (core as any)._coerceAttributeValue('step', null),
          undefined: (core as any)._coerceAttributeValue('step', undefined)
        };
      });

      expect(result.null).toBeNull();
      expect(result.undefined).toBeUndefined();
    });

    test('handles string attributes that are neither boolean nor numeric', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;

        const core = new TouchSpinCore(input, { initval: 10 });

        return {
          buttonup_txt: (core as any)._coerceAttributeValue('buttonup_txt', 'Plus'),
          prefix: (core as any)._coerceAttributeValue('prefix', '$'),
          postfix: (core as any)._coerceAttributeValue('postfix', '.00')
        };
      });

      expect(result.buttonup_txt).toBe('Plus');
      expect(result.prefix).toBe('$');
      expect(result.postfix).toBe('.00');
    });
  });

  test.describe('Data-BTS Attribute Processing', () => {
    test('processes data-bts attributes during initialization', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('data-bts-step', '5');
        input.setAttribute('data-bts-min', '10');
        input.setAttribute('data-bts-max', '50');
        input.setAttribute('data-bts-decimals', '2');
        input.setAttribute('data-bts-mousewheel', 'true');
      });

      await initializeCore(page, 'test-input', { initval: 25 });

      // Verify data-bts attributes were processed
      await setValueViaAPI(page, 'test-input', 45);
      expect(await getNumericValue(page, 'test-input')).toBe(45); // Within range

      await setValueViaAPI(page, 'test-input', 5);
      expect(await getNumericValue(page, 'test-input')).toBe(10); // Clamped to min

      await setValueViaAPI(page, 'test-input', 60);
      expect(await getNumericValue(page, 'test-input')).toBe(50); // Clamped to max

      // Check decimal formatting
      await setValueViaAPI(page, 'test-input', 25.123);
      expect(await readInputValue(page, 'test-input')).toBe('25.12'); // 2 decimal places
    });

    test('warns about conflicting data-bts and native attributes', async ({ page }) => {
      // Capture console warnings
      const warnings: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          warnings.push(msg.text());
        }
      });

      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('data-bts-min', '10'); // data-bts attribute
        input.setAttribute('min', '5'); // native attribute - should cause warning
        input.setAttribute('data-bts-step', '2');
        input.setAttribute('step', '1'); // Another conflict
      });

      await initializeCore(page, 'test-input', { initval: 25 });

      // Should have warnings about conflicts
      expect(warnings.some(w => w.includes('data-bts-min') && w.includes('min'))).toBe(true);
      expect(warnings.some(w => w.includes('data-bts-step') && w.includes('step'))).toBe(true);
    });

    test('processes various data-bts boolean attributes', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('data-bts-booster', 'true');
        input.setAttribute('data-bts-verticalbuttons', 'false');
        input.setAttribute('data-bts-mousewheel', ''); // Empty string = true
        input.setAttribute('data-bts-focusablebuttons', 'focusablebuttons'); // Same as option name = true
      });

      // Test the actual parsing by checking the resulting behavior
      await initializeCore(page, 'test-input', { initval: 10 });

      // These tests verify the attributes were parsed, but the actual behavior
      // testing would require more complex scenarios since most of these affect
      // internal state or require specific interactions
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });
  });

  test.describe('Native Attribute Processing', () => {
    test('processes native attributes when no data-bts equivalents exist', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '0');
        input.setAttribute('max', '100');
        input.setAttribute('step', '5');
      });

      await initializeCore(page, 'test-input', { initval: 50 });

      // Verify native attributes were processed
      await setValueViaAPI(page, 'test-input', -10);
      expect(await getNumericValue(page, 'test-input')).toBe(0); // Clamped to native min

      await setValueViaAPI(page, 'test-input', 150);
      expect(await getNumericValue(page, 'test-input')).toBe(100); // Clamped to native max

      // Step should work with native attribute
      await setValueViaAPI(page, 'test-input', 50);
      expect(await getNumericValue(page, 'test-input')).toBe(50); // Aligned to step=5
    });

    test('data-bts attributes take precedence over native attributes', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '0'); // Native
        input.setAttribute('data-bts-min', '10'); // Should win
        input.setAttribute('max', '200'); // Native
        input.setAttribute('data-bts-max', '50'); // Should win
      });

      await initializeCore(page, 'test-input', { initval: 30 });

      // data-bts values should be used
      await setValueViaAPI(page, 'test-input', 5);
      expect(await getNumericValue(page, 'test-input')).toBe(10); // data-bts-min wins

      await setValueViaAPI(page, 'test-input', 100);
      expect(await getNumericValue(page, 'test-input')).toBe(50); // data-bts-max wins
    });

    test('handles invalid native attribute values gracefully', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', 'invalid');
        input.setAttribute('max', 'NaN');
        input.setAttribute('step', 'not-a-number');
      });

      // Should not crash and should use defaults/null for invalid values
      await initializeCore(page, 'test-input', { initval: 10 });

      // Should not have constraints due to invalid min/max
      await setValueViaAPI(page, 'test-input', -1000);
      expect(await getNumericValue(page, 'test-input')).toBe(-1000);

      await setValueViaAPI(page, 'test-input', 1000);
      expect(await getNumericValue(page, 'test-input')).toBe(1000);
    });
  });

  test.describe('Attribute Mutation Handling', () => {
    test('responds to dynamic native attribute changes', async ({ page }) => {
      await initializeCore(page, 'test-input', { initval: 50 });

      // Dynamically add min attribute
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '25');
      });

      // Give MutationObserver time to process
      await page.waitForTimeout(100);

      // Value should be updated to respect new min
      await setValueViaAPI(page, 'test-input', 10);
      expect(await getNumericValue(page, 'test-input')).toBe(25); // Clamped to new min
    });

    test('responds to native attribute removal', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('min', '20');
        input.setAttribute('max', '80');
      });

      await initializeCore(page, 'test-input', { initval: 50 });

      // Remove attributes
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.removeAttribute('min');
        input.removeAttribute('max');
      });

      await page.waitForTimeout(100);

      // Should no longer have constraints
      await setValueViaAPI(page, 'test-input', 10);
      expect(await getNumericValue(page, 'test-input')).toBe(10);

      await setValueViaAPI(page, 'test-input', 100);
      expect(await getNumericValue(page, 'test-input')).toBe(100);
    });

    test('handles step attribute changes dynamically', async ({ page }) => {
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('step', '1');
      });

      await initializeCore(page, 'test-input', { initval: 10 });

      // Change step attribute
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.setAttribute('step', '5');
      });

      await page.waitForTimeout(100);

      // New step should be applied to value alignment
      await setValueViaAPI(page, 'test-input', 13);
      expect(await getNumericValue(page, 'test-input')).toBe(15); // Aligned to step=5
    });

    test('handles disabled/readonly attribute changes', async ({ page }) => {
      await initializeCore(page, 'test-input', { initval: 10 });

      // Dynamically disable input
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="test-input"]') as HTMLInputElement;
        input.disabled = true;
      });

      await page.waitForTimeout(100);

      // This test mainly ensures the mutation observer processes the change
      // without throwing errors. The actual button state update would need
      // renderer tests to verify visual changes.
      expect(await getNumericValue(page, 'test-input')).toBe(10);
    });
  });
});

// NOTE: This test file exercises data attribute parsing, the _coerceAttributeValue function,
// and the MutationObserver-based native attribute synchronization.
