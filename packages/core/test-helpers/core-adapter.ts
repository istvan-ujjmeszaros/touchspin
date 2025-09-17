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
  const touchspinHelpers = (await import('./helpers/touchspinHelpers')).default;
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