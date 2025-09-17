import { Page, expect } from '@playwright/test';

/**
 * Core-specific test helpers for TouchSpin Core package
 * These helpers work directly with the core API without any wrapper
 */

/**
 * Initialize TouchSpin Core on an input element
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param options TouchSpin options
 */
export async function initializeTouchSpinCore(page: Page, testId: string, options: any = {}): Promise<void> {
  await page.evaluate(async ({ testId, options }) => {
    // Import the core module from dist - use absolute URL
    const { TouchSpin } = await import('http://localhost:8866/packages/core/dist/index.js');

    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (!input) {
      throw new Error(`Input with testid "${testId}" not found`);
    }

    // Initialize TouchSpin with options
    const api = TouchSpin(input, options);

    // Store API reference on window for test access
    if (!window.touchSpinInstances) {
      window.touchSpinInstances = new Map();
    }
    window.touchSpinInstances.set(testId, api);

    return api;
  }, { testId, options });
}

/**
 * Get TouchSpin Core API for an input
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function getTouchSpinCoreAPI(page: Page, testId: string): Promise<any> {
  return await page.evaluate(({ testId }) => {
    if (!window.touchSpinInstances || !window.touchSpinInstances.has(testId)) {
      throw new Error(`TouchSpin instance for "${testId}" not found`);
    }
    return window.touchSpinInstances.get(testId);
  }, { testId });
}

/**
 * Check if TouchSpin Core is initialized on an input
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function isTouchSpinCoreInitialized(page: Page, testId: string): Promise<boolean> {
  return await page.evaluate(({ testId }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    return !!(input && (input as any)._touchSpinCore);
  }, { testId });
}

/**
 * Destroy TouchSpin Core instance
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function destroyTouchSpinCore(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    if (window.touchSpinInstances && window.touchSpinInstances.has(testId)) {
      const api = window.touchSpinInstances.get(testId);
      api.destroy();
      window.touchSpinInstances.delete(testId);
    }
  }, { testId });
}

/**
 * Get value using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function getCoreValue(page: Page, testId: string): Promise<number> {
  return await page.evaluate(({ testId }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    return api.getValue();
  }, { testId });
}

/**
 * Set value using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param value Value to set
 */
export async function setCoreValue(page: Page, testId: string, value: number | string): Promise<void> {
  await page.evaluate(({ testId, value }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    api.setValue(value);
  }, { testId, value });
}

/**
 * Trigger upOnce using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function coreUpOnce(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    api.upOnce();
  }, { testId });
}

/**
 * Trigger downOnce using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function coreDownOnce(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    api.downOnce();
  }, { testId });
}

/**
 * Start up spin using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function coreStartUpSpin(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    api.startUpSpin();
  }, { testId });
}

/**
 * Start down spin using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function coreStartDownSpin(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    api.startDownSpin();
  }, { testId });
}

/**
 * Stop spin using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function coreStopSpin(page: Page, testId: string): Promise<void> {
  await page.evaluate(({ testId }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    api.stopSpin();
  }, { testId });
}

/**
 * Update settings using Core API
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param settings Settings to update
 */
export async function coreUpdateSettings(page: Page, testId: string, settings: any): Promise<void> {
  await page.evaluate(({ testId, settings }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);
    api.updateSettings(settings);
  }, { testId, settings });
}

/**
 * Subscribe to Core event
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param eventName Name of the event
 * @param handlerName Name to store handler under
 */
export async function coreSubscribeEvent(page: Page, testId: string, eventName: string, handlerName: string): Promise<void> {
  await page.evaluate(({ testId, eventName, handlerName }) => {
    const api = window.touchSpinInstances?.get(testId);
    if (!api) throw new Error(`TouchSpin instance for "${testId}" not found`);

    // Store event handlers on window for cleanup
    if (!window.coreEventHandlers) {
      window.coreEventHandlers = new Map();
    }

    const handler = (detail: any) => {
      window.logEvent(`touchspin.on.${eventName}`, {
        target: testId,
        detail: detail
      });
    };

    const unsubscribe = api.on(eventName, handler);
    window.coreEventHandlers.set(`${testId}-${handlerName}`, { handler, unsubscribe });
  }, { testId, eventName, handlerName });
}

/**
 * Unsubscribe from Core event
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param handlerName Name of the handler to remove
 */
export async function coreUnsubscribeEvent(page: Page, testId: string, handlerName: string): Promise<void> {
  await page.evaluate(({ testId, handlerName }) => {
    if (!window.coreEventHandlers) return;

    const key = `${testId}-${handlerName}`;
    const handlerInfo = window.coreEventHandlers.get(key);
    if (handlerInfo) {
      handlerInfo.unsubscribe();
      window.coreEventHandlers.delete(key);
    }
  }, { testId, handlerName });
}

/**
 * Get input value directly from DOM
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function getInputValue(page: Page, testId: string): Promise<string> {
  const input = page.getByTestId(testId);
  return await input.inputValue();
}

/**
 * Set input value directly on DOM
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param value Value to set
 */
export async function setInputValue(page: Page, testId: string, value: string): Promise<void> {
  const input = page.getByTestId(testId);
  await input.fill(value);
}

/**
 * Focus an input element
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function focusInput(page: Page, testId: string): Promise<void> {
  const input = page.getByTestId(testId);
  await input.focus();
}

/**
 * Blur an input element by focusing on another element
 * @param page Playwright page object
 * @param testId Test ID of the input element
 */
export async function blurInput(page: Page, testId: string): Promise<void> {
  // Focus on blur target to blur the input
  const blurTarget = page.getByTestId('blur-target');
  await blurTarget.focus();
}

/**
 * Trigger keyboard event on input
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param key Key to press
 */
export async function pressKey(page: Page, testId: string, key: string): Promise<void> {
  const input = page.getByTestId(testId);
  await input.press(key);
}

/**
 * Set input disabled state
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param disabled Whether to disable
 */
export async function setInputDisabled(page: Page, testId: string, disabled: boolean): Promise<void> {
  await page.evaluate(({ testId, disabled }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (input) {
      input.disabled = disabled;
    }
  }, { testId, disabled });
}

/**
 * Set input readonly state
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param readonly Whether to make readonly
 */
export async function setInputReadonly(page: Page, testId: string, readonly: boolean): Promise<void> {
  await page.evaluate(({ testId, readonly }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (input) {
      if (readonly) {
        input.setAttribute('readonly', '');
      } else {
        input.removeAttribute('readonly');
      }
    }
  }, { testId, readonly });
}

/**
 * Set native input attribute
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param attribute Attribute name
 * @param value Attribute value
 */
export async function setInputAttribute(page: Page, testId: string, attribute: string, value: string | null): Promise<void> {
  await page.evaluate(({ testId, attribute, value }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    if (input) {
      if (value === null) {
        input.removeAttribute(attribute);
      } else {
        input.setAttribute(attribute, value);
      }
    }
  }, { testId, attribute, value });
}

/**
 * Get native input attribute
 * @param page Playwright page object
 * @param testId Test ID of the input element
 * @param attribute Attribute name
 */
export async function getInputAttribute(page: Page, testId: string, attribute: string): Promise<string | null> {
  return await page.evaluate(({ testId, attribute }) => {
    const input = document.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
    return input ? input.getAttribute(attribute) : null;
  }, { testId, attribute });
}

/**
 * Wait for a specific time
 * @param ms Milliseconds to wait
 */
export async function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a new test input dynamically
 * @param page Playwright page object
 * @param testId Test ID for the new input
 * @param options Input options
 */
export async function createTestInput(page: Page, testId: string, options: any = {}): Promise<void> {
  await page.evaluate(({ testId, options }) => {
    if (typeof window.createTestInput === 'function') {
      window.createTestInput(testId, options);
    } else {
      throw new Error('createTestInput function not available on this page');
    }
  }, { testId, options });
}

/**
 * Clear any generated test inputs
 * @param page Playwright page object
 */
export async function clearGeneratedInputs(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (typeof window.clearGeneratedInputs === 'function') {
      window.clearGeneratedInputs();
    }
  });
}

export default {
  initializeTouchSpinCore,
  getTouchSpinCoreAPI,
  isTouchSpinCoreInitialized,
  destroyTouchSpinCore,
  getCoreValue,
  setCoreValue,
  coreUpOnce,
  coreDownOnce,
  coreStartUpSpin,
  coreStartDownSpin,
  coreStopSpin,
  coreUpdateSettings,
  coreSubscribeEvent,
  coreUnsubscribeEvent,
  getInputValue,
  setInputValue,
  focusInput,
  blurInput,
  pressKey,
  setInputDisabled,
  setInputReadonly,
  setInputAttribute,
  getInputAttribute,
  waitFor,
  createTestInput,
  clearGeneratedInputs
};