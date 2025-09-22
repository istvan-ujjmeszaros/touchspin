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

    // Bridge Core internal events to DOM CustomEvents for test event logging
    const eventMap = {
      'min': 'touchspin.on.min',
      'max': 'touchspin.on.max',
      'startspin': 'touchspin.on.startspin',
      'startupspin': 'touchspin.on.startupspin',
      'startdownspin': 'touchspin.on.startdownspin',
      'stopspin': 'touchspin.on.stopspin',
      'stopupspin': 'touchspin.on.stopupspin',
      'stopdownspin': 'touchspin.on.stopdownspin'
    };

    Object.entries(eventMap).forEach(([coreEvent, domEvent]) => {
      (core as any).on(coreEvent, () => {
        const customEvent = new CustomEvent(domEvent, {
          detail: { testId, value: input.value },
          bubbles: true,
          cancelable: true
        });
        input.dispatchEvent(customEvent);
      });
    });
  }, { testId, options, coreUrl: coreRuntimeUrl });

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
 * Increment value via Core API (direct method call)
 */
export async function incrementViaAPI(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.upOnce();
  });
}

/**
 * Decrement value via Core API (direct method call)
 */
export async function decrementViaAPI(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.downOnce();
  });
}

/**
 * Start up spin via Core API
 */
export async function startUpSpinViaAPI(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.startUpSpin();
  });
}

/**
 * Start down spin via Core API
 */
export async function startDownSpinViaAPI(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.startDownSpin();
  });
}

/**
 * Stop spin via Core API
 */
export async function stopSpinViaAPI(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.stopSpin();
  });
}

/**
 * Set value via Core API
 */
export async function setValueViaAPI(page: Page, testId: string, value: number | string): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement, value) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.setValue(value);
  }, value);
}

/**
 * Get numeric value from Core
 */
export async function getNumericValue(page: Page, testId: string): Promise<number> {
  const input = inputById(page, testId);
  return await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    return core.getValue();
  });
}

/**
 * Update settings via Core API
 */
export async function updateSettingsViaAPI(
  page: Page,
  testId: string,
  settings: Partial<TouchSpinCoreOptions>
): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement, settings) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.updateSettings(settings);
  }, settings);
}

/**
 * Destroy Core instance
 */
export async function destroyCore(page: Page, testId: string): Promise<void> {
  const input = inputById(page, testId);
  await input.evaluate((inputEl: HTMLInputElement) => {
    const core = (inputEl as any)._touchSpinCore;
    if (!core) throw new Error(`Core not found for input`);
    core.destroy();
    delete (inputEl as any)._touchSpinCore;
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