import type { Page } from '@playwright/test';
import type { TouchSpinCoreOptions } from '../tests/__shared__/helpers/types';
import { inputById } from '../tests/__shared__/helpers/core/selectors';
import { setupLogging } from '../tests/__shared__/helpers/events/setup';
import { coreUrl as coreRuntimeUrl } from '../tests/__shared__/helpers/runtime/paths';
import { installDomHelpers } from '../tests/__shared__/helpers/runtime/installDomHelpers';
import { preFetchCheck } from '../tests/__shared__/helpers/test-utilities/network';
import { readInputValue } from '../tests/__shared__/helpers/interactions/input';

/**
 * Core Package Test Adapter
 *
 * Provides Core-specific testing functionality for pure Core tests (without renderer).
 * These tests focus on core logic, state management, and validation.
 */

/**
 * Initialize TouchSpin Core instance directly (without renderer)
 *
 * IMPORTANT: This creates a Core instance without any renderer, so no buttons
 * will be created. Only keyboard/wheel events and API methods will work.
 */
export async function initializeTouchspin(
  page: Page,
  testId: string,
  options: Partial<TouchSpinCoreOptions> = {}
): Promise<void> {
  await installDomHelpers(page);
  await page.evaluate(() => { if (!window.__ts) throw new Error('__ts not installed'); });
  await setupLogging(page);

  // Pre-check that core module is fetchable
  await preFetchCheck(page, coreRuntimeUrl);

  // Separate callback functions from serializable options
  const { callback_before_calculation, callback_after_calculation, ...serializableOptions } = options;
  const hasCallbacks = !!(callback_before_calculation || callback_after_calculation);

  await page.evaluate(async ({ testId, options, coreUrl }) => {
    const origin = (globalThis as any).location?.origin ?? '';
    const url = new URL(coreUrl, origin).href;
    const { TouchSpinCore } = (await import(url)) as unknown as {
      TouchSpinCore: new (input: HTMLInputElement, opts: Partial<TouchSpinCoreOptions>) => unknown;
    };
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement | null;
    if (!input) throw new Error(`Input with testId "${testId}" not found`);

    // Set initial value if provided
    if (options.initval !== undefined) input.value = String(options.initval);

    const core = new TouchSpinCore(input, options);
    (input as unknown as Record<string, unknown>)['_touchSpinCore'] = core as unknown;

    // Initialize DOM event handling
    (core as { initDOMEventHandling: () => void }).initDOMEventHandling();

    // Core now dispatches DOM CustomEvents directly, no manual bridging needed
  }, { testId, options: serializableOptions, coreUrl: coreRuntimeUrl });

  // Set up callbacks after initialization if they exist
  if (hasCallbacks) {
    await page.evaluate(({ testId, beforeCalc, afterCalc }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
      const core = (input as any)._touchSpinCore;
      if (core && core.updateSettings) {
        const callbackOptions: any = {};
        if (beforeCalc) {
          // Recreate the callback function in the browser context
          callbackOptions.callback_before_calculation = new Function('value', beforeCalc) as (value: string) => string;
        }
        if (afterCalc) {
          // Recreate the callback function in the browser context
          callbackOptions.callback_after_calculation = new Function('value', afterCalc) as (value: string) => string;
        }
        core.updateSettings(callbackOptions);
      }
    }, {
      testId,
      beforeCalc: callback_before_calculation ? callback_before_calculation.toString().replace(/^[^{]*{/, '').replace(/}[^}]*$/, '') : null,
      afterCalc: callback_after_calculation ? callback_after_calculation.toString().replace(/^[^{]*{/, '').replace(/}[^}]*$/, '') : null
    });
  }

  // Wait for initialization to complete
  // Core sets data-touchspin-injected on the input element when ready
  const input = inputById(page, testId);
  await input.waitFor({ timeout: 5000 });
  await page.waitForFunction(
    ({ testId }) => {
      const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
      return input && input.hasAttribute('data-touchspin-injected');
    },
    { testId },
    { timeout: 5000 }
  );
}

/**
 * Get numeric value from Core internal state (different from display value)
 * Note: Use apiHelpers.getNumericValue() for display value, this gets Core's internal value
 */
export async function getCoreNumericValue(page: Page, testId: string): Promise<number> {
  const input = inputById(page, testId);
  return await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    return core.getValue();
  });
}

/**
 * Check if Core is initialized
 */
export async function isCoreInitialized(page: Page, testId: string): Promise<boolean> {
  const input = inputById(page, testId);
  return await input.evaluate((inputEl: HTMLInputElement) => {
    return !!((inputEl as any)._touchSpinCore);
  });
}

/**
 * Increment via keyboard (ArrowUp key)
 */
export async function incrementViaKeyboard(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.focus();
  await page.keyboard.press('ArrowUp');
}

/**
 * Decrement via keyboard (ArrowDown key)
 */
export async function decrementViaKeyboard(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.focus();
  await page.keyboard.press('ArrowDown');
}

/**
 * Increment via mouse wheel
 */
export async function incrementViaWheel(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.focus();
  await input.hover();
  await page.mouse.wheel(0, -100); // Wheel up
}

/**
 * Decrement via mouse wheel
 */
export async function decrementViaWheel(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.focus();
  await input.hover();
  await page.mouse.wheel(0, 100); // Wheel down
}

/**
 * Get the public API interface for the Core instance
 */
export async function getPublicAPI(page: Page, testId: string): Promise<any> {
  const input = inputById(page, testId);
  return await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);

    // Return the public API methods/properties
    return {
      getValue: typeof core.getValue === 'function',
      setValue: typeof core.setValue === 'function',
      upOnce: typeof core.upOnce === 'function',
      downOnce: typeof core.downOnce === 'function',
      startUpSpin: typeof core.startUpSpin === 'function',
      startDownSpin: typeof core.startDownSpin === 'function',
      stopSpin: typeof core.stopSpin === 'function',
      updateSettings: typeof core.updateSettings === 'function',
      destroy: typeof core.destroy === 'function'
    };
  });
}