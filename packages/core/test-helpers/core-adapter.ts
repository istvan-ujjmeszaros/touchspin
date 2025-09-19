/**
 * Thin adapter for Core TouchSpin tests
 * Uses battle-tested original helpers + minimal Core-specific functionality
 */

import { Page } from '@playwright/test';

// Initialize Core TouchSpin (since original uses jQuery)
export async function initializeCore(page: Page, testId: string, options: any = {}): Promise<void> {
  await page.evaluate(async ({ testId, options }) => {
    const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (!input) {
      throw new Error(`Input with testId "${testId}" not found`);
    }
    // Set initial value if specified
    if (options.initval !== undefined) {
      input.value = String(options.initval);
    }
    // Create Core instance directly and store on element
    const core = new TouchSpinCore(input, options);
    input._touchSpinCore = core;

    // Set up Core event listeners for event log
    const coreEvents = ['min', 'max', 'startspin', 'startupspin', 'startdownspin', 'stopspin', 'stopupspin', 'stopdownspin'];
    coreEvents.forEach(eventName => {
      core.on(eventName, () => {
        (window as any).logEvent(`touchspin.on.${eventName}`, {
          target: testId,
          value: input.value
        });
      });
    });

    // Listen for change events on the input
    input.addEventListener('change', () => {
      (window as any).logEvent('change', {
        target: testId,
        value: input.value
      });
    });

    // Initialize DOM event handling
    core.initDOMEventHandling();
  }, { testId, options });

  // Wait for Core to be fully initialized by checking for data-touchspin-injected attribute
  // This attribute is set on the input element after DOM construction and event attachment
  await page.waitForSelector(`[data-testid="${testId}"][data-touchspin-injected]`, {
    timeout: 5000
  });
}

// Get numeric value (convenience wrapper around readInputValue)
export async function getNumericValue(page: Page, testId: string): Promise<number> {
  const touchspinHelpers = await import('../../../__tests__/helpers/touchspinApiHelpers');
  const value = await touchspinHelpers.readInputValue(page, testId);
  return parseFloat(value) || 0;
}

// Set value programmatically via Core API
export async function setValueViaAPI(page: Page, testId: string, value: number | string): Promise<void> {
  await page.evaluate(({ testId, value }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.setValue(value);
  }, { testId, value });
}

// Destroy Core instance
export async function destroyCore(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.destroy();
  }, { testId });
}

// Check if Core is initialized
export async function isCoreInitialized(page: Page, testId: string): Promise<boolean> {
  return await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    return !!(input as any)._touchSpinCore;
  }, { testId });
}

// Increment value via Core API (no renderer needed)
export async function incrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.upOnce();
  }, { testId });
}

// Decrement value via Core API (no renderer needed)
export async function decrementViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.downOnce();
  }, { testId });
}

// Increment value via keyboard (arrow up key)
export async function incrementViaKeyboard(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  await input.focus();
  await input.press('ArrowUp');
}

// Decrement value via keyboard (arrow down key)
export async function decrementViaKeyboard(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  await input.focus();
  await input.press('ArrowDown');
}

// Increment value via mouse wheel (requires focus)
export async function incrementViaWheel(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  await input.focus();
  await input.hover();
  await page.mouse.wheel(0, -100); // Negative deltaY = up
}

// Decrement value via mouse wheel (requires focus)
export async function decrementViaWheel(page: Page, testId: string): Promise<void> {
  const input = page.locator(`[data-testid="${testId}"]`);
  await input.focus();
  await input.hover();
  await page.mouse.wheel(0, 100); // Positive deltaY = down
}

// Start up spin via Core API
export async function startUpSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.startUpSpin();
  }, { testId });
}

// Start down spin via Core API
export async function startDownSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.startDownSpin();
  }, { testId });
}

// Stop spin via Core API
export async function stopSpinViaAPI(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.stopSpin();
  }, { testId });
}

// Update settings via Core API
export async function updateSettingsViaAPI(page: Page, testId: string, newSettings: any): Promise<void> {
  await page.evaluate(({ testId, newSettings }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    core.updateSettings(newSettings);
  }, { testId, newSettings });
}

// Read input value as string (convenience wrapper)
export async function readInputValue(page: Page, testId: string): Promise<string> {
  const touchspinHelpers = await import('../../../__tests__/helpers/touchspinApiHelpers');
  return await touchspinHelpers.readInputValue(page, testId);
}

// Get public API surface for testing
export async function getPublicAPI(page: Page, testId: string): Promise<any> {
  return await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    const core = (input as any)._touchSpinCore;
    if (!core) {
      throw new Error(`TouchSpinCore not found on element with testId "${testId}"`);
    }
    return core.toPublicApi();
  }, { testId });
}

// Initialize Core TouchSpin with callback functions (requires different approach)
export async function initializeCoreWithCallbacks(page: Page, testId: string, options: any = {}): Promise<void> {
  await page.evaluate(async ({ testId, options }) => {
    const { TouchSpinCore } = await import('http://localhost:8866/packages/core/dist/index.js');
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (!input) {
      throw new Error(`Input with testId "${testId}" not found`);
    }

    // Set initial value if specified
    if (options.initval !== undefined) {
      input.value = String(options.initval);
    }

    // Handle callback functions by recreating them in the browser context
    const coreOptions = { ...options };
    if (options.callbackType === 'before_numeric') {
      coreOptions.callback_before_calculation = () => '51';
    } else if (options.callbackType === 'before_nonnumeric') {
      coreOptions.callback_before_calculation = () => 'abc';
    } else if (options.callbackType === 'after_format') {
      coreOptions.callback_after_calculation = (v: string | number) => `${v} USD`;
    }

    // Remove our custom property
    delete coreOptions.callbackType;

    // Create Core instance directly and store on element
    const core = new TouchSpinCore(input, coreOptions);
    input._touchSpinCore = core;

    // Set up Core event listeners for event log
    const coreEvents = ['min', 'max', 'startspin', 'startupspin', 'startdownspin', 'stopspin', 'stopupspin', 'stopdownspin'];
    coreEvents.forEach(eventName => {
      core.on(eventName, () => {
        (window as any).logEvent(`touchspin.on.${eventName}`, {
          target: testId,
          value: input.value
        });
      });
    });

    // Listen for change events on the input
    input.addEventListener('change', () => {
      (window as any).logEvent('change', {
        target: testId,
        value: input.value
      });
    });

    // Initialize DOM event handling
    core.initDOMEventHandling();
  }, { testId, options });

  // Wait for Core to be fully initialized by checking for data-touchspin-injected attribute
  await page.waitForSelector(`[data-testid="${testId}"][data-touchspin-injected]`, {
    timeout: 5000
  });
}
